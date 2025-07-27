import OpenAI from "openai";
import { ParsedResumeData } from "./resume-parser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface EnhancedResumeData extends ParsedResumeData {
  // AI-enhanced fields
  careerProgression: {
    level: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
    yearsOfExperience: number;
    progressionRate: 'fast' | 'steady' | 'slow';
    careerPath: string[];
  };
  skillAssessment: {
    technicalSkills: SkillCategory[];
    softSkills: SkillCategory[];
    domainExpertise: string[];
    skillGaps: string[];
  };
  careerGoals: {
    suggestedRoles: string[];
    careerAdvice: string;
    nextSkillsToLearn: string[];
  };
  matchingInsights: {
    strengthAreas: string[];
    improvementAreas: string[];
    uniqueSellingPoints: string[];
  };
}

export interface SkillCategory {
  category: string;
  skills: Array<{
    name: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    yearsOfExperience?: number;
  }>;
}

export async function analyzeResumeWithAI(resumeText: string): Promise<EnhancedResumeData> {
  try {
    // First get basic parsed data
    const basicData = await parseBasicResumeData(resumeText);
    
    // Then enhance with AI analysis
    const [careerAnalysis, skillAnalysis, careerGuidance] = await Promise.all([
      analyzeCareerProgression(resumeText),
      analyzeSkillProficiency(resumeText),
      generateCareerGuidance(resumeText, basicData)
    ]);

    return {
      ...basicData,
      careerProgression: careerAnalysis,
      skillAssessment: skillAnalysis,
      careerGoals: careerGuidance.goals,
      matchingInsights: careerGuidance.insights
    };
  } catch (error) {
    console.error('AI resume analysis failed:', error);
    // Fallback to basic analysis
    const basicData = await parseBasicResumeData(resumeText);
    return {
      ...basicData,
      careerProgression: {
        level: 'mid',
        yearsOfExperience: 3,
        progressionRate: 'steady',
        careerPath: []
      },
      skillAssessment: {
        technicalSkills: [],
        softSkills: [],
        domainExpertise: [],
        skillGaps: []
      },
      careerGoals: {
        suggestedRoles: [],
        careerAdvice: '',
        nextSkillsToLearn: []
      },
      matchingInsights: {
        strengthAreas: [],
        improvementAreas: [],
        uniqueSellingPoints: []
      }
    };
  }
}

async function parseBasicResumeData(resumeText: string): Promise<ParsedResumeData> {
  const prompt = `
Analyze this resume and extract structured information:

${resumeText}

Return a JSON object with:
- skills: Array of technical and professional skills
- keywords: Array of relevant keywords
- experienceLevel: One of "junior", "mid", "senior", "lead", "vp", "executive"
- preferredLocations: Array of locations (if mentioned)
- summary: 2-3 sentence summary
- education: Array of degrees/certifications
- workExperience: Array of jobs with company, position, duration, description
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert resume parser. Extract structured data and respond only with valid JSON."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content?.replace(/```json|```/gi, '').trim();
  if (!content) throw new Error("No response from OpenAI");
  
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch (parseError) {
    console.error('JSON parsing failed for content:', content.substring(0, 200), '...');
    console.error('Parse error:', parseError);
    // Return a safe fallback structure
    throw new Error('Invalid JSON response from AI analysis');
  }
  
  return {
    skills: Array.isArray(parsed.skills) ? parsed.skills : [],
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
    experienceLevel: ['junior', 'mid', 'senior', 'lead', 'vp', 'executive'].includes(parsed.experienceLevel) 
      ? parsed.experienceLevel : 'mid',
    preferredLocations: Array.isArray(parsed.preferredLocations) ? parsed.preferredLocations : [],
    summary: typeof parsed.summary === 'string' ? parsed.summary : 'No summary available',
    education: Array.isArray(parsed.education) ? parsed.education : [],
    workExperience: Array.isArray(parsed.workExperience) ? parsed.workExperience : [],
    rawText: resumeText
  };
}

async function analyzeCareerProgression(resumeText: string) {
  const prompt = `
Analyze the career progression in this resume:

${resumeText}

Evaluate:
1. Years of experience (estimate from work history)
2. Career progression rate (how quickly they've advanced)
3. Career path taken (sequence of roles/companies)
4. Current level assessment

Return JSON with:
{
  "level": "junior|mid|senior|lead|executive",
  "yearsOfExperience": number,
  "progressionRate": "fast|steady|slow", 
  "careerPath": ["role1", "role2", "role3"]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a career progression analyst. Provide detailed career insights."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content?.replace(/```json|```/gi, '').trim();
  
  try {
    return JSON.parse(content || '{}');
  } catch (parseError) {
    console.error('Career progression JSON parsing failed:', content?.substring(0, 200));
    console.error('Parse error:', parseError);
    return {
      level: "mid",
      yearsOfExperience: 3,
      progressionRate: "steady",
      careerPath: []
    };
  }
}

async function analyzeSkillProficiency(resumeText: string) {
  const prompt = `
Analyze the skills in this resume and categorize them by proficiency:

${resumeText}

Categorize skills into:
1. Technical skills (programming, tools, technologies)
2. Soft skills (leadership, communication, etc.)
3. Domain expertise (industry knowledge)
4. Skill gaps (what might be missing for career growth)

For each skill, estimate proficiency level based on context, projects, and years mentioned.

Return JSON with:
{
  "technicalSkills": [
    {
      "category": "Programming Languages",
      "skills": [
        {"name": "JavaScript", "proficiency": "advanced", "yearsOfExperience": 5},
        {"name": "Python", "proficiency": "intermediate", "yearsOfExperience": 2}
      ]
    }
  ],
  "softSkills": [similar structure],
  "domainExpertise": ["Financial Services", "Healthcare"],
  "skillGaps": ["Cloud Architecture", "Machine Learning"]
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a skills assessment expert. Analyze skill proficiency levels accurately."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content?.replace(/```json|```/gi, '').trim();
  
  try {
    return JSON.parse(content || '{}');
  } catch (parseError) {
    console.error('Skills analysis JSON parsing failed:', content?.substring(0, 200));
    console.error('Parse error:', parseError);
    return {
      technicalSkills: [],
      softSkills: [],
      domainExpertise: [],
      skillGaps: []
    };
  }
}

async function generateCareerGuidance(resumeText: string, basicData: ParsedResumeData) {
  const prompt = `
Based on this resume, provide career guidance:

${resumeText}

Current experience level: ${basicData.experienceLevel}
Current skills: ${basicData.skills.join(', ')}

Provide:
1. 5 suggested roles they could pursue next
2. Career advice for their next move
3. Skills they should learn to advance
4. Their key strengths for job matching
5. Areas for improvement
6. Unique selling points

Return JSON with:
{
  "goals": {
    "suggestedRoles": ["Senior Software Engineer", "Technical Lead"],
    "careerAdvice": "Focus on leadership skills and system design...",
    "nextSkillsToLearn": ["System Design", "Team Leadership"]
  },
  "insights": {
    "strengthAreas": ["Full-stack development", "Problem solving"],
    "improvementAreas": ["Leadership experience", "Public speaking"],
    "uniqueSellingPoints": ["Strong technical foundation", "Cross-functional experience"]
  }
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a career counselor providing personalized guidance."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content?.replace(/```json|```/gi, '').trim();
  
  try {
    return JSON.parse(content || '{}');
  } catch (parseError) {
    console.error('Career guidance JSON parsing failed:', content?.substring(0, 200));
    console.error('Parse error:', parseError);
    return {
      goals: {
        suggestedRoles: [],
        careerAdvice: "Unable to generate career advice at this time",
        nextSkillsToLearn: []
      },
      insights: {
        strengthAreas: [],
        improvementAreas: [],
        uniqueSellingPoints: []
      }
    };
  }
}

export async function generateJobMatchExplanation(
  candidateData: EnhancedResumeData,
  jobDescription: string,
  jobTitle: string,
  requiredSkills: string[]
): Promise<{
  matchScore: number;
  explanation: string;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}> {
  const prompt = `
Compare this candidate profile with the job requirements:

CANDIDATE:
Experience Level: ${candidateData.experienceLevel}
Skills: ${candidateData.skills.join(', ')}
Summary: ${candidateData.summary}
Strengths: ${candidateData.matchingInsights.strengthAreas.join(', ')}

JOB:
Title: ${jobTitle}
Required Skills: ${requiredSkills.join(', ')}
Description: ${jobDescription.substring(0, 500)}...

Analyze the match and provide:
1. Match score (0-100)
2. Detailed explanation of why they match/don't match
3. Skills that align
4. Missing skills
5. Recommendations for the candidate

Return JSON with the exact structure requested.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert job matching analyst. Provide detailed, accurate assessments."
      },
      { role: "user", content: prompt }
    ],
    temperature: 0.2,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content?.replace(/```json|```/gi, '').trim();
  const result = JSON.parse(content || '{}');
  
  return {
    matchScore: result.matchScore || 0,
    explanation: result.explanation || '',
    matchingSkills: Array.isArray(result.matchingSkills) ? result.matchingSkills : [],
    missingSkills: Array.isArray(result.missingSkills) ? result.missingSkills : [],
    recommendations: Array.isArray(result.recommendations) ? result.recommendations : []
  };
}
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
CRITICAL: Return ONLY valid JSON. No explanations.

Resume: ${resumeText.substring(0, 1000)}

Return exactly:
{
  "level": "mid",
  "yearsOfExperience": 3,
  "progressionRate": "steady", 
  "careerPath": ["role1", "role2"]
}

JSON ONLY:`;

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
CRITICAL: Return ONLY valid JSON. No explanations.

Resume: ${resumeText.substring(0, 1000)}

Return exactly:
{
  "technicalSkills": [{"category": "Programming", "skills": [{"name": "JavaScript", "proficiency": "intermediate", "yearsOfExperience": 3}]}],
  "softSkills": [{"category": "Communication", "skills": [{"name": "Leadership", "proficiency": "intermediate", "yearsOfExperience": 2}]}],
  "domainExpertise": ["Technology"],
  "skillGaps": ["Advanced skills"]
}

JSON ONLY:`;

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
CRITICAL: Return ONLY valid JSON. No explanations.

Resume: ${resumeText.substring(0, 800)}
Level: ${basicData.experienceLevel}
Skills: ${basicData.skills.slice(0, 5).join(', ')}

Return exactly:
{
  "goals": {
    "suggestedRoles": ["Role1", "Role2"],
    "careerAdvice": "Brief advice",
    "nextSkillsToLearn": ["Skill1", "Skill2"]
  },
  "insights": {
    "strengthAreas": ["Strength1"],
    "improvementAreas": ["Area1"],
    "uniqueSellingPoints": ["Point1"]
  }
}

JSON ONLY:`;

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
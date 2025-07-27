import OpenAI from "openai";
import { EnhancedResumeData } from "./ai-resume-analyzer";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Job {
  id: number;
  title: string;
  description: string;
  company: string;
  location: string;
  department: string;
  seniority_level: string;
  required_skills: string[];
  preferred_skills: string[];
  employment_type: string;
  salary_min?: number;
  salary_max?: number;
  remote_eligible: number;
}

export interface AIJobMatch {
  job: Job;
  matchScore: number;
  explanation: string;
  matchingSkills: string[];
  missingSkills: string[];
  strengthAlignment: string[];
  careerFitScore: number;
  salaryAlignment: 'below' | 'within' | 'above' | 'unknown';
  recommendations: string[];
}

export interface JobMatchingResult {
  matches: AIJobMatch[];
  overallInsights: {
    bestMatches: AIJobMatch[];
    skillGapAnalysis: string[];
    careerAdvice: string;
    marketInsights: string;
  };
}

export class AIJobMatcher {
  private embeddingsCache = new Map<string, number[]>();

  async generateJobMatches(
    candidateData: EnhancedResumeData,
    jobs: Job[],
    limit: number = 20
  ): Promise<JobMatchingResult> {
    try {
      // Generate embeddings for candidate profile
      const candidateEmbedding = await this.getCandidateEmbedding(candidateData);

      // Process jobs in parallel for efficiency
      const jobMatchPromises = jobs.map(job => 
        this.analyzeJobMatch(candidateData, job, candidateEmbedding)
      );

      const jobMatches = await Promise.all(jobMatchPromises);

      // Sort by combined score (semantic similarity + AI analysis)
      const sortedMatches = jobMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      // Generate overall insights
      const overallInsights = await this.generateOverallInsights(
        candidateData,
        sortedMatches
      );

      return {
        matches: sortedMatches,
        overallInsights
      };
    } catch (error) {
      console.error('AI job matching failed:', error);
      // Fallback to basic matching
      return this.fallbackMatching(candidateData, jobs, limit);
    }
  }

  private async getCandidateEmbedding(candidateData: EnhancedResumeData): Promise<number[]> {
    const profileText = this.createCandidateProfileText(candidateData);
    const cacheKey = `candidate_${this.hashString(profileText)}`;

    if (this.embeddingsCache.has(cacheKey)) {
      return this.embeddingsCache.get(cacheKey)!;
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: profileText,
    });

    const embedding = response.data[0].embedding;
    this.embeddingsCache.set(cacheKey, embedding);
    return embedding;
  }

  private async getJobEmbedding(job: Job): Promise<number[]> {
    const jobText = this.createJobProfileText(job);
    const cacheKey = `job_${job.id}_${this.hashString(jobText)}`;

    if (this.embeddingsCache.has(cacheKey)) {
      return this.embeddingsCache.get(cacheKey)!;
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: jobText,
    });

    const embedding = response.data[0].embedding;
    this.embeddingsCache.set(cacheKey, embedding);
    return embedding;
  }

  private createCandidateProfileText(candidateData: EnhancedResumeData): string {
    return `
      Experience Level: ${candidateData.experienceLevel}
      Years of Experience: ${candidateData.careerProgression?.yearsOfExperience || 0}
      Skills: ${candidateData.skills.join(', ')}
      Career Summary: ${candidateData.summary}
      Technical Skills: ${candidateData.skillAssessment?.technicalSkills?.map(cat => 
        cat.skills.map(skill => `${skill.name} (${skill.proficiency})`).join(', ')
      ).join('; ') || ''}
      Domain Expertise: ${candidateData.skillAssessment?.domainExpertise?.join(', ') || ''}
      Career Path: ${candidateData.careerProgression?.careerPath?.join(' -> ') || ''}
      Strengths: ${candidateData.matchingInsights?.strengthAreas?.join(', ') || ''}
    `.trim();
  }

  private createJobProfileText(job: Job): string {
    return `
      Job Title: ${job.title}
      Company: ${job.company}
      Department: ${job.department}
      Seniority Level: ${job.seniority_level}
      Employment Type: ${job.employment_type}
      Remote Eligible: ${job.remote_eligible ? 'Yes' : 'No'}
      Location: ${job.location}
      Required Skills: ${job.required_skills.join(', ')}
      Preferred Skills: ${job.preferred_skills?.join(', ') || ''}
      Job Description: ${job.description}
    `.trim();
  }

  private calculateSemanticSimilarity(embedding1: number[], embedding2: number[]): number {
    // Cosine similarity
    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
    
    return dotProduct / (magnitude1 * magnitude2);
  }

  private async analyzeJobMatch(
    candidateData: EnhancedResumeData,
    job: Job,
    candidateEmbedding: number[]
  ): Promise<AIJobMatch> {
    // Get semantic similarity
    const jobEmbedding = await this.getJobEmbedding(job);
    const semanticSimilarity = this.calculateSemanticSimilarity(candidateEmbedding, jobEmbedding);

    // AI-powered detailed analysis
    const aiAnalysis = await this.getAIJobAnalysis(candidateData, job);

    // Calculate combined match score (semantic + AI analysis)
    const matchScore = Math.round(
      (semanticSimilarity * 30 + aiAnalysis.matchScore * 0.7) * 100
    );

    // Analyze salary alignment
    const salaryAlignment = this.analyzeSalaryAlignment(
      candidateData.careerProgression?.yearsOfExperience || 0,
      candidateData.experienceLevel,
      job.salary_min,
      job.salary_max
    );

    // Calculate career fit score
    const careerFitScore = this.calculateCareerFit(candidateData, job);

    return {
      job,
      matchScore: Math.min(100, Math.max(0, matchScore)),
      explanation: aiAnalysis.explanation,
      matchingSkills: aiAnalysis.matchingSkills,
      missingSkills: aiAnalysis.missingSkills,
      strengthAlignment: this.findStrengthAlignment(candidateData, job),
      careerFitScore,
      salaryAlignment,
      recommendations: aiAnalysis.recommendations
    };
  }

  private async getAIJobAnalysis(candidateData: EnhancedResumeData, job: Job) {
    const prompt = `
Analyze the match between this candidate and job:

CANDIDATE:
- Experience: ${candidateData.experienceLevel} (${candidateData.careerProgression?.yearsOfExperience || 0} years)
- Skills: ${candidateData.skills.join(', ')}
- Summary: ${candidateData.summary}
- Strengths: ${candidateData.matchingInsights?.strengthAreas?.join(', ') || ''}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Level: ${job.seniority_level}
- Required Skills: ${job.required_skills.join(', ')}
- Description: ${job.description.substring(0, 400)}...

Provide a detailed analysis with:
1. Match score (0-100)
2. Explanation of fit
3. Matching skills
4. Missing skills
5. Specific recommendations

Return JSON only.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert job matching analyst. Provide precise, actionable insights."
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

  private analyzeSalaryAlignment(
    yearsExp: number,
    level: string,
    salaryMin?: number,
    salaryMax?: number
  ): 'below' | 'within' | 'above' | 'unknown' {
    if (!salaryMin || !salaryMax) return 'unknown';

    // Rough salary expectations based on experience
    const expectedSalary = this.estimateExpectedSalary(yearsExp, level);
    const avgJobSalary = (salaryMin + salaryMax) / 2;

    if (avgJobSalary < expectedSalary * 0.8) return 'below';
    if (avgJobSalary > expectedSalary * 1.2) return 'above';
    return 'within';
  }

  private estimateExpectedSalary(yearsExp: number, level: string): number {
    const baseSalaries = {
      junior: 60000,
      mid: 90000,
      senior: 130000,
      lead: 160000,
      vp: 250000,
      executive: 350000
    };

    const base = baseSalaries[level as keyof typeof baseSalaries] || baseSalaries.mid;
    return base + (yearsExp * 5000); // Rough increase per year
  }

  private calculateCareerFit(candidateData: EnhancedResumeData, job: Job): number {
    let fitScore = 50; // Base score

    // Experience level alignment
    const levelAlignment = this.getLevelAlignment(candidateData.experienceLevel, job.seniority_level);
    fitScore += levelAlignment;

    // Skills overlap
    const skillsOverlap = this.calculateSkillsOverlap(candidateData.skills, job.required_skills);
    fitScore += skillsOverlap * 20;

    // Career progression fit
    if (candidateData.careerProgression?.careerPath) {
      const careerFit = this.assessCareerProgression(candidateData.careerProgression.careerPath, job.title);
      fitScore += careerFit;
    }

    return Math.min(100, Math.max(0, fitScore));
  }

  private getLevelAlignment(candidateLevel: string, jobLevel: string): number {
    const levels = ['junior', 'mid', 'senior', 'lead', 'vp', 'executive'];
    const candidateIndex = levels.indexOf(candidateLevel);
    const jobIndex = levels.indexOf(jobLevel);
    
    if (candidateIndex === -1 || jobIndex === -1) return 0;
    
    const diff = Math.abs(candidateIndex - jobIndex);
    if (diff === 0) return 30; // Perfect match
    if (diff === 1) return 15; // One level difference
    if (diff === 2) return -10; // Two levels difference
    return -20; // More than two levels
  }

  private calculateSkillsOverlap(candidateSkills: string[], requiredSkills: string[]): number {
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());
    
    const matchingSkills = requiredSkillsLower.filter(skill => 
      candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
      )
    );
    
    return requiredSkills.length > 0 ? matchingSkills.length / requiredSkills.length : 0;
  }

  private assessCareerProgression(careerPath: string[], jobTitle: string): number {
    // Simple heuristic: if the job title represents a logical next step
    const lastRole = careerPath[careerPath.length - 1]?.toLowerCase() || '';
    const targetRole = jobTitle.toLowerCase();
    
    if (targetRole.includes(lastRole) || lastRole.includes(targetRole)) return 15;
    if (targetRole.includes('senior') && lastRole.includes('junior')) return 10;
    if (targetRole.includes('lead') && lastRole.includes('senior')) return 10;
    return 0;
  }

  private findStrengthAlignment(candidateData: EnhancedResumeData, job: Job): string[] {
    const strengths = candidateData.matchingInsights?.strengthAreas || [];
    const jobRequirements = [...job.required_skills, job.title, job.department].map(s => s.toLowerCase());
    
    return strengths.filter(strength => 
      jobRequirements.some(req => 
        req.includes(strength.toLowerCase()) || strength.toLowerCase().includes(req)
      )
    );
  }

  private async generateOverallInsights(
    candidateData: EnhancedResumeData,
    matches: AIJobMatch[]
  ) {
    const bestMatches = matches.slice(0, 5);
    
    // Analyze skill gaps across top matches
    const allMissingSkills = matches.flatMap(m => m.missingSkills);
    const skillGapAnalysis = [...new Set(allMissingSkills)]
      .filter(skill => allMissingSkills.filter(s => s === skill).length >= 3)
      .slice(0, 5);

    // Generate AI insights
    const prompt = `
Based on job matching results for a ${candidateData.experienceLevel} candidate:

Top matching job titles: ${bestMatches.map(m => m.job.title).join(', ')}
Common missing skills: ${skillGapAnalysis.join(', ')}
Candidate strengths: ${candidateData.matchingInsights?.strengthAreas?.join(', ') || ''}

Provide:
1. Career advice for this candidate
2. Market insights about their profile

Keep it concise and actionable.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a career advisor providing market insights." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    const insights = response.choices[0]?.message?.content || '';

    return {
      bestMatches,
      skillGapAnalysis,
      careerAdvice: insights.split('\n')[0] || '',
      marketInsights: insights.split('\n').slice(1).join(' ') || ''
    };
  }

  private fallbackMatching(candidateData: EnhancedResumeData, jobs: Job[], limit: number): JobMatchingResult {
    // Simple fallback matching based on skill overlap
    const matches = jobs.map(job => {
      const skillsOverlap = this.calculateSkillsOverlap(candidateData.skills, job.required_skills);
      const matchScore = Math.round(skillsOverlap * 100);

      return {
        job,
        matchScore,
        explanation: `Basic match based on ${Math.round(skillsOverlap * 100)}% skill overlap`,
        matchingSkills: job.required_skills.filter(skill => 
          candidateData.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
        ),
        missingSkills: job.required_skills.filter(skill => 
          !candidateData.skills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
        ),
        strengthAlignment: [],
        careerFitScore: matchScore,
        salaryAlignment: 'unknown' as const,
        recommendations: ['Upload resume for detailed AI analysis']
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

    return {
      matches,
      overallInsights: {
        bestMatches: matches.slice(0, 5),
        skillGapAnalysis: [],
        careerAdvice: 'Upload your resume for personalized career advice',
        marketInsights: 'Enhanced insights available with resume analysis'
      }
    };
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

export const aiJobMatcher = new AIJobMatcher();
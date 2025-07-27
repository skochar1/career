import OpenAI from "openai";
import { EnhancedResumeData } from "./ai-resume-analyzer";
import { AIJobMatch, JobMatchingResult } from "./ai-job-matcher";
import { matchCache } from "./match-cache";

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

export class OptimizedAIJobMatcher {
  async generateJobMatches(
    candidateData: EnhancedResumeData,
    jobs: Job[],
    sessionId: string,
    limit: number = 20
  ): Promise<JobMatchingResult> {
    try {
      console.log('Starting optimized AI job matching:', {
        jobsCount: jobs.length,
        sessionId: sessionId.substring(0, 8) + '...'
      });

      // Get or generate candidate embedding
      const candidateEmbedding = await this.getCachedCandidateEmbedding(sessionId, candidateData);
      
      // Store candidate data in cache for future use
      matchCache.setCandidateData(sessionId, candidateEmbedding, candidateData);

      // Process jobs with caching
      const jobMatches = await this.processJobsWithCache(
        candidateData,
        jobs,
        sessionId,
        candidateEmbedding
      );

      console.log('Completed optimized job matching:', {
        totalMatches: jobMatches.length,
        cacheHits: this.calculateCacheHitRate(jobs, sessionId),
        avgScore: Math.round(jobMatches.reduce((sum, m) => sum + m.matchScore, 0) / jobMatches.length)
      });

      // Sort and limit results
      const sortedMatches = jobMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      // Generate overall insights (cached per session)
      const overallInsights = await this.generateCachedInsights(
        candidateData,
        sortedMatches,
        sessionId
      );

      return {
        matches: sortedMatches,
        overallInsights
      };
    } catch (error) {
      console.error('Optimized AI job matching failed:', error);
      throw error;
    }
  }

  private async getCachedCandidateEmbedding(
    sessionId: string,
    candidateData: EnhancedResumeData
  ): Promise<number[]> {
    const cache = matchCache.getSessionCache(sessionId);
    
    if (cache.candidateEmbedding) {
      console.log('Using cached candidate embedding');
      return cache.candidateEmbedding;
    }

    const profileText = this.createCandidateProfileText(candidateData);
    const embeddingKey = `candidate_${this.hashString(profileText)}`;

    let embedding = matchCache.getEmbedding(embeddingKey);
    if (embedding) {
      console.log('Using cached candidate embedding from global cache');
      return embedding;
    }

    console.log('Generating new candidate embedding');
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: profileText,
    });

    embedding = response.data[0].embedding;
    matchCache.setEmbedding(embeddingKey, embedding);
    
    return embedding;
  }

  private async processJobsWithCache(
    candidateData: EnhancedResumeData,
    jobs: Job[],
    sessionId: string,
    candidateEmbedding: number[]
  ): Promise<AIJobMatch[]> {
    const results: AIJobMatch[] = [];
    const uncachedJobs: Job[] = [];

    // Check cache for each job
    for (const job of jobs) {
      const cachedMatch = matchCache.getCachedMatch(sessionId, job.id);
      if (cachedMatch) {
        results.push({
          job,
          ...cachedMatch,
          strengthAlignment: this.findStrengthAlignment(candidateData, job)
        });
      } else {
        uncachedJobs.push(job);
      }
    }

    console.log(`Cache stats: ${results.length} hits, ${uncachedJobs.length} misses`);

    if (uncachedJobs.length === 0) {
      return results;
    }

    // Process uncached jobs in optimized batches
    const newMatches = await this.processBatchedJobs(
      candidateData,
      uncachedJobs,
      candidateEmbedding
    );

    // Cache the new results (excluding strengthAlignment as it's computed dynamically)
    for (const match of newMatches) {
      matchCache.setCachedMatch(sessionId, match.job.id, {
        matchScore: match.matchScore,
        matchingSkills: match.matchingSkills,
        missingSkills: match.missingSkills,
        explanation: match.explanation,
        careerFitScore: match.careerFitScore,
        salaryAlignment: match.salaryAlignment,
        recommendations: match.recommendations
      });
    }

    return [...results, ...newMatches];
  }

  private async processBatchedJobs(
    candidateData: EnhancedResumeData,
    jobs: Job[],
    candidateEmbedding: number[]
  ): Promise<AIJobMatch[]> {
    const BATCH_SIZE = 10; // Larger batch size for efficiency
    const results: AIJobMatch[] = [];

    // Process semantic similarity for all jobs first (fast operation)
    const jobsWithSimilarity = await Promise.all(
      jobs.map(async (job) => {
        const jobEmbedding = await this.getCachedJobEmbedding(job);
        const similarity = this.calculateSemanticSimilarity(candidateEmbedding, jobEmbedding);
        return { job, similarity };
      })
    );

    // Sort by similarity and process top matches with AI analysis
    const sortedJobs = jobsWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.min(50, jobs.length)); // Limit AI analysis to top 50 candidates

    // Process AI analysis in smaller batches to avoid rate limits
    for (let i = 0; i < sortedJobs.length; i += BATCH_SIZE) {
      const batch = sortedJobs.slice(i, i + BATCH_SIZE);
      console.log(`Processing AI analysis batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(sortedJobs.length / BATCH_SIZE)}`);
      
      const batchPromises = batch.map(({ job, similarity }) => 
        this.analyzeJobMatchOptimized(candidateData, job, similarity)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay to respect rate limits
      if (i + BATCH_SIZE < sortedJobs.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Add remaining jobs with basic scoring
    const remainingJobs = jobsWithSimilarity.slice(50);
    for (const { job, similarity } of remainingJobs) {
      const basicMatch = this.createBasicMatch(candidateData, job, similarity);
      results.push(basicMatch);
    }

    return results;
  }

  private async getCachedJobEmbedding(job: Job): Promise<number[]> {
    const jobText = this.createJobProfileText(job);
    const cacheKey = `job_${job.id}_${this.hashString(jobText)}`;

    let embedding = matchCache.getEmbedding(cacheKey);
    if (embedding) {
      return embedding;
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: jobText,
    });

    embedding = response.data[0].embedding;
    matchCache.setEmbedding(cacheKey, embedding);
    return embedding;
  }

  private async analyzeJobMatchOptimized(
    candidateData: EnhancedResumeData,
    job: Job,
    semanticSimilarity: number
  ): Promise<AIJobMatch> {
    // Use a more concise prompt for faster processing
    const prompt = `
Candidate: ${candidateData.experienceLevel}, Skills: ${candidateData.skills.slice(0, 10).join(', ')}
Job: ${job.title} at ${job.company}, Required: ${job.required_skills.slice(0, 10).join(', ')}

Return JSON only:
{"score": 0-100, "explanation": "brief", "matching": ["skill1"], "missing": ["skill2"], "advice": ["tip1"]}`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini", // Use faster, cheaper model
        messages: [
          {
            role: "system",
            content: "Respond with valid JSON only. Be concise."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 300, // Reduced token limit
      });

      const content = response.choices[0]?.message?.content?.replace(/```json|```/gi, '').trim();
      const result = JSON.parse(content || '{}');

      // Combine semantic similarity with AI analysis
      const aiWeight = 0.7;
      const semanticWeight = 0.3;
      const finalScore = Math.round(
        (result.score * aiWeight + semanticSimilarity * 100 * semanticWeight)
      );

      return {
        job,
        matchScore: Math.min(100, Math.max(0, finalScore)),
        explanation: result.explanation || 'AI analysis completed',
        matchingSkills: Array.isArray(result.matching) ? result.matching : [],
        missingSkills: Array.isArray(result.missing) ? result.missing : [],
        strengthAlignment: this.findStrengthAlignment(candidateData, job),
        careerFitScore: finalScore,
        salaryAlignment: this.analyzeSalaryAlignment(
          candidateData.careerProgression?.yearsOfExperience || 0,
          candidateData.experienceLevel,
          job.salary_min,
          job.salary_max
        ),
        recommendations: Array.isArray(result.advice) ? result.advice : []
      };
    } catch (error) {
      console.error('AI analysis failed for job:', job.title, error);
      return this.createBasicMatch(candidateData, job, semanticSimilarity);
    }
  }

  private createBasicMatch(
    candidateData: EnhancedResumeData,
    job: Job,
    semanticSimilarity: number
  ): AIJobMatch {
    const skillsOverlap = this.calculateSkillsOverlap(candidateData.skills, job.required_skills);
    const levelAlignment = this.getLevelAlignment(candidateData.experienceLevel, job.seniority_level);
    
    const basicScore = Math.round(
      semanticSimilarity * 40 + skillsOverlap * 40 + (levelAlignment + 50) / 2
    );

    return {
      job,
      matchScore: Math.min(100, Math.max(0, basicScore)),
      explanation: `Basic compatibility analysis based on ${Math.round(skillsOverlap * 100)}% skill overlap`,
      matchingSkills: this.findMatchingSkills(candidateData.skills, job.required_skills),
      missingSkills: this.findMissingSkills(candidateData.skills, job.required_skills),
      strengthAlignment: this.findStrengthAlignment(candidateData, job),
      careerFitScore: basicScore,
      salaryAlignment: this.analyzeSalaryAlignment(
        candidateData.careerProgression?.yearsOfExperience || 0,
        candidateData.experienceLevel,
        job.salary_min,
        job.salary_max
      ),
      recommendations: ['Consider developing the missing skills listed above']
    };
  }

  private async generateCachedInsights(
    candidateData: EnhancedResumeData,
    matches: AIJobMatch[],
    sessionId: string
  ) {
    // Use a simple key for insights caching
    const insightsKey = `insights_${sessionId}`;
    const cached = matchCache.getEmbedding(insightsKey);
    
    if (cached) {
      return JSON.parse(cached as any);
    }

    const bestMatches = matches.slice(0, 5);
    const skillGapAnalysis = this.analyzeSkillGaps(matches);

    const insights = {
      bestMatches,
      skillGapAnalysis,
      careerAdvice: `Focus on developing ${skillGapAnalysis.slice(0, 3).join(', ')} to improve job match scores`,
      marketInsights: `Strong matches found in ${bestMatches.map(m => m.job.department).join(', ')} departments`
    };

    // Cache insights for 1 hour
    setTimeout(() => {
      matchCache.setEmbedding(insightsKey, JSON.stringify(insights) as any);
    }, 0);

    return insights;
  }

  private analyzeSkillGaps(matches: AIJobMatch[]): string[] {
    const allMissingSkills = matches.flatMap(m => m.missingSkills);
    const skillCounts = new Map<string, number>();
    
    allMissingSkills.forEach(skill => {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    });

    return Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);
  }

  private calculateCacheHitRate(jobs: Job[], sessionId: string): string {
    const hits = jobs.filter(job => matchCache.getCachedMatch(sessionId, job.id)).length;
    return `${Math.round((hits / jobs.length) * 100)}%`;
  }

  // Utility methods (same as original but optimized)
  private createCandidateProfileText(candidateData: EnhancedResumeData): string {
    return `Experience: ${candidateData.experienceLevel} (${candidateData.careerProgression?.yearsOfExperience || 0}y)
Skills: ${candidateData.skills.slice(0, 15).join(', ')}
Summary: ${candidateData.summary.substring(0, 200)}`;
  }

  private createJobProfileText(job: Job): string {
    return `${job.title} at ${job.company} (${job.seniority_level})
Skills: ${job.required_skills.join(', ')}
Type: ${job.employment_type}, Remote: ${job.remote_eligible ? 'Yes' : 'No'}
Description: ${job.description.substring(0, 300)}`;
  }

  private calculateSemanticSimilarity(embedding1: number[], embedding2: number[]): number {
    const dotProduct = embedding1.reduce((sum, a, i) => sum + a * embedding2[i], 0);
    const magnitude1 = Math.sqrt(embedding1.reduce((sum, a) => sum + a * a, 0));
    const magnitude2 = Math.sqrt(embedding2.reduce((sum, a) => sum + a * a, 0));
    
    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return (dotProduct / (magnitude1 * magnitude2) + 1) / 2;
  }

  private calculateSkillsOverlap(candidateSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 0.5;
    
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    const matches = requiredSkills.filter(skill => 
      candidateSkillsLower.some(cs => 
        cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
      )
    );
    
    return matches.length / requiredSkills.length;
  }

  private getLevelAlignment(candidateLevel: string, jobLevel: string): number {
    const levels = ['junior', 'mid', 'senior', 'lead', 'vp', 'executive'];
    const candidateIndex = levels.indexOf(candidateLevel);
    const jobIndex = levels.indexOf(jobLevel);
    
    if (candidateIndex === -1 || jobIndex === -1) return 0;
    
    const diff = Math.abs(candidateIndex - jobIndex);
    if (diff === 0) return 30;
    if (diff === 1) return 15;
    if (diff === 2) return -10;
    return -20;
  }

  private findMatchingSkills(candidateSkills: string[], requiredSkills: string[]): string[] {
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    return requiredSkills.filter(skill => 
      candidateSkillsLower.some(cs => 
        cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
      )
    );
  }

  private findMissingSkills(candidateSkills: string[], requiredSkills: string[]): string[] {
    const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase());
    return requiredSkills.filter(skill => 
      !candidateSkillsLower.some(cs => 
        cs.includes(skill.toLowerCase()) || skill.toLowerCase().includes(cs)
      )
    );
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

  private analyzeSalaryAlignment(
    yearsExp: number,
    level: string,
    salaryMin?: number,
    salaryMax?: number
  ): 'below' | 'within' | 'above' | 'unknown' {
    if (!salaryMin || !salaryMax) return 'unknown';

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
    return base + (yearsExp * 5000);
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }
}

export const optimizedAIJobMatcher = new OptimizedAIJobMatcher();
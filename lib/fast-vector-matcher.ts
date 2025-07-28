import OpenAI from "openai";
import { EnhancedResumeData } from "./ai-resume-analyzer";
import { AIJobMatch, JobMatchingResult } from "./ai-job-matcher";
import crypto from "crypto";

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
  embedding?: string; // JSON string of embedding array
  embedding_hash?: string;
}

interface VectorMatch {
  job: Job;
  similarity: number;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
}

export class FastVectorMatcher {
  private isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  private dbModule: any;

  constructor() {
    if (this.isProduction) {
      this.dbModule = require('./database-postgres');
    } else {
      this.dbModule = require('./database');
    }
  }

  async generateJobMatches(
    candidateData: EnhancedResumeData,
    jobs: Job[],
    sessionId: string,
    limit: number = 20
  ): Promise<JobMatchingResult> {
    try {
      console.log('🚀 Starting fast vector job matching:', {
        jobsCount: jobs.length,
        sessionId: sessionId.substring(0, 8) + '...'
      });

      const startTime = Date.now();

      // Step 1: Get candidate embedding (single API call)
      const candidateEmbedding = await this.getCandidateEmbedding(candidateData);
      console.log('✅ Candidate embedding generated');

      // Step 2: Ensure all jobs have embeddings
      const jobsWithEmbeddings = await this.ensureJobEmbeddings(jobs);
      console.log('✅ Job embeddings ready');

      // Step 3: Calculate vector similarities (pure math, very fast)
      const vectorMatches = this.calculateVectorMatches(
        candidateData,
        candidateEmbedding,
        jobsWithEmbeddings
      );
      console.log('✅ Vector similarities calculated');

      // Step 4: Sort and limit results
      const topMatches = vectorMatches
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit);

      // Step 5: Convert to AIJobMatch format
      const aiJobMatches: AIJobMatch[] = topMatches.map(match => ({
        job: match.job,
        matchScore: Math.round(match.matchScore),
        matchingSkills: match.matchingSkills,
        missingSkills: match.missingSkills,
        explanation: this.generateQuickExplanation(match, candidateData),
        careerFitScore: Math.round(match.similarity * 100),
        salaryAlignment: this.calculateSalaryAlignment(candidateData, match.job),
        recommendations: this.generateQuickRecommendations(match, candidateData),
        strengthAlignment: this.findStrengthAlignment(candidateData, match.job)
      }));

      // Step 6: Generate lightweight insights (single AI call)
      const overallInsights = await this.generateFastInsights(candidateData, topMatches);

      const totalTime = Date.now() - startTime;
      console.log(`🎉 Fast vector matching completed in ${totalTime}ms:`, {
        totalMatches: aiJobMatches.length,
        avgScore: Math.round(aiJobMatches.reduce((sum, m) => sum + m.matchScore, 0) / aiJobMatches.length)
      });

      return {
        matches: aiJobMatches,
        overallInsights
      };
    } catch (error) {
      console.error('❌ Fast vector matching failed:', error);
      throw error;
    }
  }

  private async getCandidateEmbedding(candidateData: EnhancedResumeData): Promise<number[]> {
    const profileText = this.createCandidateProfileText(candidateData);
    
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: profileText,
    });

    return response.data[0].embedding;
  }

  private async ensureJobEmbeddings(jobs: Job[]): Promise<Job[]> {
    const jobsNeedingEmbeddings: Job[] = [];
    const embeddingRequests: { job: Job; text: string; hash: string }[] = [];

    // Check which jobs need embeddings
    for (const job of jobs) {
      const jobText = this.createJobProfileText(job);
      const contentHash = this.hashString(jobText);
      
      if (!job.embedding || job.embedding_hash !== contentHash) {
        jobsNeedingEmbeddings.push(job);
        embeddingRequests.push({ job, text: jobText, hash: contentHash });
      }
    }

    if (embeddingRequests.length === 0) {
      return jobs; // All jobs already have embeddings
    }

    console.log(`📊 Computing embeddings for ${embeddingRequests.length} jobs...`);

    // Batch embedding generation (much faster than individual calls)
    const texts = embeddingRequests.map(req => req.text);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    // Update jobs with new embeddings and save to database
    for (let i = 0; i < embeddingRequests.length; i++) {
      const { job, hash } = embeddingRequests[i];
      const embedding = response.data[i].embedding;
      const embeddingJson = JSON.stringify(embedding);

      // Update job object
      job.embedding = embeddingJson;
      job.embedding_hash = hash;

      // Save to database
      await this.saveJobEmbedding(job.id, embeddingJson, hash);
    }

    return jobs;
  }

  private calculateVectorMatches(
    candidateData: EnhancedResumeData,
    candidateEmbedding: number[],
    jobs: Job[]
  ): VectorMatch[] {
    return jobs.map(job => {
      const jobEmbedding = JSON.parse(job.embedding!);
      const similarity = this.cosineSimilarity(candidateEmbedding, jobEmbedding);
      
      // Calculate skill matches
      const candidateSkills = candidateData.skills.map(s => s.toLowerCase());
      const requiredSkills = job.required_skills.map(s => s.toLowerCase());
      const preferredSkills = job.preferred_skills.map(s => s.toLowerCase());
      const allJobSkills = [...requiredSkills, ...preferredSkills];
      
      const matchingSkills = candidateSkills.filter(skill => 
        allJobSkills.some(jobSkill => 
          jobSkill.includes(skill) || skill.includes(jobSkill) || skill === jobSkill
        )
      );
      
      const missingSkills = requiredSkills.filter(skill => 
        !candidateSkills.some(candidateSkill => 
          candidateSkill.includes(skill) || skill.includes(candidateSkill) || skill === candidateSkill
        )
      ).slice(0, 5); // Limit to top 5 missing skills

      // Calculate composite match score
      const skillMatchRatio = matchingSkills.length / Math.max(requiredSkills.length, 1);
      const seniorityScore = this.getSeniorityScore(candidateData.experienceLevel, job.seniority_level);
      const departmentBonus = this.getDepartmentBonus(candidateData, job);
      
      const matchScore = Math.min(100, 
        (similarity * 40) + 
        (skillMatchRatio * 35) + 
        (seniorityScore * 15) + 
        (departmentBonus * 10)
      );

      return {
        job,
        similarity,
        matchScore,
        matchingSkills: candidateData.skills.filter(skill => 
          matchingSkills.includes(skill.toLowerCase())
        ),
        missingSkills: job.required_skills.filter(skill => 
          missingSkills.includes(skill.toLowerCase())
        )
      };
    });
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  private getSeniorityScore(candidateLevel: string, jobLevel: string): number {
    const levels = ['junior', 'mid', 'senior', 'lead', 'vp', 'executive'];
    const candidateIndex = levels.indexOf(candidateLevel.toLowerCase());
    const jobIndex = levels.indexOf(jobLevel.toLowerCase());
    
    if (candidateIndex === -1 || jobIndex === -1) return 0.5;
    
    const diff = Math.abs(candidateIndex - jobIndex);
    return Math.max(0, 1 - (diff * 0.2)); // Penalize large seniority mismatches
  }

  private getDepartmentBonus(candidateData: EnhancedResumeData, job: Job): number {
    // Simple heuristic - could be improved with more sophisticated analysis
    const techSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql'];
    const marketingSkills = ['seo', 'analytics', 'marketing', 'social media'];
    const designSkills = ['figma', 'design', 'ui', 'ux', 'photoshop'];
    
    const candidateSkills = candidateData.skills.join(' ').toLowerCase();
    
    if (job.department?.toLowerCase() === 'engineering' && 
        techSkills.some(skill => candidateSkills.includes(skill))) {
      return 1;
    }
    if (job.department?.toLowerCase() === 'marketing' && 
        marketingSkills.some(skill => candidateSkills.includes(skill))) {
      return 1;
    }
    if (job.department?.toLowerCase() === 'design' && 
        designSkills.some(skill => candidateSkills.includes(skill))) {
      return 1;
    }
    
    return 0.5;
  }

  private generateQuickExplanation(match: VectorMatch, candidateData: EnhancedResumeData): string {
    const { job, matchScore, matchingSkills, missingSkills } = match;
    
    let explanation = `${matchScore}% match for ${job.title} at ${job.company}. `;
    
    if (matchingSkills.length > 0) {
      explanation += `Strong alignment with ${matchingSkills.slice(0, 3).join(', ')}. `;
    }
    
    if (missingSkills.length > 0) {
      explanation += `Consider developing ${missingSkills.slice(0, 2).join(', ')} skills.`;
    }
    
    return explanation;
  }

  private calculateSalaryAlignment(candidateData: EnhancedResumeData, job: Job): 'below' | 'within' | 'above' | 'unknown' {
    if (!job.salary_min || !job.salary_max) return 'unknown';
    
    const avgSalary = (job.salary_min + job.salary_max) / 2;
    const seniorityMultipliers = {
      junior: 0.7,
      mid: 1.0,
      senior: 1.3,
      lead: 1.6,
      vp: 2.0,
      executive: 2.5
    };
    
    const expectedMultiplier = seniorityMultipliers[candidateData.experienceLevel as keyof typeof seniorityMultipliers] || 1.0;
    const marketSalary = 80000 * expectedMultiplier; // Base estimate
    
    if (avgSalary < marketSalary * 0.8) return 'below';
    if (avgSalary > marketSalary * 1.2) return 'above';
    return 'within';
  }

  private generateQuickRecommendations(match: VectorMatch, candidateData: EnhancedResumeData): string[] {
    const recommendations: string[] = [];
    
    if (match.missingSkills.length > 0) {
      recommendations.push(`Develop ${match.missingSkills[0]} skills to strengthen your profile`);
    }
    
    if (match.matchingSkills.length > 2) {
      recommendations.push(`Highlight your ${match.matchingSkills[0]} experience in your application`);
    }
    
    if (match.job.remote_eligible) {
      recommendations.push('This role offers remote work flexibility');
    }
    
    return recommendations.slice(0, 3);
  }

  private findStrengthAlignment(candidateData: EnhancedResumeData, job: Job): string[] {
    const alignments: string[] = [];
    
    // Check for technical alignments
    const candidateSkills = candidateData.skills.map(s => s.toLowerCase());
    const jobSkills = [...job.required_skills, ...job.preferred_skills].map(s => s.toLowerCase());
    
    const strongMatches = candidateSkills.filter(skill => 
      jobSkills.includes(skill)
    ).slice(0, 3);
    
    return strongMatches.map(skill => 
      candidateData.skills.find(s => s.toLowerCase() === skill) || skill
    );
  }

  private async generateFastInsights(
    candidateData: EnhancedResumeData,
    matches: VectorMatch[]
  ): Promise<{ bestMatches: AIJobMatch[]; skillGapAnalysis: string[]; careerAdvice: string; marketInsights: string; }> {
    const topMatch = matches[0];
    const avgScore = matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length;
    
    // Analyze skill gaps from missing skills
    const allMissingSkills = matches.flatMap(m => m.missingSkills);
    const skillCounts = new Map<string, number>();
    
    allMissingSkills.forEach(skill => {
      skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
    });

    const skillGapAnalysis = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill]) => skill);

    let careerAdvice: string;
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "user",
          content: `Quick career insights for ${candidateData.experienceLevel} with skills: ${candidateData.skills.slice(0, 5).join(', ')}. Top match: ${topMatch.job.title} (${Math.round(topMatch.matchScore)}%). Avg score: ${Math.round(avgScore)}%. Write 2-3 sentences.`
        }],
        max_tokens: 150,
        temperature: 0.3,
      });

      careerAdvice = response.choices[0]?.message?.content || 'Strong profile with good market opportunities.';
    } catch (error) {
      console.warn('Insights generation failed, using fallback');
      careerAdvice = `Your ${candidateData.experienceLevel} profile shows strong potential with an average match score of ${Math.round(avgScore)}%. Consider highlighting your ${candidateData.skills.slice(0, 2).join(' and ')} experience.`;
    }

    // Get unique departments from top matches
    const topDepartments = matches.slice(0, 10).map(m => m.job.department).filter(Boolean);
    const uniqueDepartments = [...new Set(topDepartments)];

    return {
      bestMatches: matches.slice(0, 5).map(match => ({
        job: match.job,
        matchScore: Math.round(match.matchScore),
        matchingSkills: match.matchingSkills,
        missingSkills: match.missingSkills,
        explanation: this.generateQuickExplanation(match, candidateData),
        careerFitScore: Math.round(match.similarity * 100),
        salaryAlignment: this.calculateSalaryAlignment(candidateData, match.job),
        recommendations: this.generateQuickRecommendations(match, candidateData),
        strengthAlignment: this.findStrengthAlignment(candidateData, match.job)
      })),
      skillGapAnalysis,
      careerAdvice,
      marketInsights: `Strong potential in ${uniqueDepartments.slice(0, 3).join(', ')} departments based on your profile.`
    };
  }

  private createCandidateProfileText(candidateData: EnhancedResumeData): string {
    return [
      candidateData.summary,
      `Experience Level: ${candidateData.experienceLevel}`,
      `Skills: ${candidateData.skills.join(', ')}`,
      candidateData.workExperience?.map(exp => 
        `${exp.position} at ${exp.company}: ${exp.description}`
      ).join('. ') || ''
    ].filter(Boolean).join('. ');
  }

  private createJobProfileText(job: Job): string {
    return [
      `${job.title} at ${job.company}`,
      job.description,
      `Department: ${job.department}`,
      `Seniority: ${job.seniority_level}`,
      `Required Skills: ${job.required_skills.join(', ')}`,
      `Preferred Skills: ${job.preferred_skills.join(', ')}`,
      `Location: ${job.location}`,
      job.remote_eligible ? 'Remote eligible' : 'On-site position'
    ].filter(Boolean).join('. ');
  }

  private hashString(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  private async saveJobEmbedding(jobId: number, embedding: string, hash: string): Promise<void> {
    try {
      if (this.isProduction) {
        await this.dbModule.sql`
          UPDATE jobs 
          SET embedding = ${embedding}, embedding_hash = ${hash} 
          WHERE id = ${jobId}
        `;
      } else {
        const db = this.dbModule.getDatabase();
        const stmt = db.prepare('UPDATE jobs SET embedding = ?, embedding_hash = ? WHERE id = ?');
        stmt.run(embedding, hash, jobId);
      }
    } catch (error) {
      console.warn(`Failed to save embedding for job ${jobId}:`, error);
    }
  }
}
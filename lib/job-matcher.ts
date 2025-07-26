import { getDatabase, Job } from './database';
import { ParsedResumeData } from './resume-parser';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function calculateJobMatches(candidateId: number, resumeData: ParsedResumeData) {
  const db = getDatabase();
  
  // Get all active jobs
  const jobs = db.prepare('SELECT * FROM jobs WHERE is_active = 1').all() as Job[];
  
  // Clear existing matches for this candidate
  db.prepare('DELETE FROM job_matches WHERE candidate_id = ?').run(candidateId);
  
  // Calculate matches for each job
  const insertMatch = db.prepare(`
    INSERT INTO job_matches (candidate_id, job_id, match_score, matching_skills)
    VALUES (?, ?, ?, ?)
  `);
  
  for (const job of jobs) {
    const matchScore = await calculateSingleJobMatch(resumeData, job);
    const matchingSkills = findMatchingSkills(resumeData.skills, JSON.parse(job.required_skills || '[]'));
    
    insertMatch.run(
      candidateId,
      job.id,
      matchScore,
      JSON.stringify(matchingSkills)
    );
  }
}

async function calculateSingleJobMatch(resumeData: ParsedResumeData, job: Job): Promise<number> {
  try {
    const prompt = `
You are a job matching expert. Please calculate a match score between a candidate and a job posting.

CANDIDATE PROFILE:
- Skills: ${resumeData.skills.join(', ')}
- Experience Level: ${resumeData.experienceLevel}
- Summary: ${resumeData.summary}
- Education: ${resumeData.education?.join(', ') || 'Not specified'}

JOB POSTING:
- Title: ${job.title}
- Description: ${job.description}
- Required Skills: ${JSON.parse(job.required_skills || '[]').join(', ')}
- Preferred Skills: ${JSON.parse(job.preferred_skills || '[]').join(', ')}
- Seniority Level: ${job.seniority_level}
- Department: ${job.department}
- Location: ${job.location}
- Remote Eligible: ${job.remote_eligible ? 'Yes' : 'No'}

Please calculate a match score from 0 to 100 based on:
1. Skills alignment (40% weight)
2. Experience level match (25% weight)
3. Industry/domain fit (20% weight)
4. Location compatibility (10% weight)
5. Overall profile fit (5% weight)

Respond with ONLY a number between 0 and 100. No explanation needed.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a precise job matching algorithm. Respond only with a numeric score between 0 and 100.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 10
    });

    const scoreText = response.choices[0]?.message?.content?.trim();
    const score = parseFloat(scoreText || '0');
    
    // Validate score is between 0 and 100
    return Math.max(0, Math.min(100, isNaN(score) ? 0 : score));

  } catch (error) {
    console.error('Error calculating match with OpenAI:', error);
    // Fallback to basic matching algorithm
    return calculateBasicMatch(resumeData, job);
  }
}

function calculateBasicMatch(resumeData: ParsedResumeData, job: Job): number {
  let score = 0;
  
  // Skills matching (60% of score)
  const jobSkills = JSON.parse(job.required_skills || '[]');
  const matchingSkills = findMatchingSkills(resumeData.skills, jobSkills);
  const skillsScore = jobSkills.length > 0 ? (matchingSkills.length / jobSkills.length) * 60 : 30;
  score += skillsScore;
  
  // Experience level matching (30% of score)
  const experienceLevels = ['junior', 'mid', 'senior', 'lead', 'vp', 'executive'];
  const candidateLevel = experienceLevels.indexOf(resumeData.experienceLevel);
  const jobLevel = experienceLevels.indexOf(job.seniority_level);
  
  if (candidateLevel === jobLevel) {
    score += 30;
  } else if (Math.abs(candidateLevel - jobLevel) === 1) {
    score += 20;
  } else if (Math.abs(candidateLevel - jobLevel) === 2) {
    score += 10;
  }
  
  // Location matching (10% of score)
  if (job.remote_eligible) {
    score += 10;
  } else if (resumeData.preferredLocations?.some(loc => 
    job.location.toLowerCase().includes(loc.toLowerCase())
  )) {
    score += 10;
  }
  
  return Math.round(score);
}

function findMatchingSkills(candidateSkills: string[], jobSkills: string[]): string[] {
  const matching: string[] = [];
  
  jobSkills.forEach(jobSkill => {
    candidateSkills.forEach(candidateSkill => {
      if (candidateSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
          jobSkill.toLowerCase().includes(candidateSkill.toLowerCase())) {
        if (!matching.includes(jobSkill)) {
          matching.push(jobSkill);
        }
      }
    });
  });
  
  return matching;
}

export async function getJobRecommendations(sessionId: string, limit: number = 10) {
  const db = getDatabase();
  
  // Get candidate
  const candidate = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get(sessionId);
  if (!candidate) {
    throw new Error('Candidate not found');
  }
  
  const candidateData = candidate as any;
  
  // Get top matching jobs
  const query = `
    SELECT 
      j.*, 
      jm.match_score,
      jm.matching_skills
    FROM jobs j
    INNER JOIN job_matches jm ON j.id = jm.job_id
    WHERE jm.candidate_id = ? AND j.is_active = 1
    ORDER BY jm.match_score DESC
    LIMIT ?
  `;
  
  const jobs = db.prepare(query).all(candidateData.id, limit) as (Job & { match_score: number; matching_skills: string })[];
  
  return jobs.map(job => ({
    ...job,
    required_skills: JSON.parse(job.required_skills || '[]'),
    preferred_skills: JSON.parse(job.preferred_skills || '[]'),
    matching_skills: JSON.parse(job.matching_skills || '[]')
  }));
}
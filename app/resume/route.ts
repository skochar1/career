import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../lib/database';
import pdf from 'pdf-parse';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'text/plain'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const sessionId = formData.get('session_id') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and TXT files are allowed.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let resumeText = '';
    
    try {
      if (file.type === 'application/pdf') {
        const data = await pdf(buffer);
        resumeText = data.text;
      } else if (file.type === 'text/plain') {
        resumeText = buffer.toString('utf-8');
      }
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Failed to parse resume file' },
        { status: 400 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: 'Resume appears to be empty or could not be parsed' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    const existingCandidate = db.prepare(
      'SELECT * FROM candidates WHERE session_id = ?'
    ).get(sessionId);

    const skills = extractSkills(resumeText);
    const experienceLevel = determineExperienceLevel(resumeText);

    if (existingCandidate) {
      db.prepare(`
        UPDATE candidates 
        SET resume_filename = ?, resume_content = ?, parsed_skills = ?, 
            experience_level = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = ?
      `).run(
        file.name,
        resumeText,
        JSON.stringify(skills),
        experienceLevel,
        sessionId
      );
    } else {
      db.prepare(`
        INSERT INTO candidates (
          session_id, resume_filename, resume_content, parsed_skills, experience_level
        ) VALUES (?, ?, ?, ?, ?)
      `).run(
        sessionId,
        file.name,
        resumeText,
        JSON.stringify(skills),
        experienceLevel
      );
    }

    const candidate = db.prepare(
      'SELECT * FROM candidates WHERE session_id = ?'
    ).get(sessionId) as any;

    await generateJobMatches(candidate.id, skills, experienceLevel);

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      candidate: {
        id: candidate.id,
        session_id: sessionId,
        skills,
        experience_level: experienceLevel,
        filename: file.name
      }
    });

  } catch (error: any) {
    console.error('Resume upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process resume', details: error.message },
      { status: 500 }
    );
  }
}

function extractSkills(resumeText: string): string[] {
  const skillsKeywords = [
    'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
    'react', 'vue', 'angular', 'node.js', 'express', 'next.js', 'django', 'flask', 'spring',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git',
    'machine learning', 'data science', 'artificial intelligence', 'tensorflow', 'pytorch',
    'leadership', 'team management', 'project management', 'agile', 'scrum',
    'nursing', 'patient care', 'medical records', 'healthcare', 'icu',
    'sql', 'nosql', 'api', 'rest', 'graphql', 'microservices',
    'frontend', 'backend', 'full-stack', 'devops', 'mobile development',
    'ios', 'android', 'swift', 'kotlin', 'flutter', 'react native'
  ];

  const text = resumeText.toLowerCase();
  const foundSkills = skillsKeywords.filter(skill => 
    text.includes(skill.toLowerCase())
  );

  return [...new Set(foundSkills)];
}

function determineExperienceLevel(resumeText: string): string {
  const text = resumeText.toLowerCase();
  
  const vpIndicators = ['vice president', 'vp of', 'chief', 'director of', 'head of'];
  const seniorIndicators = ['senior', 'lead', 'principal', 'staff', '5+ years', '6+ years', '7+ years', '8+ years', '9+ years', '10+ years'];
  const midIndicators = ['3+ years', '4+ years', '3-5 years', '2-4 years'];
  const juniorIndicators = ['junior', 'entry level', 'graduate', 'intern', 'new grad', '0-2 years', '1+ year'];

  if (vpIndicators.some(indicator => text.includes(indicator))) {
    return 'vp';
  }
  if (seniorIndicators.some(indicator => text.includes(indicator))) {
    return 'senior';
  }
  if (midIndicators.some(indicator => text.includes(indicator))) {
    return 'mid';
  }
  if (juniorIndicators.some(indicator => text.includes(indicator))) {
    return 'junior';
  }

  return 'mid';
}

async function generateJobMatches(candidateId: number, skills: string[], experienceLevel: string) {
  const db = getDatabase();
  
  db.prepare('DELETE FROM job_matches WHERE candidate_id = ?').run(candidateId);

  const jobs = db.prepare('SELECT * FROM jobs WHERE is_active = 1').all();

  const matches = jobs.map((job: any) => {
    const requiredSkills = JSON.parse(job.required_skills || '[]');
    const preferredSkills = JSON.parse(job.preferred_skills || '[]');
    
    let score = 0;
    const matchingSkills: string[] = [];

    requiredSkills.forEach((skill: string) => {
      if (skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))) {
        score += 3;
        matchingSkills.push(skill);
      }
    });

    preferredSkills.forEach((skill: string) => {
      if (skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))) {
        score += 1;
        if (!matchingSkills.includes(skill)) {
          matchingSkills.push(skill);
        }
      }
    });

    const experienceMatch = getExperienceMatch(experienceLevel, job.seniority_level);
    score += experienceMatch;

    return {
      candidateId,
      jobId: job.id,
      score: Math.min(score, 100),
      matchingSkills
    };
  }).filter(match => match.score > 0);

  const insertMatch = db.prepare(`
    INSERT INTO job_matches (candidate_id, job_id, match_score, matching_skills)
    VALUES (?, ?, ?, ?)
  `);

  matches.forEach(match => {
    insertMatch.run(
      match.candidateId,
      match.jobId,
      match.score,
      JSON.stringify(match.matchingSkills)
    );
  });
}

function getExperienceMatch(candidateLevel: string, jobLevel: string): number {
  const levels = { junior: 1, mid: 2, senior: 3, lead: 4, vp: 5, executive: 6 };
  const candidateScore = levels[candidateLevel as keyof typeof levels] || 2;
  const jobScore = levels[jobLevel as keyof typeof levels] || 2;
  
  const diff = Math.abs(candidateScore - jobScore);
  
  if (diff === 0) return 5;
  if (diff === 1) return 2;
  if (diff === 2) return 0;
  return -2;
}
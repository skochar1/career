import { NextRequest, NextResponse } from 'next/server';
import { getJobRecommendations } from '../../../lib/job-matcher';
import { aiJobMatcher } from '../../../lib/ai-job-matcher';

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let dbModule: any;
if (isProduction) {
  dbModule = require('../../../lib/database-postgres');
} else {
  dbModule = require('../../../lib/database');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get candidate data with enhanced AI analysis
    let candidateData;
    if (isProduction) {
      await dbModule.initializeDatabase();
      const { rows: candidates } = await dbModule.sql`SELECT * FROM candidates WHERE session_id = ${sessionId}`;
      candidateData = candidates[0];
    } else {
      const db = dbModule.getDatabase();
      candidateData = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get(sessionId);
    }

    if (!candidateData) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Parse enhanced AI data if available
    let enhancedResumeData;
    try {
      enhancedResumeData = candidateData.enhanced_data ? JSON.parse(candidateData.enhanced_data) : null;
    } catch (e) {
      console.warn('Failed to parse enhanced data, falling back to basic data');
      enhancedResumeData = null;
    }

    // Get all jobs for AI matching
    let allJobs;
    if (isProduction) {
      const { rows: jobs } = await dbModule.sql`SELECT * FROM jobs WHERE is_active = true`;
      allJobs = jobs.map((job: any) => ({
        ...job,
        required_skills: JSON.parse(job.required_skills || '[]'),
        preferred_skills: JSON.parse(job.preferred_skills || '[]'),
        remote_eligible: job.remote_eligible ? 1 : 0
      }));
    } else {
      const db = dbModule.getDatabase();
      const jobs = db.prepare('SELECT * FROM jobs WHERE is_active = 1').all();
      allJobs = jobs.map((job: any) => ({
        ...job,
        required_skills: JSON.parse(job.required_skills || '[]'),
        preferred_skills: JSON.parse(job.preferred_skills || '[]')
      }));
    }

    // Apply filters
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const department = searchParams.get('department');
    const remote = searchParams.get('remote');
    const onsite = searchParams.get('onsite');
    const hybrid = searchParams.get('hybrid');

    let filteredJobs = allJobs;

    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter((job: any) => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.required_skills.some((skill: string) => skill.toLowerCase().includes(searchLower))
      );
    }

    if (location) {
      filteredJobs = filteredJobs.filter((job: any) => 
        job.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (department) {
      const departments = department.split(',').map((d: string) => d.trim());
      filteredJobs = filteredJobs.filter((job: any) => 
        departments.some(dept => job.department.toLowerCase().includes(dept.toLowerCase()))
      );
    }

    if (remote === 'true') {
      filteredJobs = filteredJobs.filter((job: any) => job.remote_eligible === 1);
    }

    if (onsite === 'true') {
      filteredJobs = filteredJobs.filter((job: any) => job.remote_eligible === 0);
    }

    if (hybrid === 'true') {
      filteredJobs = filteredJobs.filter((job: any) => 
        job.title.toLowerCase().includes('hybrid') || 
        job.description.toLowerCase().includes('hybrid')
      );
    }

    // Use AI job matcher if enhanced data is available
    if (enhancedResumeData && process.env.OPENAI_API_KEY) {
      try {
        const aiResults = await aiJobMatcher.generateJobMatches(
          enhancedResumeData,
          filteredJobs,
          limit
        );

        return NextResponse.json({
          success: true,
          recommendations: aiResults.matches.map(match => ({
            ...match.job,
            match_score: match.matchScore,
            matching_skills: match.matchingSkills,
            missing_skills: match.missingSkills,
            ai_explanation: match.explanation,
            career_fit_score: match.careerFitScore,
            salary_alignment: match.salaryAlignment,
            recommendations: match.recommendations
          })),
          count: aiResults.matches.length,
          insights: aiResults.overallInsights,
          enhanced_matching: true
        });
      } catch (aiError) {
        console.error('AI matching failed, falling back to basic matching:', aiError);
      }
    }

    // Fallback to basic recommendations
    const recommendations = await getJobRecommendations(sessionId, limit, {
      workType: {
        remote: remote === 'true',
        onsite: onsite === 'true',
        hybrid: hybrid === 'true',
      },
      employmentType: searchParams.get('employment_type')?.split(',').filter(Boolean),
      department: searchParams.get('department')?.split(',').filter(Boolean),
      seniorityLevel: searchParams.get('seniority_level'),
      location: searchParams.get('location'),
      search: searchParams.get('search'),
    });

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
      enhanced_matching: false
    });

  } catch (error: any) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations', details: error.message },
      { status: 500 }
    );
  }
}
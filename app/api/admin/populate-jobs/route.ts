import { NextRequest, NextResponse } from 'next/server';

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let dbModule: any;
if (isProduction) {
  dbModule = require('../../../../lib/database-postgres');
} else {
  dbModule = require('../../../../lib/database');
}

interface JobData {
  title: string;
  description: string;
  full_description?: string;
  location: string;
  company: string;
  department: string;
  seniority_level: 'junior' | 'mid' | 'senior' | 'lead' | 'vp' | 'executive';
  required_skills: string[];
  preferred_skills: string[];
  salary_min: number;
  salary_max: number;
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship';
  remote_eligible: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Basic auth check (simple token for this admin operation)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('synthetic-job-deployment')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { jobs }: { jobs: JobData[] } = await request.json();
    
    if (!jobs || !Array.isArray(jobs)) {
      return NextResponse.json(
        { error: 'Invalid request: jobs array required' },
        { status: 400 }
      );
    }

    console.log(`[ADMIN] Received request to add ${jobs.length} jobs`);

    if (isProduction) {
      // PostgreSQL implementation
      await dbModule.initializeDatabase();
      
      let insertedCount = 0;
      
      for (const job of jobs) {
        try {
          await dbModule.sql`
            INSERT INTO jobs (
              title, description, full_description, location, company, department,
              seniority_level, required_skills, preferred_skills, salary_min, salary_max,
              employment_type, remote_eligible, is_active
            ) VALUES (
              ${job.title},
              ${job.description},
              ${job.full_description || job.description},
              ${job.location},
              ${job.company},
              ${job.department},
              ${job.seniority_level},
              ${JSON.stringify(job.required_skills)},
              ${JSON.stringify(job.preferred_skills)},
              ${job.salary_min},
              ${job.salary_max},
              ${job.employment_type},
              ${job.remote_eligible},
              true
            )
          `;
          insertedCount++;
        } catch (jobError) {
          console.error(`[ADMIN] Failed to insert job "${job.title}":`, jobError);
          // Continue with other jobs even if one fails
        }
      }
      
      console.log(`[ADMIN] Successfully inserted ${insertedCount}/${jobs.length} jobs to PostgreSQL`);
      
      return NextResponse.json({
        success: true,
        message: `Successfully added ${insertedCount} jobs to production database`,
        inserted: insertedCount,
        total: jobs.length,
        environment: 'production'
      });
      
    } else {
      // SQLite implementation for local testing
      const db = dbModule.getDatabase();
      
      let insertedCount = 0;
      
      const insertJob = db.prepare(`
        INSERT INTO jobs (
          title, description, full_description, location, company, department,
          seniority_level, required_skills, preferred_skills, salary_min, salary_max,
          employment_type, remote_eligible, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const job of jobs) {
        try {
          insertJob.run(
            job.title,
            job.description,
            job.full_description || job.description,
            job.location,
            job.company,
            job.department,
            job.seniority_level,
            JSON.stringify(job.required_skills),
            JSON.stringify(job.preferred_skills),
            job.salary_min,
            job.salary_max,
            job.employment_type,
            job.remote_eligible ? 1 : 0,
            1
          );
          insertedCount++;
        } catch (jobError) {
          console.error(`[ADMIN] Failed to insert job "${job.title}":`, jobError);
          // Continue with other jobs even if one fails
        }
      }
      
      console.log(`[ADMIN] Successfully inserted ${insertedCount}/${jobs.length} jobs to SQLite`);
      
      return NextResponse.json({
        success: true,
        message: `Successfully added ${insertedCount} jobs to local database`,
        inserted: insertedCount,
        total: jobs.length,
        environment: 'development'
      });
    }

  } catch (error: any) {
    console.error('[ADMIN] Error adding synthetic jobs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to add jobs', 
        details: error.message,
        environment: isProduction ? 'production' : 'development'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Synthetic job population endpoint',
    method: 'POST',
    auth: 'Bearer token required',
    environment: isProduction ? 'production' : 'development'
  });
}
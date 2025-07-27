import { NextRequest, NextResponse } from 'next/server';

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
    if (isProduction) {
      await dbModule.initializeDatabase();
      
      // Add enhanced_data column if it doesn't exist
      try {
        await dbModule.sql`
          DO $$ 
          BEGIN 
              IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                            WHERE table_name='candidates' AND column_name='enhanced_data') THEN
                  ALTER TABLE candidates ADD COLUMN enhanced_data TEXT;
              END IF;
          END $$;
        `;
        
        // Add performance indexes
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_candidates_session_id ON candidates(session_id);`;
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_candidates_experience_level ON candidates(experience_level);`;
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);`;
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);`;
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);`;
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON jobs(seniority_level);`;
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_job_matches_candidate ON job_matches(candidate_id);`;
        await dbModule.sql`CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);`;
        
        console.log('Production database migration completed successfully');
        
        return NextResponse.json({
          success: true,
          message: 'Database migration completed successfully! Enhanced_data column added.',
          environment: 'production',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
          { error: 'Migration failed', details: error },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({
        success: true,
        message: 'Local development database - no migration needed',
        environment: 'development'
      });
    }

  } catch (error: any) {
    console.error('Error in database migration:', error);
    return NextResponse.json(
      { 
        error: 'Migration failed', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
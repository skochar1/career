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
  return NextResponse.json({
    message: 'Migration endpoint is available. Use POST to run migration.',
    environment: isProduction ? 'production' : 'development'
  });
}

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - require a secret key (temporarily disabled for migration)
    // const authHeader = request.headers.get('authorization');
    // const expectedSecret = process.env.MIGRATION_SECRET || 'default-secret';
    
    // if (authHeader !== `Bearer ${expectedSecret}`) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

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
          message: 'Database migration completed successfully',
          environment: 'production'
        });
      } catch (error) {
        console.error('Migration error:', error);
        return NextResponse.json(
          { error: 'Migration failed', details: error },
          { status: 500 }
        );
      }
    } else {
      // SQLite migration
      const db = dbModule.getDatabase();
      
      try {
        // Check if enhanced_data column exists
        const tableInfo = db.prepare("PRAGMA table_info(candidates)").all();
        const hasEnhancedData = tableInfo.some((col: any) => col.name === 'enhanced_data');
        
        if (!hasEnhancedData) {
          db.exec('ALTER TABLE candidates ADD COLUMN enhanced_data TEXT;');
          console.log('Added enhanced_data column to SQLite database');
        }
        
        // Add indexes for SQLite
        try {
          db.exec('CREATE INDEX IF NOT EXISTS idx_candidates_session_id ON candidates(session_id);');
          db.exec('CREATE INDEX IF NOT EXISTS idx_candidates_experience_level ON candidates(experience_level);');
          db.exec('CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);');
          db.exec('CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);');
          db.exec('CREATE INDEX IF NOT EXISTS idx_jobs_department ON jobs(department);');
          db.exec('CREATE INDEX IF NOT EXISTS idx_jobs_seniority ON jobs(seniority_level);');
          db.exec('CREATE INDEX IF NOT EXISTS idx_job_matches_candidate ON job_matches(candidate_id);');
          db.exec('CREATE INDEX IF NOT EXISTS idx_job_matches_score ON job_matches(match_score DESC);');
        } catch (indexError: any) {
          console.log('Some indexes may already exist:', indexError?.message || indexError);
        }
        
        console.log('SQLite database migration completed successfully');
        
        return NextResponse.json({
          success: true,
          message: 'Database migration completed successfully',
          environment: 'development'
        });
      } catch (error) {
        console.error('SQLite migration error:', error);
        return NextResponse.json(
          { error: 'Migration failed', details: error },
          { status: 500 }
        );
      }
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
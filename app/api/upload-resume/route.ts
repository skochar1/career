import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '../../../lib/resume-parser';
import { analyzeResumeWithAI } from '../../../lib/ai-resume-analyzer';
import { calculateJobMatches } from '../../../lib/job-matcher';
import { matchCache } from '../../../lib/match-cache';

// Use PostgreSQL in production, SQLite in development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

let dbModule: any;
if (isProduction) {
  dbModule = require('../../../lib/database-postgres');
} else {
  dbModule = require('../../../lib/database');
}

export async function POST(request: NextRequest) {
  let file: File | undefined; // <-- Declare at the top for catch block!
  const debug: any = {}; // Collect debug info for API output

  try {
    const formData = await request.formData();
    file = formData.get('resume') as File;
    const sessionId = formData.get('sessionId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file uploaded' },
        { status: 400 }
      );
    }

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, TXT, DOC, or DOCX files.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB.' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract text from file first (using basic parser)
    console.log('[🔥 API] Starting resume text extraction for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    const basicData = await parseResume({
      buffer,
      filename: file.name,
      mimetype: file.type
    });
    debug.basicData = {
      skills: basicData.skills,
      summary: basicData.summary,
      rawTextLen: basicData.rawText?.length || 0,
      rawTextPreview: basicData.rawText?.slice(0, 250) || '',
    };

    // Enhanced AI analysis
    console.log('[🔥 API] Starting enhanced AI resume analysis');
    debug.analyzeResumeWithAI_start = true;
    const resumeData = await analyzeResumeWithAI(basicData.rawText);
    debug.resumeData = {
      skills: resumeData.skills,
      summary: resumeData.summary,
      rawTextLen: resumeData.rawText?.length || 0,
      rawTextPreview: resumeData.rawText?.slice(0, 250) || '',
    };
    console.log('[🔥 API] Enhanced AI resume analysis completed successfully');

    // Store candidate data in database
    let candidateId: number;
    debug.db = {};

    if (isProduction) {
      // PostgreSQL operations
      await dbModule.initializeDatabase();

      // Check if candidate already exists
      const { rows: existingCandidates } = await dbModule.sql`
        SELECT * FROM candidates WHERE session_id = ${sessionId}
      `;
      const existingCandidate = existingCandidates[0];

      try {
        if (existingCandidate) {
          // Try to update with enhanced_data first
          try {
            await dbModule.sql`
              UPDATE candidates 
              SET resume_filename = ${file.name}, 
                  resume_content = ${resumeData.rawText}, 
                  parsed_skills = ${JSON.stringify(resumeData.skills)}, 
                  experience_level = ${resumeData.experienceLevel}, 
                  preferred_locations = ${JSON.stringify(resumeData.preferredLocations || [])},
                  enhanced_data = ${JSON.stringify(resumeData)},
                  updated_at = CURRENT_TIMESTAMP
              WHERE session_id = ${sessionId}
            `;
          } catch (enhancedError: any) {
            if (enhancedError.code === '42703') {
              // enhanced_data column doesn't exist, update without it
              console.warn('enhanced_data column missing, updating without it');
              await dbModule.sql`
                UPDATE candidates 
                SET resume_filename = ${file.name}, 
                    resume_content = ${resumeData.rawText}, 
                    parsed_skills = ${JSON.stringify(resumeData.skills)}, 
                    experience_level = ${resumeData.experienceLevel}, 
                    preferred_locations = ${JSON.stringify(resumeData.preferredLocations || [])},
                    updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ${sessionId}
              `;
            } else {
              throw enhancedError;
            }
          }
          candidateId = existingCandidate.id;
        } else {
          // Try to create with enhanced_data first
          try {
            const { rows: newCandidate } = await dbModule.sql`
              INSERT INTO candidates (
                session_id, resume_filename, resume_content, parsed_skills, 
                experience_level, preferred_locations, enhanced_data
              ) VALUES (
                ${sessionId}, ${file.name}, ${resumeData.rawText}, 
                ${JSON.stringify(resumeData.skills)}, ${resumeData.experienceLevel}, 
                ${JSON.stringify(resumeData.preferredLocations || [])}, ${JSON.stringify(resumeData)}
              ) RETURNING id
            `;
            candidateId = newCandidate[0].id;
          } catch (enhancedError: any) {
            if (enhancedError.code === '42703') {
              // enhanced_data column doesn't exist, create without it
              console.warn('enhanced_data column missing, creating without it');
              const { rows: newCandidate } = await dbModule.sql`
                INSERT INTO candidates (
                  session_id, resume_filename, resume_content, parsed_skills, 
                  experience_level, preferred_locations
                ) VALUES (
                  ${sessionId}, ${file.name}, ${resumeData.rawText}, 
                  ${JSON.stringify(resumeData.skills)}, ${resumeData.experienceLevel}, 
                  ${JSON.stringify(resumeData.preferredLocations || [])}
                ) RETURNING id
              `;
              candidateId = newCandidate[0].id;
            } else {
              throw enhancedError;
            }
          }
        }
      } catch (dbError) {
        if (dbError && typeof dbError === "object" && "message" in dbError) {
          debug.db.error = (dbError as any).message;
        } else {
          debug.db.error = String(dbError);
        }
        console.error('Database operation failed:', dbError);
        throw dbError;
      }
    } else {
      // SQLite operations
      const db = dbModule.getDatabase();

      // Check if candidate already exists
      const existingCandidate = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get(sessionId);

      if (existingCandidate) {
        // Update existing candidate with enhanced data
        const updateStmt = db.prepare(`
          UPDATE candidates 
          SET resume_filename = ?, resume_content = ?, parsed_skills = ?, 
              experience_level = ?, preferred_locations = ?, enhanced_data = ?, updated_at = CURRENT_TIMESTAMP
          WHERE session_id = ?
        `);

        updateStmt.run(
          file.name,
          resumeData.rawText,
          JSON.stringify(resumeData.skills),
          resumeData.experienceLevel,
          JSON.stringify(resumeData.preferredLocations || []),
          JSON.stringify(resumeData),
          sessionId
        );

        candidateId = (existingCandidate as any).id;
      } else {
        // Create new candidate with enhanced data
        const insertStmt = db.prepare(`
          INSERT INTO candidates (
            session_id, resume_filename, resume_content, parsed_skills, 
            experience_level, preferred_locations, enhanced_data
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        const result = insertStmt.run(
          sessionId,
          file.name,
          resumeData.rawText,
          JSON.stringify(resumeData.skills),
          resumeData.experienceLevel,
          JSON.stringify(resumeData.preferredLocations || []),
          JSON.stringify(resumeData)
        );

        candidateId = Number(result.lastInsertRowid);
      }
    }

    // Invalidate cache for this session when new resume is uploaded
    matchCache.invalidateSession(sessionId);
    debug.cacheInvalidated = sessionId.substring(0, 8) + '...';

    // Calculate job matches
    debug.jobMatchStart = true;
    await calculateJobMatches(candidateId, resumeData);
    debug.jobMatchComplete = true;

    // Print the final debug state to server console as well
    console.log('[🔥 API] Debug:', JSON.stringify(debug, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      candidateId,
      parsedData: {
        skills: resumeData.skills,
        experienceLevel: resumeData.experienceLevel,
        preferredLocations: resumeData.preferredLocations,
        summary: resumeData.summary
      },
      debug // return for inspection
    });

  } catch (error: any) {
    console.error('Error processing resume:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size
    });

    return NextResponse.json(
      { 
        error: 'Failed to process resume', 
        details: error.message,
        errorType: error.name,
        fileInfo: file ? {
          name: file.name,
          type: file.type,
          size: file.size
        } : null
      },
      { status: 500 }
    );
  }
}

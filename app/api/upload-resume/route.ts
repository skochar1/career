import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '../../../lib/resume-parser';
import { calculateJobMatches } from '../../../lib/job-matcher';

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
    
    // Parse the resume using OpenAI
    console.log('Starting resume parsing for file:', file.name, 'Size:', file.size, 'Type:', file.type);
    const resumeData = await parseResume({
      buffer,
      filename: file.name,
      mimetype: file.type
    });
    console.log('Resume parsing completed successfully');

    // Store candidate data in database
    let candidateId: number;
    
    if (isProduction) {
      // PostgreSQL operations
      await dbModule.initializeDatabase();
      
      // Check if candidate already exists
      const { rows: existingCandidates } = await dbModule.sql`
        SELECT * FROM candidates WHERE session_id = ${sessionId}
      `;
      const existingCandidate = existingCandidates[0];
      
      if (existingCandidate) {
        // Update existing candidate
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
        candidateId = existingCandidate.id;
      } else {
        // Create new candidate
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
      }
    } else {
      // SQLite operations
      const db = dbModule.getDatabase();
      
      // Check if candidate already exists
      const existingCandidate = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get(sessionId);
      
      if (existingCandidate) {
        // Update existing candidate
        const updateStmt = db.prepare(`
          UPDATE candidates 
          SET resume_filename = ?, resume_content = ?, parsed_skills = ?, 
              experience_level = ?, preferred_locations = ?, updated_at = CURRENT_TIMESTAMP
          WHERE session_id = ?
        `);
        
        updateStmt.run(
          file.name,
          resumeData.rawText,
          JSON.stringify(resumeData.skills),
          resumeData.experienceLevel,
          JSON.stringify(resumeData.preferredLocations || []),
          sessionId
        );
        
        candidateId = (existingCandidate as any).id;
      } else {
        // Create new candidate
        const insertStmt = db.prepare(`
          INSERT INTO candidates (
            session_id, resume_filename, resume_content, parsed_skills, 
            experience_level, preferred_locations
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = insertStmt.run(
          sessionId,
          file.name,
          resumeData.rawText,
          JSON.stringify(resumeData.skills),
          resumeData.experienceLevel,
          JSON.stringify(resumeData.preferredLocations || [])
        );
        
        candidateId = Number(result.lastInsertRowid);
      }
    }

    // Calculate job matches
    console.log('Starting job matching calculation');
    await calculateJobMatches(candidateId, resumeData);
    console.log('Job matching calculation completed');

    return NextResponse.json({
      success: true,
      message: 'Resume uploaded and processed successfully',
      candidateId,
      parsedData: {
        skills: resumeData.skills,
        experienceLevel: resumeData.experienceLevel,
        preferredLocations: resumeData.preferredLocations,
        summary: resumeData.summary
      }
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

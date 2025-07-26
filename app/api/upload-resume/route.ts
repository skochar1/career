import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/database';
import { parseResume } from '../../../lib/resume-parser';
import { calculateJobMatches } from '../../../lib/job-matcher';
import multer from 'multer';
import { promisify } from 'util';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload PDF, TXT, DOC, or DOCX files.'));
    }
  }
});

const uploadMiddleware = promisify(upload.single('resume'));

export async function POST(request: NextRequest) {
  try {
    // Create a mock req/res for multer
    const formData = await request.formData();
    const file = formData.get('resume') as File;
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

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse the resume using OpenAI
    const resumeData = await parseResume({
      buffer,
      filename: file.name,
      mimetype: file.type
    });

    // Store candidate data in database
    const db = getDatabase();
    
    // Check if candidate already exists
    const existingCandidate = db.prepare('SELECT * FROM candidates WHERE session_id = ?').get(sessionId);
    
    let candidateId: number;
    
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
      
      candidateId = existingCandidate.id;
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
      
      candidateId = result.lastInsertRowid as number;
    }

    // Calculate job matches
    await calculateJobMatches(candidateId, resumeData);

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
    return NextResponse.json(
      { error: 'Failed to process resume', details: error.message },
      { status: 500 }
    );
  }
}
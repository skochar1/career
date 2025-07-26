import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    const sessionId = formData.get('session_id') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to text/base64 depending on file type
    let fileContent = '';
    const fileType = file.type;
    
    if (fileType.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      // Handle text files directly
      fileContent = await file.text();
    } else if (fileType === 'application/pdf' || file.name.endsWith('.pdf')) {
      // For PDF files, we'll convert to base64 and let OpenAI handle it
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      fileContent = `[PDF Document - Base64: ${base64.substring(0, 100)}...]`;
    } else {
      // For other file types, convert to base64
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      fileContent = `[${file.type || 'Unknown'} Document - Base64: ${base64.substring(0, 100)}...]`;
    }

    // Process with OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional resume analyzer and career advisor. Analyze the provided resume and extract:
          1. Personal information (name, contact details)
          2. Skills and technologies
          3. Work experience summary
          4. Education background
          5. Key achievements
          6. Recommendations for improvement
          7. Suggested job titles/roles based on experience
          
          Return your analysis in a structured JSON format.`
        },
        {
          role: "user",
          content: `Please analyze this resume file (${file.name}, ${file.type}):

          ${fileContent}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.1,
    });

    const analysis = completion.choices[0]?.message?.content;
    
    // Try to parse as JSON, fallback to plain text
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis || '{}');
    } catch {
      parsedAnalysis = {
        raw_analysis: analysis,
        error: "Could not parse structured analysis"
      };
    }

    // Store the analysis (you might want to save this to your database)
    const result = {
      session_id: sessionId,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      analysis: parsedAnalysis,
      processed_at: new Date().toISOString(),
      success: true
    };

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error processing resume:', error);
    
    return NextResponse.json({ 
      error: 'Failed to process resume',
      details: error.message,
      success: false
    }, { status: 500 });
  }
}
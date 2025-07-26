import OpenAI from 'openai';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY environment variable is not set!');
}

interface ResumeFile {
  buffer: Buffer;
  filename: string;
  mimetype: string;
}

export interface ParsedResumeData {
  skills: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'vp' | 'executive';
  preferredLocations?: string[];
  summary: string;
  rawText: string;
  education?: string[];
  workExperience?: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
}

export async function parseResume(file: ResumeFile): Promise<ParsedResumeData> {
  try {
    console.log('Processing file type:', file.mimetype, 'Size:', file.size);
    
    // Use OpenAI to directly process the file content
    console.log('Starting OpenAI file processing...');
    const parsedData = await parseWithOpenAIFile(file);
    console.log('OpenAI file processing completed successfully');
    
    return parsedData;

  } catch (error: any) {
    console.error('Error parsing resume:', error);
    throw new Error(`Failed to parse resume file: ${error.message}`);
  }
}

async function parseWithOpenAIFile(file: ResumeFile): Promise<ParsedResumeData> {
  try {
    // Convert file content based on type
    let extractedText: string = '';
    
    if (file.mimetype === 'text/plain') {
      console.log('Processing text file...');
      extractedText = file.buffer.toString('utf-8');
    } else if (
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      console.log('Processing binary file...');
      
      // For PDF and DOCX files, we'll attempt to extract text using a simple approach
      // and then send the extracted text to OpenAI for parsing
      let rawText = '';
      
      if (file.mimetype === 'application/pdf') {
        // Use pdf-parse library for proper PDF text extraction
        try {
          console.log('Extracting text from PDF using pdf-parse...');
          const pdfData = await pdfParse(file.buffer);
          rawText = pdfData.text;
          console.log('PDF text extracted successfully, length:', rawText.length);
        } catch (error) {
          console.log('PDF parsing failed:', error);
          // Fallback to basic extraction
          try {
            rawText = file.buffer.toString('utf-8');
            rawText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
            rawText = rawText.replace(/\s+/g, ' ').trim();
          } catch {
            rawText = 'PDF content needs manual processing';
          }
        }
      } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // Use mammoth library for proper DOCX text extraction
        try {
          console.log('Extracting text from DOCX using mammoth...');
          const result = await mammoth.extractRawText({ buffer: file.buffer });
          rawText = result.value;
          console.log('DOCX text extracted successfully, length:', rawText.length);
        } catch (error) {
          console.log('DOCX parsing failed:', error);
          // Fallback to basic extraction
          try {
            rawText = file.buffer.toString('utf-8');
            rawText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
            rawText = rawText.replace(/\s+/g, ' ').trim();
          } catch {
            rawText = 'DOCX content needs manual processing';
          }
        }
      } else {
        // For older DOC files, try basic text extraction
        try {
          rawText = file.buffer.toString('utf-8');
          rawText = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
          rawText = rawText.replace(/\s+/g, ' ').trim();
        } catch (error) {
          console.log('DOC text extraction failed');
          rawText = 'DOC content needs manual processing';
        }
      }
      
      // If we have reasonable text content, parse it with OpenAI
      if (rawText.length > 50) {
        console.log('Extracted text length:', rawText.length);
        const parsedData = await parseWithOpenAI(rawText);
        return {
          ...parsedData,
          rawText: rawText
        };
      } else {
        // If text extraction failed, return a basic structure
        console.log('Text extraction minimal, returning basic structure');
        return {
          skills: [],
          experienceLevel: 'mid' as const,
          preferredLocations: [],
          summary: `${file.mimetype === 'application/pdf' ? 'PDF' : 'DOCX'} file uploaded successfully. For best results, please upload a text file or ensure your ${file.mimetype === 'application/pdf' ? 'PDF' : 'DOCX'} contains selectable text.`,
          education: [],
          workExperience: [],
          rawText: file.filename || 'Resume file uploaded'
        };
      }
      
    } else {
      throw new Error(`Unsupported file type: ${file.mimetype}`);
    }

    // For text files, use the existing text parsing method
    if (extractedText) {
      console.log('Text extracted, length:', extractedText.length);
      const parsedData = await parseWithOpenAI(extractedText);
      return {
        ...parsedData,
        rawText: extractedText
      };
    }
    
    throw new Error('No content could be extracted from the file');

  } catch (error: any) {
    console.error('Error in parseWithOpenAIFile:', error);
    
    // Fallback for any file type - try to extract basic text
    let fallbackText = '';
    try {
      fallbackText = file.buffer.toString('utf-8');
    } catch {
      fallbackText = 'Resume content could not be extracted';
    }
    
    return {
      skills: [],
      experienceLevel: 'mid',
      preferredLocations: [],
      summary: 'Resume uploaded but could not be fully processed. Please try a different format.',
      education: [],
      workExperience: [],
      rawText: fallbackText
    };
  }
}

async function parseWithOpenAI(resumeText: string): Promise<Omit<ParsedResumeData, 'rawText'>> {
  const prompt = `
Please analyze the following resume text and extract structured information. 

Resume text:
${resumeText}

Please respond with a JSON object containing the following fields:

1. "skills": An array of technical and professional skills mentioned in the resume
2. "experienceLevel": One of "junior", "mid", "senior", "lead", "vp", or "executive" based on years of experience and role level
3. "preferredLocations": An array of locations mentioned as preferred or current locations (if any)
4. "summary": A 2-3 sentence summary of the candidate's background and expertise
5. "education": An array of educational qualifications/degrees mentioned
6. "workExperience": An array of objects with "company", "position", "duration", and "description" for each job

Make sure the response is valid JSON. If any information is not available, use null or empty arrays as appropriate.

Example response format:
{
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "experienceLevel": "mid",
  "preferredLocations": ["San Francisco", "Remote"],
  "summary": "Full-stack developer with 5 years of experience building web applications using modern JavaScript frameworks.",
  "education": ["B.S. Computer Science - University of California"],
  "workExperience": [
    {
      "company": "Tech Corp",
      "position": "Software Engineer",
      "duration": "2020-2023",
      "description": "Developed web applications using React and Node.js"
    }
  ]
}
`;

  try {
    console.log('Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional resume parser. Extract structured information from resumes and respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000
    });

    console.log('OpenAI API response received');
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('Parsing JSON response from OpenAI...');
    // Parse the JSON response
    const parsedData = JSON.parse(content);
    console.log('JSON parsed successfully');
    
    // Validate and sanitize the response
    return {
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      experienceLevel: validateExperienceLevel(parsedData.experienceLevel),
      preferredLocations: Array.isArray(parsedData.preferredLocations) ? parsedData.preferredLocations : [],
      summary: typeof parsedData.summary === 'string' ? parsedData.summary : 'No summary available',
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      workExperience: Array.isArray(parsedData.workExperience) ? parsedData.workExperience : []
    };

  } catch (error) {
    console.error('Error parsing with OpenAI:', error);
    
    // Fallback: basic keyword extraction
    return {
      skills: extractBasicSkills(resumeText),
      experienceLevel: 'mid',
      preferredLocations: [],
      summary: 'Resume processed successfully',
      education: [],
      workExperience: []
    };
  }
}

function validateExperienceLevel(level: string): ParsedResumeData['experienceLevel'] {
  const validLevels: ParsedResumeData['experienceLevel'][] = ['junior', 'mid', 'senior', 'lead', 'vp', 'executive'];
  return validLevels.includes(level as any) ? level as ParsedResumeData['experienceLevel'] : 'mid';
}

function extractBasicSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'TypeScript', 'AWS', 'Docker', 'Kubernetes', 'Git', 'Linux', 'MongoDB',
    'PostgreSQL', 'Redis', 'GraphQL', 'REST API', 'Microservices', 'Agile',
    'Project Management', 'Leadership', 'Communication', 'Problem Solving',
    'Data Analysis', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy'
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}
import OpenAI from 'openai';
import pdfParse from 'pdf-parse';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  // Extract text from file based on type
  let extractedText: string;

  try {
    if (file.mimetype === 'application/pdf') {
      const pdfData = await pdfParse(file.buffer);
      extractedText = pdfData.text;
    } else if (file.mimetype === 'text/plain') {
      extractedText = file.buffer.toString('utf-8');
    } else if (
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // For now, treat as text - you might want to add proper DOC/DOCX parsing
      extractedText = file.buffer.toString('utf-8');
    } else {
      throw new Error('Unsupported file type');
    }

    // Use OpenAI to parse and structure the resume data
    const parsedData = await parseWithOpenAI(extractedText);
    
    return {
      ...parsedData,
      rawText: extractedText
    };

  } catch (error) {
    console.error('Error parsing resume:', error);
    throw new Error('Failed to parse resume file');
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

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    const parsedData = JSON.parse(content);
    
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
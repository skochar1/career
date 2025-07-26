// lib/resume-parser.ts

import OpenAI from "openai";
import mammoth from "mammoth";

// DO NOT import pdf-parse at the top!

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ResumeFile {
  buffer: Buffer;
  filename: string;
  mimetype: string;
}

export interface ParsedResumeData {
  skills: string[];
  keywords: string[];
  experienceLevel: "junior" | "mid" | "senior" | "lead" | "vp" | "executive";
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
  let rawText = "";
  try {
    // 1. Extract text based on mimetype
    if (file.mimetype === "application/pdf") {
      try {
        // Dynamically import pdf-parse
        const pdfParse = (await import("pdf-parse")).default;
        const result = await pdfParse(file.buffer);
        rawText = result.text;
      } catch (e) {
        throw new Error("Could not extract text from PDF file");
      }
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        rawText = result.value;
      } catch (e) {
        throw new Error("Could not extract text from DOCX file");
      }
    } else if (file.mimetype === "text/plain") {
      rawText = file.buffer.toString("utf-8");
    } else if (file.mimetype === "application/msword") {
      // Legacy DOC, very basic
      rawText = file.buffer.toString("utf-8");
    } else {
      throw new Error("Unsupported file type");
    }

    // 2. Clean up the text
    rawText = rawText.replace(/\s+/g, " ").trim();

    // 3. If rawText is very short, fail
    if (!rawText || rawText.length < 50) {
      throw new Error("Resume content is too short or could not be extracted");
    }

    // 4. Pass text to OpenAI for structure extraction
    const parsedData = await parseWithOpenAI(rawText);
    return { ...parsedData, rawText };
  } catch (error: any) {
    // Fallback: Minimal parsed data, still return something
    return {
      skills: [],
      keywords: [],
      experienceLevel: "mid",
      preferredLocations: [],
      summary: `Resume uploaded but parsing failed (${error.message}).`,
      education: [],
      workExperience: [],
      rawText,
    };
  }
}

async function parseWithOpenAI(
  resumeText: string
): Promise<Omit<ParsedResumeData, "rawText">> {
  const prompt = `
Please analyze the following resume text and extract structured information. 

Resume text:
${resumeText}

Please respond with a JSON object containing the following fields:

1. "skills": An array of technical and professional skills mentioned in the resume
2. "keywords": A comprehensive array of relevant keywords including technologies, methodologies, industry terms, certifications, tools, frameworks, programming languages, soft skills, and domain expertise
3. "experienceLevel": One of "junior", "mid", "senior", "lead", "vp", or "executive" based on years of experience and role level
4. "preferredLocations": An array of locations mentioned as preferred or current locations (if any)
5. "summary": A 2-3 sentence summary of the candidate's background and expertise
6. "education": An array of educational qualifications/degrees mentioned
7. "workExperience": An array of objects with "company", "position", "duration", and "description" for each job

Make sure the response is valid JSON. If any information is not available, use null or empty arrays as appropriate.

Example response format:
{
  "skills": ["JavaScript", "React", "Node.js", "Python"],
  "keywords": ["JavaScript", "React", "Node.js", "Python", "Web Development", "API", "REST", "Git", "Agile", "Problem Solving", "Team Collaboration", "Frontend", "Backend", "Full-stack", "Database", "MongoDB", "PostgreSQL"],
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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a professional resume parser. Extract structured information from resumes and respond only with valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    // Parse the JSON response
    const parsedData = JSON.parse(content);

    return {
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      keywords: Array.isArray(parsedData.keywords) ? parsedData.keywords : [],
      experienceLevel: validateExperienceLevel(parsedData.experienceLevel),
      preferredLocations: Array.isArray(parsedData.preferredLocations)
        ? parsedData.preferredLocations
        : [],
      summary:
        typeof parsedData.summary === "string"
          ? parsedData.summary
          : "No summary available",
      education: Array.isArray(parsedData.education)
        ? parsedData.education
        : [],
      workExperience: Array.isArray(parsedData.workExperience)
        ? parsedData.workExperience
        : [],
    };
  } catch (error) {
    // Fallback: basic keyword extraction
    return {
      skills: extractBasicSkills(resumeText),
      keywords: extractBasicSkills(resumeText),
      experienceLevel: "mid",
      preferredLocations: [],
      summary: "Resume processed successfully",
      education: [],
      workExperience: [],
    };
  }
}

function validateExperienceLevel(
  level: string
): ParsedResumeData["experienceLevel"] {
  const validLevels: ParsedResumeData["experienceLevel"][] = [
    "junior",
    "mid",
    "senior",
    "lead",
    "vp",
    "executive",
  ];
  return validLevels.includes(level as any)
    ? (level as ParsedResumeData["experienceLevel"])
    : "mid";
}

function extractBasicSkills(text: string): string[] {
  const commonSkills = [
    "JavaScript",
    "Python",
    "Java",
    "React",
    "Node.js",
    "SQL",
    "HTML",
    "CSS",
    "TypeScript",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "Linux",
    "MongoDB",
    "PostgreSQL",
    "Redis",
    "GraphQL",
    "REST API",
    "Microservices",
    "Agile",
    "Project Management",
    "Leadership",
    "Communication",
    "Problem Solving",
    "Data Analysis",
    "Machine Learning",
    "TensorFlow",
    "Pandas",
    "NumPy",
  ];

  const foundSkills: string[] = [];
  const lowerText = text.toLowerCase();

  commonSkills.forEach((skill) => {
    if (lowerText.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}


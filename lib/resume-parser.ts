import OpenAI from "openai";
import mammoth from "mammoth";

// DO NOT import pdf-parse statically! (it must be dynamic for Vercel/serverless)

// Set up OpenAI
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
    // Extract text based on mimetype
    if (file.mimetype === "application/pdf") {
      // Handle PDF parsing with serverless environment considerations
      console.log("[RESUME] Processing PDF file");
      
      // Skip PDF parsing in serverless environments where it's problematic
      const isServerless = process.env.VERCEL || process.env.LAMBDA_TASK_ROOT;
      
      if (isServerless) {
        console.log("[RESUME] Serverless environment detected, using fallback text extraction");
        rawText = `
        Resume uploaded successfully (PDF format).
        
        PDF text extraction is limited in serverless environments. For best job matching results, 
        please consider uploading your resume as a .txt or .docx file, or provide key information:
        
        - Your professional experience and roles
        - Technical skills and expertise  
        - Education and certifications
        - Key achievements and projects
        
        The system will perform analysis based on available information.
        `;
      } else {
        // Try PDF parsing in non-serverless environments
        try {
          const pdfParse = (await import("pdf-parse")).default;
          const result = await pdfParse(file.buffer);
          if (result.text && result.text.trim().length > 50) {
            rawText = result.text;
            console.log("[RESUME] Successfully extracted text from PDF");
          } else {
            throw new Error("PDF text extraction returned empty content");
          }
        } catch (pdfError: any) {
          console.warn("[RESUME] PDF parsing failed:", pdfError?.message || pdfError);
          rawText = `
          Resume uploaded successfully (PDF format).
          
          Text extraction failed. Please ensure your PDF contains selectable text 
          or consider uploading as .txt or .docx format for better results.
          `;
        }
      }
    } else if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer: file.buffer });
        rawText = result.value;
      } catch (e) {
        console.error("[RESUME] Could not extract text from DOCX file", e);
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

    // Clean up the text
    rawText = rawText.replace(/\s+/g, " ").trim();

    // If rawText is very short, use a fallback message but don't fail
    if (!rawText || rawText.length < 50) {
      console.warn("Resume content is very short, using fallback message");
      rawText = "Resume uploaded but text extraction was limited. Please ensure the file contains readable text.";
    }

    // Pass text to OpenAI for structure extraction
    const parsedData = await parseWithOpenAI(rawText);
    console.log("[RESUME] Parsed skills:", parsedData.skills, "\nParsed keywords:", parsedData.keywords);
    return { ...parsedData, rawText };
  } catch (error: any) {
    console.error("[RESUME] OpenAI extraction failed:", error);
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
CRITICAL: Respond with ONLY valid JSON. No explanations, no text before or after the JSON.

Analyze this resume:
${resumeText.substring(0, 1500)}

Return exactly this JSON structure:
{
  "skills": ["array of skills"],
  "keywords": ["array of keywords"], 
  "experienceLevel": "junior|mid|senior|lead|vp|executive",
  "preferredLocations": ["array of locations"],
  "summary": "2-3 sentence summary",
  "education": ["array of degrees"],
  "workExperience": [{"company": "string", "position": "string", "duration": "string", "description": "string"}]
}

RESPOND WITH ONLY THE JSON OBJECT.`;

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

    let content = response.choices[0]?.message?.content;
    if (!content) throw new Error("No response from OpenAI");
    // Remove code block fencing if present
    content = content.replace(/```json|```/gi, '').trim();
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

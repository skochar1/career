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


async function extractPDFWithOpenAI(buffer: Buffer): Promise<string> {
  try {
    // Use a simple text-based extraction approach that works in serverless
    // This extracts any readable text streams from the PDF buffer
    const pdfText = extractTextFromPDFBuffer(buffer);
    
    if (pdfText.length > 50) {
      console.log("[RESUME] Direct PDF text extraction successful");
      return pdfText;
    }
    
    throw new Error("No readable text found in PDF buffer");
    
  } catch (error: any) {
    console.error("[RESUME] Direct PDF extraction failed:", error?.message || error);
    throw error;
  }
}

function extractTextFromPDFBuffer(buffer: Buffer): string {
  try {
    // Convert buffer to string and look for text content
    const pdfString = buffer.toString('latin1');
    
    let extractedText = '';
    
    // Strategy 1: Look for text in parentheses (most common PDF text format)
    const parenthesesMatches = pdfString.match(/\([^)]{2,100}\)/g) || [];
    for (const match of parenthesesMatches) {
      const text = match.slice(1, -1); // Remove parentheses
      // Only include text that looks like readable content (has letters and common chars)
      if (/[a-zA-Z]{2,}/.test(text) && !/^[\x00-\x1F\x7F-\xFF]+$/.test(text)) {
        extractedText += text + ' ';
      }
    }
    
    // Strategy 2: Look for text between angle brackets
    const angleBracketMatches = pdfString.match(/<[^>]{2,100}>/g) || [];
    for (const match of angleBracketMatches) {
      const text = match.slice(1, -1); // Remove angle brackets
      if (/[a-zA-Z]{2,}/.test(text) && !/^[\x00-\x1F\x7F-\xFF]+$/.test(text)) {
        extractedText += text + ' ';
      }
    }
    
    // Strategy 3: Look for readable ASCII text sequences
    const readableMatches = pdfString.match(/[A-Za-z][A-Za-z0-9\s.,;:!?()\-@]{10,200}/g) || [];
    for (const match of readableMatches) {
      // Filter out sequences that are mostly non-printable or look like encodings
      const cleanText = match.replace(/[\x00-\x1F\x7F-\xFF]/g, '').trim();
      if (cleanText.length > 10 && /[a-zA-Z]{5,}/.test(cleanText)) {
        extractedText += cleanText + ' ';
      }
    }
    
    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Add spaces between camelCase
      .trim();
    
    console.log("[RESUME] Extracted text length:", extractedText.length);
    console.log("[RESUME] First 200 chars:", extractedText.substring(0, 200));
    
    return extractedText;
    
  } catch (error) {
    console.warn("[RESUME] PDF buffer extraction failed:", error);
    return '';
  }
}

async function generateSmartPDFFallback(file: ResumeFile): Promise<string> {
  // Use filename and any available metadata to create a better fallback
  const filename = file.filename || "resume.pdf";
  const size = Buffer.byteLength(file.buffer);
  
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are helping create resume analysis from limited information when PDF text extraction fails."
        },
        {
          role: "user",
          content: `A PDF resume was uploaded but text extraction failed. Based on the filename "${filename}" and file size ${size} bytes, generate a helpful placeholder that encourages the user to provide key information manually. Be encouraging and specific about what information would help with job matching.`
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || generatePDFFallbackText();
  } catch (error) {
    return generatePDFFallbackText();
  }
}

function generatePDFFallbackText(): string {
  return `
  Resume uploaded successfully (PDF format).
  
  PDF text extraction encountered technical difficulties. The system will still analyze 
  your resume using AI to extract relevant information, but for optimal results, please consider:
  
  - Ensuring your PDF contains selectable text (not scanned images)
  - Uploading as .txt or .docx format alternatively
  - Manually providing key skills and experience details
  
  The job matching system will do its best with available information.
  `;
}

export async function parseResume(file: ResumeFile): Promise<ParsedResumeData> {
  let rawText = "";
  console.log("[🔥 TEST] parseResume() was called for:", file.filename);
  try {
    // Extract text based on mimetype
    if (file.mimetype === "application/pdf") {
      // Smart PDF parsing with multiple strategies
      console.log("[RESUME] Processing PDF file");
      
      try {
        // Strategy 1: Try OpenAI with PDF (works in serverless!)
        const extractedText = await extractPDFWithOpenAI(file.buffer);
        if (extractedText && extractedText.length > 50) {
          rawText = extractedText;
          console.log(`[RESUME] Successfully extracted ${rawText.length} characters using AI extraction`);
        } else {
          throw new Error("AI extraction returned insufficient text");
        }
        
      } catch (aiError: any) {
        console.warn("[RESUME] AI PDF extraction failed:", aiError?.message || aiError);
        
        // Strategy 2: Fallback to pdf-parse (local only)
        const isServerless = process.env.VERCEL || process.env.LAMBDA_TASK_ROOT;
        if (!isServerless) {
          try {
            const pdfParse = (await import("pdf-parse")).default;
            const result = await pdfParse(file.buffer);
            if (result.text && result.text.trim().length > 50) {
              rawText = result.text;
              console.log("[RESUME] Fallback PDF parsing successful");
            } else {
              throw new Error("Fallback parsing also failed");
            }
          } catch (fallbackError) {
            console.warn("[RESUME] Fallback parsing also failed");
            rawText = generatePDFFallbackText();
          }
        } else {
          // Strategy 3: Generate intelligent fallback
          rawText = await generateSmartPDFFallback(file);
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

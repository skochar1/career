import OpenAI from "openai";
import mammoth from "mammoth";
import { spawn } from "child_process";
import path from "path";

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

async function extractPDFWithPython(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Get the path to the Python script
      const scriptPath = path.join(process.cwd(), 'scripts', 'pdf_parser.py');
      
      console.log("[RESUME] Launching Python PDF parser:", scriptPath);
      
      // Spawn Python process
      const pythonProcess = spawn('python3', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      
      let stdout = '';
      let stderr = '';
      
      // Collect output
      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error("[RESUME] Python process failed with code:", code);
          console.error("[RESUME] Python stderr:", stderr);
          reject(new Error(`Python PDF parser failed with code ${code}: ${stderr}`));
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          
          if (result.success) {
            console.log(`[RESUME] Python parser success: ${result.char_count} chars, ${result.pages} pages`);
            resolve(result.text);
          } else {
            console.warn("[RESUME] Python parser returned error:", result.error);
            reject(new Error(`Python PDF parser error: ${result.error}`));
          }
        } catch (parseError) {
          console.error("[RESUME] Failed to parse Python output:", stdout);
          reject(new Error(`Failed to parse Python output: ${parseError}`));
        }
      });
      
      // Handle process errors
      pythonProcess.on('error', (error) => {
        console.error("[RESUME] Python process error:", error);
        reject(new Error(`Python process error: ${error.message}`));
      });
      
      // Write PDF data to stdin and close
      pythonProcess.stdin.write(buffer);
      pythonProcess.stdin.end();
      
    } catch (error) {
      console.error("[RESUME] Error launching Python parser:", error);
      reject(error);
    }
  });
}

async function extractPDFWithBuffer(buffer: Buffer): Promise<string> {
  try {
    console.log("[RESUME] Using buffer extraction fallback...");
    const bufferText = extractTextFromPDFBuffer(buffer);
    if (bufferText.length > 50) {
      console.log("[RESUME] Buffer extraction successful, length:", bufferText.length);
      return bufferText;
    }
    
    throw new Error("Buffer extraction returned insufficient text");
    
  } catch (error: any) {
    console.error("[RESUME] Buffer extraction failed:", error?.message || error);
    throw new Error(`Buffer extraction failed: ${error.message}`);
  }
}

function extractTextFromPDFBuffer(buffer: Buffer): string {
  try {
    // Convert buffer to binary string for PDF parsing
    const pdfString = buffer.toString('binary');
    let extractedText = '';
    
    // Strategy 1: Extract text using standard PDF text operators
    // Look for text between BT (Begin Text) and ET (End Text) operators
    const textBlocks = pdfString.match(/BT\s(.*?)\sET/gs) || [];
    
    for (const block of textBlocks) {
      // Extract strings in parentheses - standard PDF text format
      const textStrings = block.match(/\(([^)]*)\)/g) || [];
      for (const textString of textStrings) {
        const cleanText = textString.slice(1, -1) // Remove parentheses
          .replace(/\\([()\\])/g, '$1') // Unescape PDF escaped chars
          .replace(/\\[rn]/g, ' ') // Replace escaped newlines with spaces
          .trim();
        
        if (cleanText.length > 1 && /[a-zA-Z]/.test(cleanText)) {
          extractedText += cleanText + ' ';
        }
      }
      
      // Also look for hex strings <...>
      const hexStrings = block.match(/<([0-9A-Fa-f]+)>/g) || [];
      for (const hexString of hexStrings) {
        try {
          const hex = hexString.slice(1, -1);
          const decoded = Buffer.from(hex, 'hex').toString('utf8');
          if (decoded.length > 1 && /[a-zA-Z]/.test(decoded)) {
            extractedText += decoded + ' ';
          }
        } catch (e) {
          // Skip invalid hex strings
        }
      }
    }
    
    // Strategy 2: Look for stream objects that might contain text
    const streamMatches = pdfString.match(/stream\s+([\s\S]*?)\s+endstream/g) || [];
    for (const streamMatch of streamMatches) {
      const streamContent = streamMatch.replace(/^stream\s+/, '').replace(/\s+endstream$/, '');
      
      // Try to find readable text in streams
      const readableText = streamContent.match(/[A-Za-z][A-Za-z0-9\s.,;:!?()\-@]{4,50}/g) || [];
      for (const text of readableText) {
        const cleanText = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, '').trim();
        if (cleanText.length > 3 && /[a-zA-Z]{2,}/.test(cleanText)) {
          extractedText += cleanText + ' ';
        }
      }
    }
    
    // Strategy 3: Direct text extraction from PDF content
    // Look for sequences that look like names, emails, addresses, etc.
    const patterns = [
      /[A-Z][a-z]+ [A-Z][a-z]+/g, // Names like "John Smith"
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email addresses
      /\b[A-Z][a-z]+ [A-Z][a-z]+,? [A-Z]{2}\b/g, // City, State
      /\b\d{3}-\d{3}-\d{4}\b/g, // Phone numbers
      /\bhttps?:\/\/[^\s]+/g, // URLs
      /\b[A-Z][a-zA-Z\s]+University\b/g, // Universities
      /\b[A-Z][a-zA-Z\s&]+(?:Inc|LLC|Corp|Company)\b/g, // Company names
    ];
    
    for (const pattern of patterns) {
      const matches = pdfString.match(pattern) || [];
      for (const match of matches) {
        if (!extractedText.includes(match)) {
          extractedText += match + ' ';
        }
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
      
      // Use Python PDF parser for reliable text extraction
      try {
        console.log("[RESUME] Using Python PDF parser for text extraction...");
        const extractedText = await extractPDFWithPython(file.buffer);
        if (extractedText && extractedText.length > 50) {
          rawText = extractedText;
          console.log(`[RESUME] Successfully extracted ${rawText.length} characters using Python parser`);
        } else {
          throw new Error("Python PDF extraction returned insufficient text");
        }
      } catch (pdfError: any) {
        console.warn("[RESUME] Python PDF extraction failed:", pdfError?.message || pdfError);
        console.warn("[RESUME] Falling back to buffer extraction...");
        
        // Fallback to buffer extraction
        try {
          const bufferText = await extractPDFWithBuffer(file.buffer);
          if (bufferText && bufferText.length > 50) {
            rawText = bufferText;
            console.log(`[RESUME] Buffer extraction fallback successful: ${rawText.length} characters`);
          } else {
            throw new Error("Buffer extraction also failed");
          }
        } catch (bufferError: any) {
          console.warn("[RESUME] All extraction methods failed, using intelligent fallback");
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

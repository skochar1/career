import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface SmartSearchResult {
  expandedQuery: string;
  synonyms: string[];
  relatedTerms: string[];
  suggestedFilters: {
    departments?: string[];
    seniority?: string;
    skills?: string[];
  };
}

export async function enhanceSearchQuery(originalQuery: string): Promise<SmartSearchResult> {
  if (!originalQuery.trim()) {
    return {
      expandedQuery: '',
      synonyms: [],
      relatedTerms: [],
      suggestedFilters: {}
    };
  }

  try {
    const prompt = `
Analyze this job search query and enhance it for better job matching: "${originalQuery}"

Provide a JSON response with:
1. "expandedQuery": A more comprehensive search query including synonyms and related terms
2. "synonyms": Array of alternative terms for the main keywords
3. "relatedTerms": Array of related job titles, skills, or concepts
4. "suggestedFilters": Object with potential filters:
   - "departments": Array of relevant departments (Engineering, Marketing, Sales, Healthcare, Finance, Analytics, Design, Operations, Education)
   - "seniority": Suggested seniority level (junior, mid, senior, lead, vp, executive) if applicable
   - "skills": Array of related technical or professional skills

Example:
Input: "frontend developer"
Output: {
  "expandedQuery": "frontend developer UI UX React Vue Angular JavaScript TypeScript web development",
  "synonyms": ["frontend engineer", "front-end developer", "UI developer", "web developer"],
  "relatedTerms": ["React developer", "Vue.js developer", "JavaScript developer", "UI/UX designer"],
  "suggestedFilters": {
    "departments": ["Engineering"],
    "seniority": "mid",
    "skills": ["JavaScript", "React", "HTML", "CSS", "TypeScript"]
  }
}

Respond only with valid JSON.
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a job search expert. Analyze search queries and provide enhanced search terms and filters. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content);
    return {
      expandedQuery: result.expandedQuery || originalQuery,
      synonyms: Array.isArray(result.synonyms) ? result.synonyms : [],
      relatedTerms: Array.isArray(result.relatedTerms) ? result.relatedTerms : [],
      suggestedFilters: {
        departments: Array.isArray(result.suggestedFilters?.departments) ? result.suggestedFilters.departments : [],
        seniority: result.suggestedFilters?.seniority || undefined,
        skills: Array.isArray(result.suggestedFilters?.skills) ? result.suggestedFilters.skills : []
      }
    };

  } catch (error) {
    console.error('Error enhancing search query:', error);
    // Fallback to basic expansion
    return {
      expandedQuery: originalQuery,
      synonyms: [],
      relatedTerms: [],
      suggestedFilters: {}
    };
  }
}

export function buildSmartSearchTerms(originalQuery: string, enhancement: SmartSearchResult): string {
  const allTerms = [
    originalQuery,
    ...enhancement.synonyms,
    ...enhancement.relatedTerms
  ].filter(term => term && term.trim());

  // Remove duplicates and join
  const uniqueTerms = [...new Set(allTerms.map(term => term.toLowerCase()))];
  return uniqueTerms.join(' ');
}
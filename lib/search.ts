interface SearchDocument {
  id: number;
  title: string;
  description: string;
  location: string;
  company: string;
  department?: string;
  seniority_level: string;
  required_skills: string[];
  preferred_skills: string[];
  employment_type: string;
  searchableText: string;
}

interface SearchIndex {
  [term: string]: Set<number>;
}

class JobSearchEngine {
  private index: SearchIndex = {};
  private documents: Map<number, SearchDocument> = new Map();
  private isIndexBuilt = false;

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2);
  }

  private createSearchableText(job: any): string {
    const skills = [
      ...(job.required_skills || []),
      ...(job.preferred_skills || [])
    ].join(' ');
    
    return [
      job.title,
      job.description,
      job.location,
      job.company,
      job.department || '',
      job.seniority_level,
      job.employment_type,
      skills
    ].join(' ');
  }

  addDocument(job: any): void {
    const searchableText = this.createSearchableText(job);
    const document: SearchDocument = {
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      company: job.company,
      department: job.department,
      seniority_level: job.seniority_level,
      required_skills: job.required_skills || [],
      preferred_skills: job.preferred_skills || [],
      employment_type: job.employment_type,
      searchableText
    };

    this.documents.set(job.id, document);

    const tokens = this.tokenize(searchableText);
    tokens.forEach(token => {
      if (!this.index[token]) {
        this.index[token] = new Set();
      }
      this.index[token].add(job.id);
    });
  }

  removeDocument(jobId: number): void {
    const document = this.documents.get(jobId);
    if (!document) return;

    const tokens = this.tokenize(document.searchableText);
    tokens.forEach(token => {
      if (this.index[token]) {
        this.index[token].delete(jobId);
        if (this.index[token].size === 0) {
          delete this.index[token];
        }
      }
    });

    this.documents.delete(jobId);
  }

  search(query: string, options: {
    limit?: number;
    offset?: number;
    filters?: {
      location?: string;
      seniority_level?: string;
      department?: string;
      remote_eligible?: boolean;
    };
  } = {}): { results: SearchDocument[]; total: number } {
    if (!query.trim()) {
      return { results: [], total: 0 };
    }

    const tokens = this.tokenize(query);
    if (tokens.length === 0) {
      return { results: [], total: 0 };
    }

    const scoredResults = new Map<number, number>();

    tokens.forEach((token) => {
      const exactMatches = this.index[token] || new Set();
      
      const prefixMatches = new Set<number>();
      Object.keys(this.index).forEach(indexToken => {
        if (indexToken.startsWith(token) && indexToken !== token) {
          this.index[indexToken].forEach(id => prefixMatches.add(id));
        }
      });

      const partialMatches = new Set<number>();
      Object.keys(this.index).forEach(indexToken => {
        if (indexToken.includes(token) && !indexToken.startsWith(token)) {
          this.index[indexToken].forEach(id => partialMatches.add(id));
        }
      });

      exactMatches.forEach(id => {
        const currentScore = scoredResults.get(id) || 0;
        scoredResults.set(id, currentScore + 3);
      });

      prefixMatches.forEach(id => {
        const currentScore = scoredResults.get(id) || 0;
        scoredResults.set(id, currentScore + 2);
      });

      partialMatches.forEach(id => {
        const currentScore = scoredResults.get(id) || 0;
        scoredResults.set(id, currentScore + 1);
      });
    });

    let filteredIds = Array.from(scoredResults.keys());

    if (options.filters) {
      filteredIds = filteredIds.filter(id => {
        const doc = this.documents.get(id);
        if (!doc) return false;

        if (options.filters!.location && !doc.location.toLowerCase().includes(options.filters!.location.toLowerCase())) {
          return false;
        }
        if (options.filters!.seniority_level && doc.seniority_level !== options.filters!.seniority_level) {
          return false;
        }
        if (options.filters!.department && (!doc.department || !doc.department.toLowerCase().includes(options.filters!.department.toLowerCase()))) {
          return false;
        }

        return true;
      });
    }

    filteredIds.sort((a, b) => (scoredResults.get(b) || 0) - (scoredResults.get(a) || 0));

    const total = filteredIds.length;
    const offset = options.offset || 0;
    const limit = options.limit || 20;
    
    const paginatedIds = filteredIds.slice(offset, offset + limit);
    const results = paginatedIds
      .map(id => this.documents.get(id))
      .filter((doc): doc is SearchDocument => doc !== undefined);

    return { results, total };
  }

  buildIndex(jobs: any[]): void {
    this.index = {};
    this.documents.clear();
    
    jobs.forEach(job => this.addDocument(job));
    this.isIndexBuilt = true;
  }

  isReady(): boolean {
    return this.isIndexBuilt;
  }

  getStats() {
    return {
      totalDocuments: this.documents.size,
      totalTerms: Object.keys(this.index).length,
      averageTermsPerDocument: this.documents.size > 0 ? 
        Object.values(this.index).reduce((sum, set) => sum + set.size, 0) / this.documents.size : 0
    };
  }
}

export const jobSearchEngine = new JobSearchEngine();

export function initializeSearchIndex(jobs: any[]): void {
  jobSearchEngine.buildIndex(jobs);
}

export function addJobToIndex(job: any): void {
  jobSearchEngine.addDocument(job);
}

export function removeJobFromIndex(jobId: number): void {
  jobSearchEngine.removeDocument(jobId);
}

export function searchJobs(
  query: string,
  options: {
    limit?: number;
    offset?: number;
    filters?: {
      location?: string;
      seniority_level?: string;
      department?: string;
      remote_eligible?: boolean;
    };
  } = {}
) {
  return jobSearchEngine.search(query, options);
}
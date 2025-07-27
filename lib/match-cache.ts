interface CachedMatch {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  explanation: string;
  careerFitScore: number;
  salaryAlignment: 'below' | 'within' | 'above' | 'unknown';
  recommendations: string[];
  timestamp: number;
}

interface SessionCache {
  candidateEmbedding?: number[];
  enhancedResumeData?: any;
  jobMatches: Map<number, CachedMatch>;
  lastUpdated: number;
}

class MatchCacheManager {
  private sessionCaches = new Map<string, SessionCache>();
  private embeddingsCache = new Map<string, number[]>();
  private CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private SESSION_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  getSessionCache(sessionId: string): SessionCache {
    if (!this.sessionCaches.has(sessionId)) {
      this.sessionCaches.set(sessionId, {
        jobMatches: new Map(),
        lastUpdated: Date.now()
      });
    }
    return this.sessionCaches.get(sessionId)!;
  }

  setCandidateData(sessionId: string, embedding: number[], enhancedData: any) {
    const cache = this.getSessionCache(sessionId);
    cache.candidateEmbedding = embedding;
    cache.enhancedResumeData = enhancedData;
    cache.lastUpdated = Date.now();
  }

  getCachedMatch(sessionId: string, jobId: number): CachedMatch | null {
    const cache = this.getSessionCache(sessionId);
    const match = cache.jobMatches.get(jobId);
    
    if (!match) return null;
    
    // Check if cache is still valid
    if (Date.now() - match.timestamp > this.CACHE_DURATION) {
      cache.jobMatches.delete(jobId);
      return null;
    }
    
    return match;
  }

  setCachedMatch(sessionId: string, jobId: number, match: Omit<CachedMatch, 'timestamp'>) {
    const cache = this.getSessionCache(sessionId);
    cache.jobMatches.set(jobId, {
      ...match,
      timestamp: Date.now()
    });
  }

  getEmbedding(key: string): number[] | null {
    return this.embeddingsCache.get(key) || null;
  }

  setEmbedding(key: string, embedding: number[]) {
    this.embeddingsCache.set(key, embedding);
  }

  invalidateSession(sessionId: string) {
    this.sessionCaches.delete(sessionId);
  }

  // Clean up expired caches
  cleanup() {
    const now = Date.now();
    
    // Clean up session caches
    for (const [sessionId, cache] of this.sessionCaches.entries()) {
      if (now - cache.lastUpdated > this.SESSION_CACHE_DURATION) {
        this.sessionCaches.delete(sessionId);
      }
    }
    
    // Limit embeddings cache size
    if (this.embeddingsCache.size > 1000) {
      const entries = Array.from(this.embeddingsCache.entries());
      entries.slice(0, 500).forEach(([key]) => this.embeddingsCache.delete(key));
    }
  }

  getStats() {
    return {
      activeSessions: this.sessionCaches.size,
      totalCachedMatches: Array.from(this.sessionCaches.values())
        .reduce((sum, cache) => sum + cache.jobMatches.size, 0),
      embeddingsCacheSize: this.embeddingsCache.size
    };
  }
}

export const matchCache = new MatchCacheManager();

// Cleanup every 30 minutes - only in non-edge environments
if (typeof setInterval !== 'undefined') {
  setInterval(() => matchCache.cleanup(), 30 * 60 * 1000);
}
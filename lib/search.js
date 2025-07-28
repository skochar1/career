"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSearchEngine = void 0;
exports.initializeSearchIndex = initializeSearchIndex;
exports.addJobToIndex = addJobToIndex;
exports.removeJobFromIndex = removeJobFromIndex;
exports.searchJobs = searchJobs;
class JobSearchEngine {
    constructor() {
        this.index = {};
        this.documents = new Map();
        this.isIndexBuilt = false;
    }
    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 2);
    }
    createSearchableText(job) {
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
    addDocument(job) {
        const searchableText = this.createSearchableText(job);
        const document = {
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
            remote_eligible: job.remote_eligible || 0,
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
    removeDocument(jobId) {
        const document = this.documents.get(jobId);
        if (!document)
            return;
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
    search(query, options = {}) {
        if (!query.trim()) {
            return { results: [], total: 0 };
        }
        const tokens = this.tokenize(query);
        if (tokens.length === 0) {
            return { results: [], total: 0 };
        }
        const scoredResults = new Map();
        tokens.forEach((token) => {
            const exactMatches = this.index[token] || new Set();
            const prefixMatches = new Set();
            Object.keys(this.index).forEach(indexToken => {
                if (indexToken.startsWith(token) && indexToken !== token) {
                    this.index[indexToken].forEach(id => prefixMatches.add(id));
                }
            });
            const partialMatches = new Set();
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
                if (!doc)
                    return false;
                if (options.filters.location && !doc.location.toLowerCase().includes(options.filters.location.toLowerCase())) {
                    return false;
                }
                if (options.filters.seniority_level && doc.seniority_level !== options.filters.seniority_level) {
                    return false;
                }
                if (options.filters.department && (!doc.department || !doc.department.toLowerCase().includes(options.filters.department.toLowerCase()))) {
                    return false;
                }
                // Handle work type filters - if any are selected, job must match at least one
                const hasWorkTypeFilters = options.filters.remote_eligible || options.filters.onsite || options.filters.hybrid;
                if (hasWorkTypeFilters) {
                    let matchesWorkType = false;
                    if (options.filters.remote_eligible && doc.remote_eligible === 1) {
                        matchesWorkType = true;
                    }
                    if (options.filters.onsite && doc.remote_eligible === 0) {
                        matchesWorkType = true;
                    }
                    if (options.filters.hybrid) {
                        const text = (doc.title + ' ' + doc.description).toLowerCase();
                        if (text.includes('hybrid')) {
                            matchesWorkType = true;
                        }
                    }
                    if (!matchesWorkType) {
                        return false;
                    }
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
            .filter((doc) => doc !== undefined);
        return { results, total };
    }
    buildIndex(jobs) {
        this.index = {};
        this.documents.clear();
        jobs.forEach(job => this.addDocument(job));
        this.isIndexBuilt = true;
    }
    isReady() {
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
exports.jobSearchEngine = new JobSearchEngine();
function initializeSearchIndex(jobs) {
    exports.jobSearchEngine.buildIndex(jobs);
}
function addJobToIndex(job) {
    exports.jobSearchEngine.addDocument(job);
}
function removeJobFromIndex(jobId) {
    exports.jobSearchEngine.removeDocument(jobId);
}
function searchJobs(query, options = {}) {
    return exports.jobSearchEngine.search(query, options);
}

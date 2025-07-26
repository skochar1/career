"use client";

import { useEffect, useState } from "react";
import { MapPin, Clock, Building, Bookmark, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  department: string;
  seniority_level: string;
  description: string;
  full_description?: string; // <--- Add this!
  required_skills: string[];
  preferred_skills: string[];
  salary_min: number;
  salary_max: number;
  employment_type: string;
  remote_eligible: number;
  created_at?: string;
}

interface JobListingsProps {
  filters?: any;
  sortBy?: string;
  searchQuery?: string;
  locationQuery?: string;
  onSortChange?: (sort: string) => void;
}

export function JobListings({ 
  filters: externalFilters, 
  sortBy: externalSortBy, 
  searchQuery, 
  locationQuery, 
  onSortChange 
}: JobListingsProps = {}) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);
  const [sessionId, setSessionId] = useState<string>('');
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [parsedResumeData, setParsedResumeData] = useState<any>(null);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [filters, setFilters] = useState<any>(null);

  useEffect(() => {
    // Check if user has uploaded resume on component mount
    const hasResume = localStorage.getItem('has-uploaded-resume') === 'true';
    const storedSessionId = localStorage.getItem('career-session-id');
    
    if (hasResume && storedSessionId) {
      setSessionId(storedSessionId);
      setIsPersonalized(true);
      fetchPersonalizedJobs(storedSessionId);
    } else {
      fetchDefaultJobs();
    }

    // Listen for resume upload events
    const handleResumeUpload = (event: CustomEvent) => {
      const { sessionId: newSessionId, parsedData } = event.detail;
      setSessionId(newSessionId);
      setIsPersonalized(true);
      setParsedResumeData(parsedData);
      fetchPersonalizedJobs(newSessionId);
    };

    window.addEventListener('resumeUploaded', handleResumeUpload as EventListener);
    
    return () => {
      window.removeEventListener('resumeUploaded', handleResumeUpload as EventListener);
    };
  }, []);

  // Refetch jobs when filters, sorting, or search change
  useEffect(() => {
    if (!isPersonalized) {
      fetchDefaultJobs(1);
    }
  }, [externalFilters, externalSortBy, searchQuery, locationQuery, isPersonalized]);

  const buildQueryParams = (page = 1) => {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '5');
    
    // Add sorting
    const currentSortBy = externalSortBy || sortBy;
    if (currentSortBy && currentSortBy !== 'relevance') {
      params.set('sort', currentSortBy);
    }
    
    // Add search parameters
    if (searchQuery?.trim()) {
      params.set('search', searchQuery.trim());
    }
    
    // Add filters
    const currentFilters = externalFilters || filters;
    if (currentFilters) {
      if (currentFilters.workType?.length > 0) {
        if (currentFilters.workType.includes('Remote')) {
          params.set('remote', 'true');
        }
      }
      if (currentFilters.jobType?.length > 0) {
        params.set('employment_type', currentFilters.jobType.join(','));
      }
      if (currentFilters.department?.length > 0) {
        params.set('department', currentFilters.department.join(','));
      }
      if (currentFilters.seniority) {
        params.set('seniority_level', currentFilters.seniority.toLowerCase());
      }
      if (currentFilters.location) {
        params.set('location', currentFilters.location);
      }
    }
    
    // Add location from search if not in filters
    if (locationQuery?.trim() && !currentFilters?.location) {
      params.set('location', locationQuery.trim());
    }
    
    return params.toString();
  };

  const fetchDefaultJobs = async (page = 1) => {
    setLoading(page === 1);
    try {
      const queryString = buildQueryParams(page);
      const res = await fetch(`/api/jobs?${queryString}`);
      const data = await res.json();
      
      if (page === 1) {
        setJobs(data.jobs || []);
        setCurrentPage(1);
      } else {
        setJobs(prev => [...prev, ...(data.jobs || [])]);
        setCurrentPage(page);
      }
      
      setTotalJobs(data.pagination?.total || 0);
      setHasMore(data.pagination?.hasNext || false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedJobs = async (sessionId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommendations?sessionId=${sessionId}&limit=20`);
      const data = await res.json();
      
      if (data.success && data.recommendations) {
        setJobs(data.recommendations);
        setTotalJobs(data.count);
        setHasMore(false); // Recommendations don't need pagination for now
        setCurrentPage(1);
      } else {
        // Fallback to default jobs if no recommendations
        await fetchDefaultJobs();
        setIsPersonalized(false);
      }
    } catch (error) {
      console.error('Error fetching personalized jobs:', error);
      // Fallback to default jobs
      await fetchDefaultJobs();
      setIsPersonalized(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreJobs = async () => {
    if (loadingMore || !hasMore || isPersonalized) return; // Don't load more for personalized
    
    setLoadingMore(true);
    await fetchDefaultJobs(currentPage + 1);
    setLoadingMore(false);
  };

  const resetToDefaultJobs = () => {
    localStorage.removeItem('has-uploaded-resume');
    localStorage.removeItem('career-session-id');
    setIsPersonalized(false);
    setSessionId('');
    setParsedResumeData(null);
    fetchDefaultJobs();
  };

  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
  };

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) newSet.delete(jobId);
      else newSet.add(jobId);
      return newSet;
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 text-lg">Loading jobs…</div>;
  }

  if (!jobs.length) {
    return <div className="p-8 text-center text-gray-500 text-lg">No jobs found.</div>;
  }

  return (
    <div className="flex-1" role="main" aria-label="Job search results">
      {/* Top bar */}
      <div className="flex items-center justify-between px-0 py-4">
        <div className="text-xl font-medium text-gray-500">
          {isPersonalized 
            ? `${jobs.length} personalized job recommendations` 
            : `Showing ${jobs.length} of ${totalJobs} jobs`
          }
        </div>
        {isPersonalized && (
          <button
            onClick={resetToDefaultJobs}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            View all jobs
          </button>
        )}
        {!isPersonalized && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-gray-600">Sort by:</label>
            <select 
              id="sort-select"
              value={externalSortBy || sortBy}
              onChange={(e) => {
                const newSort = e.target.value;
                setSortBy(newSort);
                onSortChange?.(newSort);
              }}
              className="border border-gray-200 rounded-xl px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Sort job results"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date Posted</option>
              <option value="salary">Salary</option>
              <option value="company">Company</option>
            </select>
          </div>
        )}
      </div>
      {/* Job list */}
      <div className="space-y-3">
        {jobs.map((job) => {
          const isExpanded = expandedJobs.has(job.id);
          const isSaved = savedJobs.has(job.id);
          const jobWithMatch = job as any; // Type assertion for match_score and matching_skills
          const matchScore = jobWithMatch.match_score;
          const matchingSkills = jobWithMatch.matching_skills || [];

          const getMatchScoreColor = (score?: number) => {
            if (!score) return '';
            if (score >= 80) return 'text-green-600 bg-green-100';
            if (score >= 60) return 'text-yellow-600 bg-yellow-100';
            return 'text-red-600 bg-red-100';
          };

          return (
            <div
              key={job.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition hover:shadow-md"
              role="listitem"
              aria-labelledby={`job-title-${job.id}`}
            >
              {/* Header: logo, title, tags, save/ext link */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className="rounded-xl flex-shrink-0 object-cover w-14 h-14 bg-gray-200 flex items-center justify-center font-bold text-lg text-gray-500"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {job.company?.split(" ").map(w => w[0]).join("").toUpperCase() || "?"}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <h3
                        id={`job-title-${job.id}`}
                        className="text-lg font-semibold text-gray-900 mr-2"
                      >
                        {job.title}
                      </h3>
                      {isPersonalized && matchScore && (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getMatchScoreColor(matchScore)}`}>
                          {matchScore}% Match
                        </span>
                      )}
                      {job.remote_eligible === 1 && (
                        <span className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs font-medium">
                          Remote
                        </span>
                      )}
                      {["Engineering", "Product"].includes(job.department) && (
                        <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium ml-2">
                          Actively hiring
                        </span>
                      )}
                    </div>

                    {/* Company/location/date */}
                    <div className="flex flex-wrap gap-4 items-center text-gray-500 text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" aria-hidden="true" />
                        <span>{job.company}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" aria-hidden="true" />
                        <span>{job.location}</span>
                      </span>
                      {/* Optional: add created_at or other info */}
                    </div>
                  </div>
                </div>
                {/* Save/ext links */}
                <div className="flex items-center gap-1">
                  <button
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
                    onClick={() => toggleSaveJob(job.id)}
                    aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title} to saved jobs`}
                    aria-pressed={isSaved}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${isSaved ? 'fill-current text-blue-600' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  <button
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
                    aria-label={`View ${job.title} on external site`}
                  >
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Salary/type */}
              <div className="flex items-center gap-2 mt-2 mb-2">
                <span className="bg-gray-100 text-gray-900 rounded px-2 py-1 text-sm font-medium">
                  {job.employment_type}
                </span>
                <span className="text-gray-800 font-semibold text-sm">
                  ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                </span>
              </div>

              {/* Description */}
              <div className="text-gray-500 text-sm mb-2 max-w-3xl">
                {isExpanded ? job.description : job.description.substring(0, 180) + (job.description.length > 180 ? '...' : '')}
              </div>
              <button
                className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline inline-flex items-center mb-2"
                onClick={() => toggleJobExpansion(job.id)}
                aria-expanded={isExpanded}
                aria-controls={`job-description-${job.id}`}
                aria-label={isExpanded ? `Show less details for ${job.title}` : `Show more details for ${job.title}`}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" aria-hidden="true" />
                    Read Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" aria-hidden="true" />
                    Read More
                  </>
                )}
              </button>

              {/* Skills */}
              <div className="mb-3">
                {isPersonalized && matchingSkills.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      ⭐ Your Matching Skills ({matchingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {matchingSkills.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(job.required_skills) && job.required_skills.map((skill) => {
                    const isMatching = isPersonalized && matchingSkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          isMatching 
                            ? 'bg-green-100 text-green-700 border border-green-300' 
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  className="bg-black text-white rounded px-4 py-2 font-medium text-sm hover:bg-gray-900 transition"
                  aria-label={`Apply for ${job.title} position`}
                >
                  Apply Now
                </button>
                <button
                  className="bg-white border border-gray-300 rounded px-4 py-2 text-gray-800 font-medium text-sm hover:bg-gray-100 transition"
                  aria-label={`View details for ${job.title}`}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Load More Button - only for non-personalized listings */}
      {!isPersonalized && hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMoreJobs}
            disabled={loadingMore}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loadingMore ? 'Loading...' : 'Load More Jobs'}
          </button>
        </div>
      )}
      
      {!isPersonalized && !hasMore && jobs.length > 0 && (
        <div className="text-center mt-6 text-gray-500">
          No more jobs to load
        </div>
      )}
      
      {isPersonalized && jobs.length > 0 && (
        <div className="text-center mt-6">
          <p className="text-gray-500 mb-4">
            These are your top job matches based on your resume
          </p>
          <button
            onClick={resetToDefaultJobs}
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Browse all available jobs
          </button>
        </div>
      )}
    </div>
  );
}

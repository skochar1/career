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
  const [allPersonalizedJobs, setAllPersonalizedJobs] = useState<any[]>([]);
  const [personalizedCurrentPage, setPersonalizedCurrentPage] = useState(1);
  const [isFetchingPersonalized, setIsFetchingPersonalized] = useState(false);

  useEffect(() => {
    // Always start with default jobs on page load
    // Only switch to personalized when explicitly triggered by resume upload
    console.log('JobListings: Initial useEffect triggered, calling fetchDefaultJobs');
    fetchDefaultJobs().catch(error => {
      console.error('Error fetching default jobs on mount:', error);
      setJobs([]);
      setLoading(false);
    });

    // Listen for resume upload events
    const handleResumeUpload = (event: CustomEvent) => {
      const { sessionId: newSessionId, parsedData } = event.detail;
      setSessionId(newSessionId);
      setIsPersonalized(true);
      setParsedResumeData(parsedData);
      // Clear cache to force fresh fetch for new resume
      setAllPersonalizedJobs([]);
      setIsFetchingPersonalized(false); // Reset fetching flag
      fetchPersonalizedJobs(newSessionId, true); // Force refresh for new resume
    };

    // Listen for UI refresh events to reset state
    const handleUIRefresh = () => {
      // Reset expanded jobs and other UI state
      setExpandedJobs(new Set());
      setSavedJobs(new Set());
      
      // Only reset to default jobs if there's no valid session ID
      // This preserves curated results after resume upload
      const hasResume = localStorage.getItem('has-uploaded-resume') === 'true';
      const storedSessionId = localStorage.getItem('career-session-id');
      
      if (hasResume && storedSessionId) {
        // Keep personalized state if we have a valid session
        if (!isPersonalized) {
          setSessionId(storedSessionId);
          setIsPersonalized(true);
          fetchPersonalizedJobs(storedSessionId, false); // Use cache
        }
      } else {
        // Only reset if no session exists
        setIsPersonalized(false);
        setSessionId('');
        setParsedResumeData(null);
        fetchDefaultJobs();
      }
    };

    // Listen for page visibility changes to refresh UI when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Don't automatically refresh on visibility change
        // Users should manually refresh or upload a new resume
        // This prevents disrupting curated results
        return;
      }
    };

    window.addEventListener('resumeUploaded', handleResumeUpload as EventListener);
    window.addEventListener('uiRefresh', handleUIRefresh as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('resumeUploaded', handleResumeUpload as EventListener);
      window.removeEventListener('uiRefresh', handleUIRefresh as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Refetch jobs when mode, filters, sorting, or search change
  useEffect(() => {
    let isMounted = true;
    
    const loadJobs = async () => {
      try {
        if (isPersonalized && sessionId) {
          // For personalized jobs, if we have cached data, just apply filters client-side
          if (allPersonalizedJobs.length > 0) {
            console.log('🎯 Applying filters to cached personalized jobs');
            const filteredJobs = applyClientSideFilters(allPersonalizedJobs);
            setTotalJobs(filteredJobs.length);
            const firstPage = filteredJobs.slice(0, 5);
            setJobs(firstPage);
            setHasMore(filteredJobs.length > 5);
            setCurrentPage(1);
            setPersonalizedCurrentPage(1);
          } else {
            // Only fetch if no cached data
            console.log('🎯 No cached data, fetching personalized jobs');
            if (isMounted) await fetchPersonalizedJobs(sessionId, false);
          }
        } else if (!isPersonalized) {
          if (isMounted) await fetchDefaultJobs(1);
        }
      } catch (error) {
        console.error('Error loading jobs in useEffect:', error);
        if (isMounted) {
          setJobs([]);
          setLoading(false);
        }
      }
    };
    
    loadJobs();
    
    return () => {
      isMounted = false;
    };
  }, [isPersonalized, sessionId, externalFilters, externalSortBy, searchQuery, locationQuery]);

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
        if (currentFilters.workType.includes('On-site')) {
          params.set('onsite', 'true');
        }
        if (currentFilters.workType.includes('Hybrid')) {
          params.set('hybrid', 'true');
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
    console.log('fetchDefaultJobs called with page:', page);
    if (page === 1) setLoading(true);
    try {
      const queryString = buildQueryParams(page);
      console.log('fetchDefaultJobs query string:', queryString);
      const res = await fetch(`/api/jobs?${queryString}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await res.json();
      console.log('fetchDefaultJobs received data:', data.jobs?.length, 'jobs');
      
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
      // Set empty state on error
      if (page === 1) {
        setJobs([]);
        setTotalJobs(0);
        setHasMore(false);
      }
    } finally {
      if (page === 1) setLoading(false);
    }
  };

  const buildPersonalizedQueryParams = (sessionId: string) => {
    const params = new URLSearchParams();
    params.set('sessionId', sessionId);
    params.set('limit', '50'); // Get more jobs to enable pagination
    
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
        if (currentFilters.workType.includes('On-site')) {
          params.set('onsite', 'true');
        }
        if (currentFilters.workType.includes('Hybrid')) {
          params.set('hybrid', 'true');
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

  const fetchPersonalizedJobs = async (sessionId: string, forceRefresh = false) => {
    // Skip if we already have cached data and not forcing refresh
    if (!forceRefresh && allPersonalizedJobs.length > 0) {
      console.log(`🎯 Skipping fetch - already have ${allPersonalizedJobs.length} cached jobs`);
      return;
    }
    
    // Skip if already fetching to prevent race conditions
    if (isFetchingPersonalized) {
      console.log(`🎯 Already fetching personalized jobs, skipping duplicate call`);
      return;
    }
    
    setIsFetchingPersonalized(true);
    setLoading(true);
    console.log(`🎯 Fetching personalized jobs for session ${sessionId.substring(0, 8)}...`);
    
    try {
      const queryString = buildPersonalizedQueryParams(sessionId);
      const res = await fetch(`/api/recommendations?${queryString}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }
      
      const data = await res.json();
      
      if (data.success && data.recommendations) {
        // Filter out jobs with match score ≤ 50%
        const filteredRecommendations = data.recommendations.filter((job: any) => 
          !job.match_score || job.match_score > 50
        );
        
        // Cache the full results
        setAllPersonalizedJobs(filteredRecommendations);
        console.log(`🎯 Cached ${filteredRecommendations.length} personalized jobs for session`);
        
        // Apply client-side filtering and show results
        const filteredJobs = applyClientSideFilters(filteredRecommendations);
        setTotalJobs(filteredJobs.length);
        setPersonalizedCurrentPage(1);
        
        // Show first 5 jobs
        const firstPage = filteredJobs.slice(0, 5);
        setJobs(firstPage);
        setHasMore(filteredJobs.length > 5);
        setCurrentPage(1);
      } else {
        // Fallback to empty state if no recommendations
        setJobs([]);
        setTotalJobs(0);
        setHasMore(false);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching personalized jobs:', error);
      setJobs([]);
      setTotalJobs(0);
      setHasMore(false);
      setCurrentPage(1);
    } finally {
      setLoading(false);
      setIsFetchingPersonalized(false);
    }
  };

  // Apply client-side filtering to personalized jobs
  const applyClientSideFilters = (jobs: any[]) => {
    let filteredJobs = [...jobs];
    
    const currentFilters = externalFilters || filters;
    
    // Apply search filter
    if (searchQuery?.trim()) {
      const searchLower = searchQuery.toLowerCase();
      filteredJobs = filteredJobs.filter((job: any) => 
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        (job.required_skills || []).some((skill: string) => skill.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply location filter
    if (locationQuery?.trim() && !currentFilters?.location) {
      filteredJobs = filteredJobs.filter((job: any) => 
        job.location.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }
    
    if (currentFilters?.location) {
      filteredJobs = filteredJobs.filter((job: any) => 
        job.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }
    
    // Apply department filter
    if (currentFilters?.department?.length > 0) {
      filteredJobs = filteredJobs.filter((job: any) => 
        currentFilters.department.some((dept: string) => 
          job.department.toLowerCase().includes(dept.toLowerCase())
        )
      );
    }
    
    // Apply employment type filter
    if (currentFilters?.jobType?.length > 0) {
      filteredJobs = filteredJobs.filter((job: any) => 
        currentFilters.jobType.some((type: string) => 
          job.employment_type.toLowerCase() === type.toLowerCase()
        )
      );
    }
    
    // Apply seniority filter
    if (currentFilters?.seniority) {
      filteredJobs = filteredJobs.filter((job: any) => 
        job.seniority_level.toLowerCase() === currentFilters.seniority.toLowerCase()
      );
    }
    
    // Apply work type filters
    if (currentFilters?.workType?.length > 0) {
      filteredJobs = filteredJobs.filter((job: any) => {
        const workTypes = currentFilters.workType;
        
        // If Remote is selected and job is remote eligible
        if (workTypes.includes('Remote') && job.remote_eligible === 1) return true;
        
        // If On-site is selected and job is not remote eligible
        if (workTypes.includes('On-site') && job.remote_eligible === 0) return true;
        
        // If Hybrid is selected and job mentions hybrid
        if (workTypes.includes('Hybrid') && 
            (job.title.toLowerCase().includes('hybrid') || job.description.toLowerCase().includes('hybrid'))) {
          return true;
        }
        
        // If multiple work types are selected, allow jobs that match any of them
        return false;
      });
    }
    
    return filteredJobs;
  };

  const loadMoreJobs = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    if (isPersonalized) {
      // Load more from filtered cached personalized jobs
      const filteredJobs = applyClientSideFilters(allPersonalizedJobs);
      const nextPage = personalizedCurrentPage + 1;
      const startIdx = (nextPage - 1) * 5;
      const endIdx = startIdx + 5;
      const nextJobs = filteredJobs.slice(startIdx, endIdx);
      
      if (nextJobs.length > 0) {
        setJobs(prev => [...prev, ...nextJobs]);
        setPersonalizedCurrentPage(nextPage);
        setHasMore(endIdx < filteredJobs.length);
      } else {
        setHasMore(false);
      }
    } else {
      await fetchDefaultJobs(currentPage + 1);
    }
    
    setLoadingMore(false);
  };

  const resetToDefaultJobs = () => {
    localStorage.removeItem('has-uploaded-resume');
    localStorage.removeItem('career-session-id');
    setIsPersonalized(false);
    setSessionId('');
    setParsedResumeData(null);
    setExpandedJobs(new Set());
    setSavedJobs(new Set());
    setAllPersonalizedJobs([]);
    setPersonalizedCurrentPage(1);
    setIsFetchingPersonalized(false);
    fetchDefaultJobs();
    
    // Dispatch UI refresh event to notify other components
    window.dispatchEvent(new CustomEvent('uiRefresh'));
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-0 py-4 gap-4">
        <div className="text-lg sm:text-xl font-medium text-gray-500">
          {isPersonalized 
            ? `Showing ${jobs.length} of ${totalJobs} curated results` 
            : `Showing ${jobs.length} of ${totalJobs} jobs`
          }
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {isPersonalized && (
            <button
              onClick={resetToDefaultJobs}
              className="text-sm text-gray-600 hover:text-gray-800 underline text-left sm:text-center"
            >
              View all jobs
            </button>
          )}
          {!isPersonalized && (
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
              <select 
                id="sort-select"
                value={externalSortBy || sortBy}
                onChange={(e) => {
                  const newSort = e.target.value;
                  setSortBy(newSort);
                  onSortChange?.(newSort);
                }}
                className="border border-gray-200 rounded-xl px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
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
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="rounded-xl flex-shrink-0 object-cover w-12 h-12 sm:w-14 sm:h-14 bg-gray-200 flex items-center justify-center font-bold text-sm sm:text-lg text-gray-500"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {job.company?.split(" ").map(w => w[0]).join("").toUpperCase() || "?"}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-2 sm:items-center mb-2">
                      <h3
                        id={`job-title-${job.id}`}
                        className="text-base sm:text-lg font-semibold text-gray-900 break-words"
                      >
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
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
                          <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
                            Actively hiring
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Company/location/date */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-4 text-gray-500 text-sm mb-1">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{job.company}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                        <span className="truncate">{job.location}</span>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Save/ext links */}
                <div className="flex flex-col sm:flex-row items-center gap-1">
                  <button
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
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
                {job.salary_min && job.salary_max ? (
                  <span className="text-gray-800 font-semibold text-sm">
                    ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">
                    Salary not disclosed
                  </span>
                )}
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
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  className="bg-black text-white rounded px-4 py-2 font-medium text-sm hover:bg-gray-900 transition flex-1 sm:flex-none"
                  aria-label={`Apply for ${job.title} position`}
                >
                  Apply Now
                </button>
                <button
                  className="bg-white border border-gray-300 rounded px-4 py-2 text-gray-800 font-medium text-sm hover:bg-gray-100 transition flex-1 sm:flex-none"
                  aria-label={`View details for ${job.title}`}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Load More Button */}
      {hasMore && (
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
      
      {!hasMore && jobs.length > 0 && (
        <div className="text-center mt-6 text-gray-500">
          {isPersonalized 
            ? `Showing all ${jobs.length} qualified job matches` 
            : 'No more jobs to load'
          }
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

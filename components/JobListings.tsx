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

export function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalJobs, setTotalJobs] = useState(0);

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      const res = await fetch("/api/jobs?page=1&limit=5");
      const data = await res.json();
      setJobs(data.jobs || []);
      setTotalJobs(data.pagination?.total || 0);
      setHasMore(data.pagination?.hasNext || false);
      setLoading(false);
    }
    fetchJobs();
  }, []);

  const loadMoreJobs = async () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    const nextPage = currentPage + 1;
    const res = await fetch(`/api/jobs?page=${nextPage}&limit=5`);
    const data = await res.json();
    
    if (data.jobs) {
      setJobs(prev => [...prev, ...data.jobs]);
      setCurrentPage(nextPage);
      setHasMore(data.pagination?.hasNext || false);
    }
    setLoadingMore(false);
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
          Showing {jobs.length} of {totalJobs} jobs
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-600">Sort by:</label>
          <select 
            id="sort-select"
            className="border border-gray-200 rounded-xl px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort job results"
            // Optional: implement sorting logic
          >
            <option value="relevance">Relevance</option>
            <option value="date">Date Posted</option>
            <option value="salary">Salary</option>
            <option value="company">Company</option>
          </select>
        </div>
      </div>
      {/* Job list */}
      <div className="space-y-3">
        {jobs.map((job) => {
          const isExpanded = expandedJobs.has(job.id);
          const isSaved = savedJobs.has(job.id);

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
              <div className="flex flex-wrap gap-2 mb-3">
                {Array.isArray(job.required_skills) && job.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
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
          No more jobs to load
        </div>
      )}
    </div>
  );
}

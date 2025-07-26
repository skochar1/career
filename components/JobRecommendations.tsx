"use client";

import { useEffect, useState } from "react";
import { MapPin, Building, Star, TrendingUp, ExternalLink, Bookmark } from "lucide-react";

interface JobRecommendation {
  id: number;
  title: string;
  company: string;
  location: string;
  department: string;
  seniority_level: string;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  salary_min: number;
  salary_max: number;
  employment_type: string;
  remote_eligible: number;
  match_score: number;
  matching_skills: string[];
}

interface JobRecommendationsProps {
  sessionId: string;
  limit?: number;
}

export function JobRecommendations({ sessionId, limit = 10 }: JobRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (sessionId) {
      fetchRecommendations();
    }
  }, [sessionId, limit]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/recommendations?sessionId=${sessionId}&limit=${limit}`);
      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations || []);
      } else {
        setError(data.error || 'Failed to fetch recommendations');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (jobId: number) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    return 'Partial Match';
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Finding your perfect matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchRecommendations}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No job recommendations found. Please upload your resume first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recommended Jobs for You
        </h2>
        <p className="text-gray-600">
          Found {recommendations.length} job{recommendations.length !== 1 ? 's' : ''} matching your profile
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((job) => {
          const isSaved = savedJobs.has(job.id);
          const matchScoreColor = getMatchScoreColor(job.match_score);
          const matchScoreLabel = getMatchScoreLabel(job.match_score);

          return (
            <div
              key={job.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header with match score */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${matchScoreColor}`}>
                      {job.match_score}% Match
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-600 text-sm mb-2">
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {job.location}
                    </span>
                    {job.remote_eligible === 1 && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                        Remote
                      </span>
                    )}
                  </div>

                  <p className="text-gray-600 text-sm">
                    {matchScoreLabel} • {job.department} • {job.seniority_level}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded"
                    aria-label={isSaved ? 'Remove from saved' : 'Save job'}
                  >
                    <Bookmark
                      className={`h-5 w-5 ${isSaved ? 'fill-current text-blue-600' : ''}`}
                    />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded">
                    <ExternalLink className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Job description */}
              <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                {job.description}
              </p>

              {/* Matching skills */}
              {job.matching_skills && job.matching_skills.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Star className="h-4 w-4 text-green-500" />
                    Matching Skills ({job.matching_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {job.matching_skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Salary and employment info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-medium">
                    {job.employment_type}
                  </span>
                  <span className="text-gray-800 font-semibold text-sm">
                    ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    View Details
                  </button>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {recommendations.length >= limit && (
        <div className="text-center">
          <button
            onClick={() => fetchRecommendations()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Load More Recommendations
          </button>
        </div>
      )}
    </div>
  );
}
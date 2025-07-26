"use client";

import { useState, useEffect } from "react";
import { ResumeUpload } from "./ResumeUpload";
import { JobRecommendations } from "./JobRecommendations";

export function ResumeBasedRecommendations() {
  const [sessionId, setSessionId] = useState<string>('');
  const [hasUploadedResume, setHasUploadedResume] = useState(false);

  useEffect(() => {
    // Generate or get session ID
    let id = localStorage.getItem('career-session-id');
    if (!id) {
      id = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('career-session-id', id);
    }
    setSessionId(id);

    // Check if user has already uploaded a resume
    const hasResume = localStorage.getItem('has-uploaded-resume') === 'true';
    setHasUploadedResume(hasResume);
  }, []);

  const handleUploadComplete = () => {
    setHasUploadedResume(true);
    localStorage.setItem('has-uploaded-resume', 'true');
  };

  const handleNewUpload = () => {
    setHasUploadedResume(false);
    localStorage.setItem('has-uploaded-resume', 'false');
  };

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {!hasUploadedResume ? (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Get Personalized Job Recommendations
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload your resume and let our AI analyze your skills and experience to find the perfect job matches for you.
            </p>
          </div>

          <ResumeUpload
            sessionId={sessionId}
            onUploadComplete={handleUploadComplete}
          />

          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Upload Resume</h3>
                <p className="text-sm text-gray-600">
                  Upload your resume in PDF, DOC, or TXT format
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI extracts your skills, experience, and preferences
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Get Matches</h3>
                <p className="text-sm text-gray-600">
                  Receive personalized job recommendations with match scores
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Your Job Recommendations
              </h1>
              <p className="text-gray-600">
                Based on your uploaded resume and profile analysis
              </p>
            </div>
            <button
              onClick={handleNewUpload}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Upload New Resume
            </button>
          </div>

          <JobRecommendations sessionId={sessionId} limit={20} />
        </div>
      )}
    </div>
  );
}
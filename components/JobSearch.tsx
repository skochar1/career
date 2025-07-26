"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Search, MapPin, Upload, FileText, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface JobSearchProps {
  onSearch?: (query: string, location: string) => void;
}

export function JobSearch({ onSearch }: JobSearchProps) {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  // Clear all state on component mount to ensure fresh start
  useEffect(() => {
    setUploadedFile(null);
    setUploadComplete(false);
    setIsUploading(false);
    setIsResumeDialogOpen(false);
    setIsDragOver(false);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size only - accept any file type
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB.');
        return;
      }
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Check file size only - accept any file type
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('File size must be less than 10MB.');
        return;
      }
      
      setUploadedFile(file);
    }
  };

  const handleSubmitResume = async () => {
    if (uploadedFile) {
      setIsUploading(true);
      
      try {
        // Generate or get session ID
        let sessionId = localStorage.getItem('career-session-id');
        if (!sessionId) {
          sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
          localStorage.setItem('career-session-id', sessionId);
        }
        
        const formData = new FormData();
        formData.append('resume', uploadedFile);
        formData.append('sessionId', sessionId);
        
        const response = await fetch('/api/upload-resume', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Resume processed:', result);
          setUploadComplete(true);
          
          // Store the session info and trigger job recommendations
          localStorage.setItem('has-uploaded-resume', 'true');
          
          // Dispatch custom event to notify JobListings component
          window.dispatchEvent(new CustomEvent('resumeUploaded', { 
            detail: { sessionId, parsedData: result.parsedData } 
          }));
          
        } else {
          // Get the actual error message from the response
          let errorMessage = 'Failed to process resume';
          try {
            const responseText = await response.text();
            console.error('Raw server response:', responseText);
            
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorData.details || errorMessage;
            console.error('Parsed server error:', errorData);
          } catch (e) {
            console.error('Failed to parse error response:', e);
            // If JSON parsing fails, try to get some info from the response
            console.error('Response status:', response.status);
            const headersObj: Record<string, string> = {};
            response.headers.forEach((value, key) => {
              headersObj[key] = value;
            });
            console.error('Response headers:', headersObj);
          }
          throw new Error(`Server error (${response.status}): ${errorMessage}`);
        }
      } catch (error) {
        console.error('Error processing resume:', error);
        alert('Error processing resume. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadComplete(false);
    setIsUploading(false);
    setIsResumeDialogOpen(false);
    setIsDragOver(false);
    
    // Dispatch event to notify other components to refresh
    window.dispatchEvent(new CustomEvent('uiRefresh'));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Search:", searchQuery, "Location:", locationQuery);
    onSearch?.(searchQuery, locationQuery);
  };

  const quickSearchTags = [
    { label: "Remote", value: "remote" },
    { label: "Full-time", value: "full-time" },
    { label: "Entry Level", value: "entry-level" },
    { label: "Tech", value: "tech" },
    { label: "$50K+", value: "50k+" }
  ];

  return (
    <div className="bg-background text-foreground">
      <div className="py-4" role="search" aria-label="Job search">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center rounded-full border border-gray-300 bg-white shadow-sm overflow-hidden">
              <Search className="h-4 w-4 text-gray-400 ml-4" aria-hidden="true" />
              <input
                id="job-search"
                placeholder="Job title, company, or keywords"
                className="flex-1 px-3 py-3 text-black focus:outline-none text-sm placeholder:text-gray-500 bg-transparent min-w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Job title, company, or keywords"
              />
            </div>

            <div className="flex items-center rounded-full border border-gray-300 bg-white shadow-sm overflow-hidden">
              <MapPin className="h-4 w-4 text-gray-400 ml-4" aria-hidden="true" />
              <input
                id="location-search"
                placeholder="City, state, zip code, or remote"
                className="flex-1 px-3 py-3 text-black focus:outline-none text-sm placeholder:text-gray-500 bg-transparent min-w-[300px]"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                aria-label="Location"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-white text-black border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
            >
              Search Jobs
            </button>
          </div>
        </form>

        <div className="text-center mb-4">
          <p className="mb-3 text-sm" style={{ color: "white", opacity: 1 }}>
            Or get personalized job recommendations
          </p>
          <Dialog 
            open={isResumeDialogOpen} 
            onOpenChange={(open) => {
              setIsResumeDialogOpen(open);
              if (!open) {
                // When dialog is closed, reset upload state if no successful upload
                if (!uploadComplete) {
                  setUploadedFile(null);
                  setIsUploading(false);
                  setIsDragOver(false);
                }
              }
            }}
          >
            <DialogTrigger asChild>
              <button className="inline-flex items-center px-6 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white font-medium text-sm">
                <Upload className="h-4 w-4 mr-2" />
                Submit Resume for Curated Results
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md !bg-white border border-gray-300 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Submit Your Resume</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Upload your resume to get personalized job recommendations.
                </DialogDescription>
              </DialogHeader>

              {!uploadComplete ? (
                <div className="space-y-4">
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center relative transition-all duration-200 ${
                      isDragOver 
                        ? '!border-blue-500 !bg-blue-50 shadow-md' 
                        : uploadedFile 
                          ? '!border-green-500 !bg-green-50 shadow-sm' 
                          : '!border-gray-400 !bg-gray-100 hover:!border-gray-600 hover:!bg-gray-200 hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: isDragOver ? '#dbeafe' : uploadedFile ? '#dcfce7' : '#f3f4f6',
                      borderColor: isDragOver ? '#3b82f6' : uploadedFile ? '#22c55e' : '#9ca3af'
                    }}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-3 text-green-700">
                        <FileText className="h-10 w-10" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900 text-base">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-600">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className={`transition-all duration-200 ${isDragOver ? 'scale-105' : ''}`}>
                        <Upload className={`h-12 w-12 mx-auto mb-3 ${isDragOver ? 'text-blue-600' : 'text-gray-600'}`} />
                        <p className={`text-base mb-2 font-medium ${isDragOver ? 'text-blue-800' : 'text-gray-700'}`}>
                          {isDragOver ? 'Drop your resume here!' : 'Drop your resume here or click to browse'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports any file type (Max 10MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="resume-upload"
                      type="file"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                  </div>

                  <div className="flex justify-between">
                    <button
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                      onClick={resetUpload}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                      onClick={handleSubmitResume}
                      disabled={!uploadedFile || isUploading}
                    >
                      {isUploading ? "Processing..." : "Get Curated Jobs"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Resume Submitted Successfully!</h3>
                  <p className="text-gray-500 mb-6">
                    We're analyzing your resume to find the best job matches.
                  </p>
                  <div className="space-y-2">
                    <button
                      className="w-full px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                      onClick={() => {
                        resetUpload();
                        // Small delay to ensure dialog closes before triggering refresh
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('uiRefresh'));
                        }, 100);
                      }}
                    >
                      View Curated Jobs
                    </button>
                    <button
                      className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-medium"
                      onClick={() => {
                        // Clear resume data and reset to allow new upload
                        localStorage.removeItem('has-uploaded-resume');
                        localStorage.removeItem('career-session-id');
                        resetUpload();
                        setTimeout(() => {
                          window.dispatchEvent(new CustomEvent('uiRefresh'));
                        }, 100);
                      }}
                    >
                      Upload Another Resume
                    </button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Quick Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {quickSearchTags.map((tag) => (
            <button
              key={tag.value}
              className="px-2 py-1 bg-blue-200 text-blue-900 border border-blue-400 rounded hover:opacity-80 text-xs"
              onClick={() => setSearchQuery(tag.value)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

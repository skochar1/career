"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Search, MapPin, Upload, FileText, Check } from "lucide-react";
import { useState } from "react";

export function JobSearch() {
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmitResume = () => {
    if (uploadedFile) {
      setIsUploading(true);
      // Simulate upload process
      setTimeout(() => {
        setIsUploading(false);
        setUploadComplete(true);
      }, 2000);
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadComplete(false);
    setIsUploading(false);
    setIsResumeDialogOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search logic
    console.log("Search:", searchQuery, "Location:", locationQuery);
  };

  const quickSearchTags = [
    { label: "Remote", value: "remote" },
    { label: "Full-time", value: "full-time" },
    { label: "Entry Level", value: "entry-level" },
    { label: "Tech", value: "tech" },
    { label: "$50K+", value: "50k+" }
  ];

  return (
    <div className="bg-white">
      {/* Search Section */}
      <div className="bg-gray-900 text-white py-8" role="search" aria-label="Job search">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-6 text-white">Find your next opportunity</h1>
            
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex items-center justify-center gap-1 mb-4">
                <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm">
                  <Search className="h-4 w-4 text-gray-400 ml-4" aria-hidden="true" />
                  <input
                    id="job-search"
                    placeholder="Job title, company, or keywords"
                    className="flex-1 px-3 py-3 bg-transparent text-black focus:outline-none text-sm placeholder:text-gray-500 border-none min-w-[300px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-describedby="job-search-help"
                  />
                  <Label htmlFor="job-search" className="sr-only">
                    Job title, company, or keywords
                  </Label>
                </div>
                <div className="flex items-center bg-white rounded-full border border-gray-300 shadow-sm">
                  <MapPin className="h-4 w-4 text-gray-400 ml-4" aria-hidden="true" />
                  <input
                    id="location-search"
                    placeholder="City, state, zip code, or remote"
                    className="flex-1 px-3 py-3 bg-transparent text-black focus:outline-none text-sm placeholder:text-gray-500 border-none min-w-[300px]"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    aria-describedby="location-search-help"
                  />
                  <Label htmlFor="location-search" className="sr-only">
                    Location
                  </Label>
                </div>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-white text-black border border-gray-300 rounded-full hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  aria-describedby="search-help"
                >
                  Search Jobs
                </button>
              </div>
              
              <div className="sr-only">
                <p id="job-search-help">Enter keywords, job titles, or company names to search for jobs</p>
                <p id="location-search-help">Enter a city, state, zip code, or type "remote" for remote positions</p>
                <p id="search-help">Click to search for jobs matching your criteria</p>
              </div>
            </form>

            {/* Resume Upload Section */}
            <div className="text-center mb-4">
              <p className="text-white/80 mb-3 text-sm">
                Or get personalized job recommendations
              </p>
              <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
                <DialogTrigger asChild>
                  <button 
                    className="inline-flex items-center px-6 py-2.5 bg-gray-800 text-white border border-gray-700 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent font-medium text-sm"
                    aria-describedby="resume-upload-help"
                  >
                    <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                    Submit Resume for Curated Results
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md" aria-describedby="resume-dialog-desc">
                  <DialogHeader>
                    <DialogTitle>Submit Your Resume</DialogTitle>
                    <DialogDescription id="resume-dialog-desc">
                      Upload your resume to get personalized job recommendations based on your skills and experience.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {!uploadComplete ? (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center relative">
                        {uploadedFile ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <FileText className="h-8 w-8" aria-hidden="true" />
                            <div>
                              <p className="font-medium">{uploadedFile.name}</p>
                              <p className="text-sm text-gray-500">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-500" aria-hidden="true" />
                            <p className="text-sm text-gray-500 mb-2">
                              Drop your resume here or click to browse
                            </p>
                            <p className="text-xs text-gray-500">
                              Supports PDF, DOC, DOCX (Max 5MB)
                            </p>
                          </div>
                        )}
                        <Label htmlFor="resume-upload" className="sr-only">
                          Upload resume file
                        </Label>
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          aria-describedby="file-upload-help"
                        />
                        <div className="sr-only">
                          <p id="file-upload-help">
                            Click to select a resume file or drag and drop. Supported formats: PDF, DOC, DOCX. Maximum size: 5MB.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <button 
                          className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                          onClick={resetUpload}
                        >
                          Cancel
                        </button>
                        <button 
                          className="px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                          onClick={handleSubmitResume} 
                          disabled={!uploadedFile || isUploading}
                          aria-describedby="submit-resume-help"
                        >
                          {isUploading ? "Processing..." : "Get Curated Jobs"}
                        </button>
                      </div>
                      <div className="sr-only">
                        <p id="submit-resume-help">
                          Submit your resume to receive personalized job recommendations
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="h-8 w-8 text-green-600" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">Resume Submitted Successfully!</h3>
                      <p className="text-gray-500 mb-6">
                        We're analyzing your resume to find the best job matches. You'll see personalized recommendations shortly.
                      </p>
                      <div className="space-y-2">
                        <button 
                          className="w-full px-4 py-2 text-sm text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                          onClick={resetUpload}
                        >
                          View Curated Jobs
                        </button>
                        <button 
                          className="w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium"
                          onClick={resetUpload}
                        >
                          Upload Another Resume
                        </button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
              <div className="sr-only">
                <p id="resume-upload-help">
                  Upload your resume to get AI-powered job recommendations tailored to your experience
                </p>
              </div>
            </div>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap justify-center" style={{gap: '32px'}}>
              <span className="sr-only">Quick search options:</span>
              {quickSearchTags.map((tag) => (
                <button 
                  key={tag.value}
                  className="hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-blue-300 transition-all"
                  style={{
                    padding: '2px 6px',
                    backgroundColor: '#7dd3fc',
                    color: '#1e40af',
                    fontSize: '9px',
                    lineHeight: '1',
                    border: '1px solid #38bdf8',
                    borderRadius: '4px'
                  }}
                  aria-label={`Quick search for ${tag.label}`}
                  onClick={() => {
                    setSearchQuery(tag.value);
                    // Trigger search
                  }}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

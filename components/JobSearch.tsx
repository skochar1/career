"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Search, MapPin, Upload, FileText, Check } from "lucide-react";
import { Badge } from "./ui/badge";
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

  const handleSubmitResume = async () => {
    if (uploadedFile) {
      setIsUploading(true);
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsUploading(false);
      setUploadComplete(true);
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
    <div className="bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm" role="banner">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-primary">
                <a href="/" className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">
                  JobSearch
                </a>
              </h1>
              <nav className="hidden md:flex gap-6" role="navigation" aria-label="Main navigation">
                <a href="#" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">Jobs</a>
                <a href="#" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">Companies</a>
                <a href="#" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">Salary</a>
                <a href="#" className="text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded">Resources</a>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline">Sign In</Button>
              <Button>Post a Job</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <div className="bg-primary text-primary-foreground py-8" role="search" aria-label="Job search">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-center mb-6">Find your next opportunity</h2>
            
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Label htmlFor="job-search" className="sr-only">
                    Job title, company, or keywords
                  </Label>
                  <Search 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                    aria-hidden="true"
                  />
                  <Input
                    id="job-search"
                    placeholder="Job title, company, or keywords"
                    className="pl-10 bg-white text-foreground"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-describedby="job-search-help"
                  />
                </div>
                <div className="flex-1 relative">
                  <Label htmlFor="location-search" className="sr-only">
                    Location
                  </Label>
                  <MapPin 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" 
                    aria-hidden="true"
                  />
                  <Input
                    id="location-search"
                    placeholder="City, state, zip code, or remote"
                    className="pl-10 bg-white text-foreground"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    aria-describedby="location-search-help"
                  />
                </div>
                <Button 
                  type="submit"
                  size="lg" 
                  className="bg-white text-primary hover:bg-gray-50"
                  aria-describedby="search-help"
                >
                  Search Jobs
                </Button>
              </div>
              
              <div className="sr-only">
                <p id="job-search-help">Enter keywords, job titles, or company names to search for jobs</p>
                <p id="location-search-help">Enter a city, state, zip code, or type "remote" for remote positions</p>
                <p id="search-help">Click to search for jobs matching your criteria</p>
              </div>
            </form>

            {/* Resume Upload Section */}
            <div className="text-center mb-4">
              <p className="text-primary-foreground/80 mb-3 text-sm">
                Or get personalized job recommendations
              </p>
              <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="secondary" 
                    className="bg-white/10 text-primary-foreground border-white/20 hover:bg-white/20"
                    aria-describedby="resume-upload-help"
                  >
                    <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
                    Submit Resume for Curated Results
                  </Button>
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
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center relative">
                        {uploadedFile ? (
                          <div className="flex items-center justify-center gap-2 text-green-600">
                            <FileText className="h-8 w-8" aria-hidden="true" />
                            <div>
                              <p className="font-medium">{uploadedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
                            <p className="text-sm text-muted-foreground mb-2">
                              Drop your resume here or click to browse
                            </p>
                            <p className="text-xs text-muted-foreground">
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
                        <Button variant="outline" onClick={resetUpload}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSubmitResume} 
                          disabled={!uploadedFile || isUploading}
                          aria-describedby="submit-resume-help"
                        >
                          {isUploading ? "Processing..." : "Get Curated Jobs"}
                        </Button>
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
                      <p className="text-muted-foreground mb-6">
                        We're analyzing your resume to find the best job matches. You'll see personalized recommendations shortly.
                      </p>
                      <div className="space-y-2">
                        <Button onClick={resetUpload} className="w-full">
                          View Curated Jobs
                        </Button>
                        <Button variant="outline" onClick={resetUpload} className="w-full">
                          Upload Another Resume
                        </Button>
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
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="sr-only">Quick search options:</span>
              {quickSearchTags.map((tag) => (
                <Badge 
                  key={tag.value}
                  variant="secondary" 
                  className="cursor-pointer hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  tabIndex={0}
                  role="button"
                  aria-label={`Quick search for ${tag.label}`}
                  onClick={() => {
                    setSearchQuery(tag.value);
                    // Trigger search
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSearchQuery(tag.value);
                      // Trigger search
                    }
                  }}
                >
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

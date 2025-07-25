"use client";

import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { MapPin, Clock, DollarSign, Building, Bookmark, ExternalLink, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useState } from "react";

const mockJobs = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "TechCorp",
    location: "San Francisco, CA",
    type: "Full-time",
    workType: "Remote",
    salary: "$120K - $180K",
    postedDate: "2 days ago",
    description: "We're looking for a Senior Software Engineer to join our growing team. You'll work on cutting-edge projects using React, Node.js, and AWS to build scalable web applications that serve millions of users.",
    fullDescription: "We're looking for a Senior Software Engineer to join our growing team. You'll work on cutting-edge projects using React, Node.js, and AWS to build scalable web applications that serve millions of users. In this role, you'll collaborate with product managers, designers, and other engineers to deliver high-quality software solutions. You'll also mentor junior developers and contribute to our engineering culture. We offer competitive compensation, equity, comprehensive health benefits, and flexible work arrangements.",
    skills: ["React", "Node.js", "AWS", "TypeScript"],
    logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=64&h=64&fit=crop&crop=entropy&auto=format",
    urgentHiring: true
  },
  {
    id: 2,
    title: "Product Manager",
    company: "InnovateCo",
    location: "New York, NY",
    type: "Full-time",
    workType: "Hybrid",
    salary: "$100K - $140K",
    postedDate: "1 day ago",
    description: "Join our product team to drive innovation and growth. We're looking for someone with strong analytical skills and experience in B2B SaaS products.",
    fullDescription: "Join our product team to drive innovation and growth. We're looking for someone with strong analytical skills and experience in B2B SaaS products. You'll be responsible for product strategy, roadmap planning, and working closely with engineering and design teams to deliver features that delight our customers. This role requires excellent communication skills and the ability to make data-driven decisions.",
    skills: ["Product Strategy", "Analytics", "Agile", "Leadership"],
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=entropy&auto=format",
    urgentHiring: false
  },
  {
    id: 3,
    title: "UX Designer",
    company: "DesignStudio",
    location: "Austin, TX",
    type: "Full-time",
    workType: "Remote",
    salary: "$80K - $120K",
    postedDate: "3 days ago",
    description: "We're seeking a talented UX Designer to create intuitive and engaging user experiences. You'll work closely with our product and engineering teams.",
    fullDescription: "We're seeking a talented UX Designer to create intuitive and engaging user experiences. You'll work closely with our product and engineering teams to design user-centered solutions that solve real problems. Your responsibilities will include user research, wireframing, prototyping, and usability testing. We value creativity, attention to detail, and a user-first mindset.",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
    logo: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=64&h=64&fit=crop&crop=entropy&auto=format",
    urgentHiring: true
  },
  {
    id: 4,
    title: "Data Scientist",
    company: "DataCorp",
    location: "Seattle, WA",
    type: "Full-time",
    workType: "On-site",
    salary: "$110K - $160K",
    postedDate: "5 days ago",
    description: "Looking for a Data Scientist to join our analytics team. You'll work with large datasets to drive business insights and build predictive models.",
    fullDescription: "Looking for a Data Scientist to join our analytics team. You'll work with large datasets to drive business insights and build predictive models. This role involves statistical analysis, machine learning, and data visualization to help our company make informed decisions. You'll collaborate with various teams to understand business needs and translate them into analytical solutions.",
    skills: ["Python", "SQL", "Machine Learning", "Statistics"],
    logo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=entropy&auto=format",
    urgentHiring: false
  },
  {
    id: 5,
    title: "Marketing Manager",
    company: "GrowthCo",
    location: "Chicago, IL",
    type: "Full-time",
    workType: "Hybrid",
    salary: "$70K - $100K",
    postedDate: "1 week ago",
    description: "We're looking for a Marketing Manager to lead our digital marketing efforts. You'll develop and execute marketing strategies across multiple channels.",
    fullDescription: "We're looking for a Marketing Manager to lead our digital marketing efforts. You'll develop and execute marketing strategies across multiple channels including social media, email marketing, content marketing, and paid advertising. The ideal candidate has experience with marketing automation tools, analytics platforms, and a proven track record of driving growth through data-driven marketing campaigns.",
    skills: ["Digital Marketing", "Content Strategy", "SEO", "Analytics"],
    logo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&crop=entropy&auto=format",
    urgentHiring: false
  }
];

export function JobListings() {
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set());
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set());

  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
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

  return (
    <div className="flex-1" role="main" aria-label="Job search results">
      {/* Results Info */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-muted-foreground">
              <span className="sr-only">Found </span>
              12,847 jobs found
            </p>
            <Button variant="outline" size="sm" aria-label="Toggle filters panel">
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              Filters
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="sort-select" className="text-sm text-muted-foreground">
              Sort by:
            </Label>
            <select 
              id="sort-select"
              className="border border-border rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              aria-label="Sort job results"
            >
              <option value="relevance">Relevance</option>
              <option value="date">Date Posted</option>
              <option value="salary">Salary</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job List */}
      <div className="p-6">
        <div className="space-y-4" role="list" aria-label="Job listings">
          {mockJobs.map((job) => {
            const isExpanded = expandedJobs.has(job.id);
            const isSaved = savedJobs.has(job.id);
            
            return (
              <Card 
                key={job.id} 
                className="hover:shadow-md transition-shadow focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                role="listitem"
                aria-labelledby={`job-title-${job.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <ImageWithFallback
                        src={job.logo}
                        alt={`${job.company} logo`}
                        width={48}
                        height={48}
                        className="rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 
                            id={`job-title-${job.id}`}
                            className="hover:text-primary cursor-pointer font-medium"
                            tabIndex={0}
                            role="button"
                            aria-describedby={`job-details-${job.id}`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                // Handle job title click
                              }
                            }}
                          >
                            {job.title}
                          </h3>
                          <Badge variant="outline" className="text-xs">
                            {job.workType}
                          </Badge>
                          {job.urgentHiring && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                              Actively hiring
                            </Badge>
                          )}
                        </div>
                        <div 
                          id={`job-details-${job.id}`}
                          className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap"
                        >
                          <span className="flex items-center gap-1">
                            <Building className="h-3 w-3" aria-hidden="true" />
                            {job.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" aria-hidden="true" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" aria-hidden="true" />
                            {job.postedDate}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                        aria-label={isSaved ? `Remove ${job.title} from saved jobs` : `Save ${job.title} to saved jobs`}
                        aria-pressed={isSaved}
                      >
                        <Bookmark 
                          className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} 
                          aria-hidden="true"
                        />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        aria-label={`View ${job.title} on external site`}
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    <Badge variant="secondary">{job.type}</Badge>
                    <span className="flex items-center gap-1 text-sm">
                      <DollarSign className="h-3 w-3" aria-hidden="true" />
                      <span aria-label={`Salary range ${job.salary}`}>{job.salary}</span>
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {isExpanded ? job.fullDescription : job.description}
                    </p>
                    
                    <Button 
                      variant="link" 
                      size="sm"
                      className="p-0 h-auto text-primary hover:text-primary/80"
                      onClick={() => toggleJobExpansion(job.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`job-description-${job.id}`}
                      aria-label={isExpanded ? `Show less details for ${job.title}` : `Show more details for ${job.title}`}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" aria-hidden="true" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" aria-hidden="true" />
                          Read More
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Required skills">
                    {job.skills.map((skill) => (
                      <Badge 
                        key={skill} 
                        variant="outline" 
                        className="text-xs"
                        role="listitem"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        aria-label={`Apply for ${job.title} position`}
                      >
                        Apply Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        aria-label={`View details for ${job.title}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button 
            variant="outline"
            aria-label="Load more job listings"
          >
            Load More Jobs
          </Button>
        </div>
      </div>
    </div>
  );
}

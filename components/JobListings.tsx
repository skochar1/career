"use client";

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
  const [activeFilters, setActiveFilters] = useState(["Remote", "Tech", "$50K+"]);

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

  const removeFilter = (filterToRemove: string) => {
    setActiveFilters(prev => prev.filter(filter => filter !== filterToRemove));
  };

  return (
    <div className="flex-1" role="main" aria-label="Job search results">
      {/* Results Info */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-gray-700 font-medium">
              <span className="sr-only">Found </span>
              12,847 jobs found
            </p>
            <button className="inline-flex items-center px-3 py-1 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm" aria-label="Toggle filters panel">
              <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
              Filters
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-sm text-gray-600">
              Sort by:
            </label>
            <select 
              id="sort-select"
              className="border border-gray-300 rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex flex-wrap gap-3 items-center" role="group" aria-label="Active filters">
            {activeFilters.map((filter) => (
              <span 
                key={filter} 
                className="inline-flex items-center px-4 py-2 rounded-full bg-[#f3f3f5] text-[#111322] text-sm font-medium"
              >
                {filter}
                <button
                  className="ml-2 text-[#717182] hover:text-red-600 focus:outline-none transition-colors"
                  onClick={() => removeFilter(filter)}
                  aria-label={`Remove ${filter} filter`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Job List */}
      <div className="p-0">
        <div className="space-y-4 p-6" role="list" aria-label="Job listings">
          {mockJobs.map((job) => {
            const isExpanded = expandedJobs.has(job.id);
            const isSaved = savedJobs.has(job.id);
            
            return (
              <div 
                key={job.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                role="listitem"
                aria-labelledby={`job-title-${job.id}`}
              >
                {/* Header with logo, title, and actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <ImageWithFallback
                      src={job.logo}
                      alt={`${job.company} logo`}
                      width={48}
                      height={48}
                      className="rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="mb-3">
                        <h3 
                          id={`job-title-${job.id}`}
                          className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer mb-2"
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
                        <div className="flex items-center gap-3 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md font-medium">
                            {job.workType}
                          </span>
                          {job.urgentHiring && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-md font-medium">
                              Actively hiring
                            </span>
                          )}
                        </div>
                      </div>
                      <div 
                        id={`job-details-${job.id}`}
                        className="flex flex-wrap items-center gap-6 text-sm text-gray-600"
                      >
                        <span className="flex items-center gap-2">
                          <Building className="h-4 w-4" aria-hidden="true" />
                          <span className="font-medium">{job.company}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" aria-hidden="true" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          <span>{job.postedDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button 
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      aria-label={`View ${job.title} on external site`}
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Salary */}
                <div className="mb-5">
                  <span className="flex items-center gap-2 text-base text-gray-800 font-semibold">
                    <DollarSign className="h-5 w-5" aria-hidden="true" />
                    <span aria-label={`Salary range ${job.salary}`}>{job.salary}</span>
                  </span>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                    {isExpanded ? job.fullDescription : job.description}
                  </p>
                  
                  <button 
                    className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:underline inline-flex items-center"
                    onClick={() => toggleJobExpansion(job.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`job-description-${job.id}`}
                    aria-label={isExpanded ? `Show less details for ${job.title}` : `Show more details for ${job.title}`}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1" aria-hidden="true" />
                        Read Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1" aria-hidden="true" />
                        Read More
                      </>
                    )}
                  </button>
                </div>

                {/* Skills */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Required skills">
                    {job.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                        role="listitem"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button 
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium text-sm"
                    aria-label={`Apply for ${job.title} position`}
                  >
                    Apply Now
                  </button>
                  <button 
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium text-sm"
                    aria-label={`View details for ${job.title}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Load More */}
        <div className="flex justify-center mt-8">
          <button 
            className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 font-medium text-sm"
            aria-label="Load more job listings"
          >
            Load More Jobs
          </button>
        </div>
      </div>
    </div>
  );
}

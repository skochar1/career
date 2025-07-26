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

  return (
    <div className="flex-1" role="main" aria-label="Job search results">
      {/* Top bar: jobs found and sort */}
      <div className="flex items-center justify-between px-0 py-4">
        <div className="text-xl font-medium text-gray-500">12,847 jobs found</div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm text-gray-600">Sort by:</label>
          <select 
            id="sort-select"
            className="border border-gray-200 rounded-xl px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Sort job results"
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
        {mockJobs.map((job) => {
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
                  {/* Logo */}
                  <ImageWithFallback
                    src={job.logo}
                    alt={`${job.company} logo`}
                    width={56}
                    height={56}
                    className="rounded-xl flex-shrink-0 object-cover w-14 h-14"
                  />
                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    {/* Title & tags */}
                    <div className="flex flex-wrap gap-2 items-center mb-1">
                      <h3
                        id={`job-title-${job.id}`}
                        className="text-lg font-semibold text-gray-900 mr-2"
                      >
                        {job.title}
                      </h3>
                      {job.workType && (
                        <span className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs font-medium">
                          {job.workType}
                        </span>
                      )}
                      {job.urgentHiring && (
                        <span className="bg-green-100 text-green-700 rounded-full px-2 py-0.5 text-xs font-medium">
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
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        <span>{job.postedDate}</span>
                      </span>
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
                  {job.type}
                </span>
                <span className="text-gray-800 font-semibold text-sm">{job.salary}</span>
              </div>

              {/* Description */}
              <div className="text-gray-500 text-sm mb-2 max-w-3xl">
                {isExpanded ? job.fullDescription : job.description}
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
                {job.skills.map((skill) => (
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
        {/* Load More */}
        <div className="flex justify-center mt-12">
          <button
            className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 font-semibold text-base"
            aria-label="Load more job listings"
          >
            Load More Jobs
          </button>
        </div>


      </div>
    </div>
  );
}
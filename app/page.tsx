'use client';

import { JobSearch } from '../components/JobSearch';
import { FilterSidebar, JobFilters } from '../components/FilterSidebar';
import { JobListings } from '../components/JobListings';
import { ChatAssistant } from '../components/ChatAssistant';
import { Header } from '../components/Header';
import { useState } from 'react';
import { Filter, X } from 'lucide-react';

/**
 * Home page for the career portal. This page composes the high‑level
 * components such as the job search form, filter sidebar, job listings,
 * and the floating chat assistant.
 */

export default function Home() {
  const [filters, setFilters] = useState<JobFilters>({
    workType: [],
    jobType: [],
    datePosted: '',
    location: '',
    seniority: '',
    department: []
  });
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locationQuery, setLocationQuery] = useState<string>('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
  };

  const handleSearch = (query: string, location: string) => {
    setSearchQuery(query);
    setLocationQuery(location);
    // Update location in filters if provided
    if (location.trim()) {
      setFilters(prev => ({ ...prev, location: location.trim() }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Black header/hero area */}
      <div className="w-full bg-[#0B0C13] text-white pb-6 sm:pb-10">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8" style={{ color: 'white' }}>
            Find your next opportunity
          </h1>

          {/* Your search bar and resume uploader here */}
          <JobSearch onSearch={handleSearch} />
        </div>
      </div>

      {/* Main content area, white bg */}
      <div className="w-full bg-white text-black">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-10">
          {/* Mobile filter button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <FilterSidebar onFiltersChange={handleFiltersChange} />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileFiltersOpen && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
                <div className="bg-white h-full w-80 max-w-[85vw] overflow-y-auto">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <button
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-4">
                    <FilterSidebar 
                      onFiltersChange={(newFilters) => {
                        handleFiltersChange(newFilters);
                        setIsMobileFiltersOpen(false);
                      }} 
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Job listings */}
            <div className="flex-1 min-w-0">
              <JobListings 
                filters={filters} 
                sortBy={sortBy} 
                searchQuery={searchQuery}
                locationQuery={locationQuery}
                onSortChange={handleSortChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI chat assistant (unchanged) */}
      <ChatAssistant />
    </div>
  );
}

"use client";

import { Settings } from "lucide-react";

export function FilterSidebar() {
  return (
    <div className="w-full bg-white border border-gray-200 h-fit overflow-y-auto" role="complementary" aria-label="Job search filters">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 id="filters-heading" className="font-medium text-black">Filters</h3>
          <button 
            className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            onClick={() => {/* Clear all filters */}}
            aria-label="Clear all filters"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4" role="region" aria-labelledby="filters-heading">
        {/* Work Type */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-black">Work Type</h4>
          <div className="space-y-1">
            {[
              { id: "remote", label: "Remote" },
              { id: "onsite", label: "On-site" },
              { id: "hybrid", label: "Hybrid" }
            ].map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id={option.id}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor={option.id} className="text-sm text-gray-700 cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Posted */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-black">Date Posted</h4>
          <div className="space-y-1">
            {[
              { id: "today", label: "Today" },
              { id: "3days", label: "Past 3 days" },
              { id: "week", label: "Past week" },
              { id: "month", label: "Past month" }
            ].map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id={option.id}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor={option.id} className="text-sm text-gray-700 cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Job Type */}
        <div>
          <h4 className="text-sm font-medium mb-2 text-black">Job Type</h4>
          <div className="space-y-1">
            {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id={type}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor={type} className="text-sm text-gray-700 cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Show Advanced Filters Button */}
        <div className="pt-4 border-t border-gray-200">
          <button 
            className="w-full flex items-center justify-start px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <Settings className="h-4 w-4 mr-2" />
            Show Advanced Filters
          </button>
        </div>
      </div>
    </div>
  );
}
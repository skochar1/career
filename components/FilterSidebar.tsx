"use client";

import { Settings } from "lucide-react";
import { useState } from "react";

// --- Replace with actual state management for filters if needed
const mockActiveFilters = ["Remote", "Full-time", "Entry Level"];

export function FilterSidebar() {
  // Use state or context for actual filter logic in real app
  const [activeFilters, setActiveFilters] = useState<string[]>(mockActiveFilters);

  const removeFilter = (filterToRemove: string) => {
    setActiveFilters((prev) => prev.filter((f) => f !== filterToRemove));
  };

  return (
    <aside
      className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm h-fit overflow-y-auto"
      role="complementary"
      aria-label="Job search filters"
    >
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 id="filters-heading" className="font-medium text-black text-lg">Filters</h3>
          <button
            className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded transition"
            onClick={() => setActiveFilters([])}
            aria-label="Clear all filters"
            type="button"
          >
            Clear All
          </button>
        </div>
        {/* Filter tags (chips) */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2" role="group" aria-label="Active filters">
            {activeFilters.map((filter) => (
              <span
                key={filter}
                className="inline-flex items-center px-2 py-[2px] rounded-full bg-[#f3f3f5] text-[#111322] text-[11px] font-medium h-6"
              >
                {filter}
                <button
                  className="ml-0.5 text-[#717182] hover:text-black focus:outline-none"
                  aria-label={`Remove ${filter} filter`}
                  onClick={() => removeFilter(filter)}
                  type="button"
                  style={{ fontSize: "14px", lineHeight: "1" }}
                >
                  ×
                </button>
              </span>

            ))}
          </div>
        )}
      </div>

      <div className="p-6 space-y-6" role="region" aria-labelledby="filters-heading">
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
            className="w-full flex items-center justify-start px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded"
            type="button"
          >
            <Settings className="h-4 w-4 mr-2" />
            Show Advanced Filters
          </button>
        </div>
      </div>
    </aside>
  );
}

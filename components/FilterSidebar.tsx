"use client";

import { Settings, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";

interface FilterSidebarProps {
  onFiltersChange?: (filters: JobFilters) => void;
}

export interface JobFilters {
  workType: string[];
  jobType: string[];
  datePosted: string;
  location: string;
  seniority: string;
  department: string[];
}

export function FilterSidebar({ onFiltersChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<JobFilters>({
    workType: [],
    jobType: [],
    datePosted: '',
    location: '',
    seniority: '',
    department: []
  });
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Derived active filters for display
  const getActiveFilters = () => {
    const active: string[] = [];
    if (filters.workType.length > 0) active.push(...filters.workType);
    if (filters.jobType.length > 0) active.push(...filters.jobType);
    if (filters.datePosted) active.push(filters.datePosted);
    if (filters.location) active.push(`Location: ${filters.location}`);
    if (filters.seniority) active.push(filters.seniority);
    if (filters.department.length > 0) active.push(...filters.department);
    return active;
  };

  const activeFilters = getActiveFilters();

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const updateWorkType = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      workType: checked 
        ? [...prev.workType, type]
        : prev.workType.filter(t => t !== type)
    }));
  };

  const updateJobType = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      jobType: checked 
        ? [...prev.jobType, type]
        : prev.jobType.filter(t => t !== type)
    }));
  };

  const updateDepartment = (dept: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      department: checked 
        ? [...prev.department, dept]
        : prev.department.filter(d => d !== dept)
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      workType: [],
      jobType: [],
      datePosted: '',
      location: '',
      seniority: '',
      department: []
    });
  };

  const removeFilter = (filterToRemove: string) => {
    if (filters.workType.includes(filterToRemove)) {
      updateWorkType(filterToRemove, false);
    } else if (filters.jobType.includes(filterToRemove)) {
      updateJobType(filterToRemove, false);
    } else if (filters.department.includes(filterToRemove)) {
      updateDepartment(filterToRemove, false);
    } else if (filterToRemove === filters.datePosted) {
      setFilters(prev => ({ ...prev, datePosted: '' }));
    } else if (filterToRemove.startsWith('Location:')) {
      setFilters(prev => ({ ...prev, location: '' }));
    } else if (filterToRemove === filters.seniority) {
      setFilters(prev => ({ ...prev, seniority: '' }));
    }
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
            onClick={clearAllFilters}
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
                  checked={filters.workType.includes(option.label)}
                  onChange={(e) => updateWorkType(option.label, e.target.checked)}
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
                  type="radio"
                  name="datePosted"
                  id={option.id}
                  checked={filters.datePosted === option.label}
                  onChange={(e) => setFilters(prev => ({ ...prev, datePosted: e.target.checked ? option.label : '' }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
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
                  checked={filters.jobType.includes(type)}
                  onChange={(e) => updateJobType(type, e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor={type} className="text-sm text-gray-700 cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 rounded transition-colors"
            type="button"
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Advanced Filters
            </div>
            {showAdvanced ? 
              <ChevronUp className="h-4 w-4" /> : 
              <ChevronDown className="h-4 w-4" />
            }
          </button>
        </div>

        {/* Advanced Filters Section */}
        {showAdvanced && (
          <div id="advanced-filters" className="space-y-6 pt-4 border-t border-gray-100">
            {/* Department */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-black">Department</h4>
              <div className="space-y-1">
                {["Engineering", "Marketing", "Sales", "Healthcare", "Finance", "Analytics", "Design", "Operations", "Education"].map((dept) => (
                  <div key={dept} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={dept}
                      checked={filters.department.includes(dept)}
                      onChange={(e) => updateDepartment(dept, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor={dept} className="text-sm text-gray-700 cursor-pointer">
                      {dept}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Seniority Level */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-black">Seniority Level</h4>
              <div className="space-y-1">
                {["Junior", "Mid", "Senior", "Lead", "VP", "Executive"].map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="seniority"
                      id={level}
                      checked={filters.seniority === level}
                      onChange={(e) => setFilters(prev => ({ ...prev, seniority: e.target.checked ? level : '' }))}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                    />
                    <label htmlFor={level} className="text-sm text-gray-700 cursor-pointer">
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

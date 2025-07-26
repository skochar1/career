"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Badge } from "./ui/badge";
import { ChevronDown, X, Settings } from "lucide-react";
import { useState } from "react";

export function FilterSidebar() {
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="w-full bg-card border border-border rounded-lg h-fit overflow-y-auto" role="complementary" aria-label="Job search filters">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 id="filters-heading">Filters</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {/* Clear all filters */}}
            aria-label="Clear all filters"
          >
            Clear All
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6" role="region" aria-labelledby="filters-heading">
        {/* Basic Filters - Always visible */}
        <Collapsible open={openSections.includes("basic")} onOpenChange={() => toggleSection("basic")}>
          <CollapsibleTrigger 
            className="flex items-center justify-between w-full p-2 hover:bg-accent rounded focus:outline-none focus:ring-2 focus:ring-ring"
            aria-expanded={openSections.includes("basic")}
            aria-controls="basic-filters"
          >
            <h4 id="basic-filters-heading">Basic Filters</h4>
            <ChevronDown 
              className={`h-4 w-4 transition-transform ${openSections.includes("basic") ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
          <CollapsibleContent id="basic-filters" className="space-y-4 mt-4">
            {/* Work Type */}
            <fieldset>
              <legend className="text-sm font-medium mb-2">Work Type</legend>
              <div className="space-y-2" role="group" aria-label="Work type options">
                {[
                  { id: "remote", label: "Remote" },
                  { id: "onsite", label: "On-site" },
                  { id: "hybrid", label: "Hybrid" }
                ].map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox id={option.id} />
                    <Label htmlFor={option.id} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Date Posted */}
            <fieldset>
              <legend className="text-sm font-medium mb-2">Date Posted</legend>
              <div className="space-y-2" role="group" aria-label="Date posted options">
                {[
                  { id: "today", label: "Today" },
                  { id: "3days", label: "Past 3 days" },
                  { id: "week", label: "Past week" },
                  { id: "month", label: "Past month" }
                ].map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox id={option.id} />
                    <Label htmlFor={option.id} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Job Type */}
            <fieldset>
              <legend className="text-sm font-medium mb-2">Job Type</legend>
              <div className="space-y-2" role="group" aria-label="Job type options">
                {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox id={type} />
                    <Label htmlFor={type} className="text-sm">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </fieldset>
          </CollapsibleContent>
        </Collapsible>

        {/* Advanced Filters Toggle */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="gap-2"
            aria-expanded={showAdvanced}
            aria-controls="advanced-filters"
          >
            <Settings className="h-4 w-4" />
            {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div id="advanced-filters" className="space-y-6">
            {/* Experience Level */}
            <Collapsible open={openSections.includes("experience")} onOpenChange={() => toggleSection("experience")}>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-2 hover:bg-accent rounded focus:outline-none focus:ring-2 focus:ring-ring"
                aria-expanded={openSections.includes("experience")}
                aria-controls="experience-filters"
              >
                <h4>Experience Level</h4>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${openSections.includes("experience") ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              <CollapsibleContent id="experience-filters" className="space-y-2 mt-4">
                <div role="group" aria-label="Experience level options">
                  {["Entry-level", "Mid-level", "Senior", "Executive"].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <Checkbox id={level} />
                      <Label htmlFor={level} className="text-sm">
                        {level}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Salary Range */}
            <Collapsible open={openSections.includes("salary")} onOpenChange={() => toggleSection("salary")}>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-2 hover:bg-accent rounded focus:outline-none focus:ring-2 focus:ring-ring"
                aria-expanded={openSections.includes("salary")}
                aria-controls="salary-filters"
              >
                <h4>Salary Range</h4>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${openSections.includes("salary") ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              <CollapsibleContent id="salary-filters" className="space-y-2 mt-4">
                <div role="group" aria-label="Salary range options">
                  {[
                    { id: "under50k", label: "< $50K" },
                    { id: "50k-100k", label: "$50K - $100K" },
                    { id: "100k-150k", label: "$100K - $150K" },
                    { id: "150k-200k", label: "$150K - $200K" },
                    { id: "over200k", label: "$200K+" }
                  ].map((range) => (
                    <div key={range.id} className="flex items-center space-x-2">
                      <Checkbox id={range.id} />
                      <Label htmlFor={range.id} className="text-sm">
                        {range.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Company Size */}
            <Collapsible open={openSections.includes("company")} onOpenChange={() => toggleSection("company")}>
              <CollapsibleTrigger 
                className="flex items-center justify-between w-full p-2 hover:bg-accent rounded focus:outline-none focus:ring-2 focus:ring-ring"
                aria-expanded={openSections.includes("company")}
                aria-controls="company-filters"
              >
                <h4>Company Size</h4>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${openSections.includes("company") ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
              </CollapsibleTrigger>
              <CollapsibleContent id="company-filters" className="space-y-4 mt-4">
                <fieldset>
                  <legend className="text-sm font-medium mb-2">Company Size</legend>
                  <RadioGroup className="space-y-2" aria-label="Company size options">
                    {[
                      { value: "startup", label: "Startup (1-50)" },
                      { value: "midsize", label: "Mid-size (51-1000)" },
                      { value: "enterprise", label: "Enterprise (1000+)" }
                    ].map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label htmlFor={option.value} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </fieldset>

                <div>
                  <Label htmlFor="company-name" className="text-sm font-medium">Company Name</Label>
                  <Input 
                    id="company-name"
                    placeholder="Enter company name" 
                    className="mt-2" 
                    aria-describedby="company-name-desc"
                  />
                  <p id="company-name-desc" className="text-xs text-muted-foreground mt-1">
                    Filter by specific company names
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </div>
    </div>
  );
}
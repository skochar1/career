import { JobSearch } from '../components/JobSearch';
import { FilterSidebar } from '../components/FilterSidebar';
import { JobListings } from '../components/JobListings';
import { ChatAssistant } from '../components/ChatAssistant';

/**
 * Home page for the career portal. This page composes the high‑level
 * components such as the job search form, filter sidebar, job listings,
 * and the floating chat assistant.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top section with search and resume upload */}
      <JobSearch />
      
      {/* Main content area with filters and job results */}
      <div className="container mx-auto">
        <div className="flex gap-6 px-4 py-6">
          {/* Sidebar - Always visible for now */}
          <div className="w-80 flex-shrink-0">
            <FilterSidebar />
          </div>
          
          {/* Main content area */}
          <div className="flex-1 min-w-0">
            <JobListings />
          </div>
        </div>
      </div>
      
      {/* Floating AI chat assistant */}
      <ChatAssistant />
    </div>
  );
}

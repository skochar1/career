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
    <div className="relative">
      {/* Top section with search and resume upload */}
      <JobSearch />
      {/* Main content area with filters and job results */}
      <div className="flex">
        <FilterSidebar />
        <JobListings />
      </div>
      {/* Floating AI chat assistant */}
      <ChatAssistant />
    </div>
  );
}

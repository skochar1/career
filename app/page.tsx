import { JobSearch } from '../components/JobSearch';
import { FilterSidebar } from '../components/FilterSidebar';
import { JobListings } from '../components/JobListings';
import { ChatAssistant } from '../components/ChatAssistant';
import { Header } from '../components/Header';

/**
 * Home page for the career portal. This page composes the high‑level
 * components such as the job search form, filter sidebar, job listings,
 * and the floating chat assistant.
 */

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Black header/hero area */}
      <div className="w-full bg-[#0B0C13] text-white pb-10">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: 'white' }}>
            Find your next opportunity
          </h1>

          {/* Your search bar and resume uploader here */}
          <JobSearch />
        </div>
      </div>

      {/* Main content area, white bg */}
      <div className="w-full bg-white text-black">
        <div className="max-w-6xl mx-auto px-4 py-10 flex gap-8">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <FilterSidebar />
          </div>
          {/* Job listings */}
          <div className="flex-1 min-w-0">
            <JobListings />
          </div>
        </div>
      </div>

      {/* Floating AI chat assistant (unchanged) */}
      <ChatAssistant />
    </div>
  );
}

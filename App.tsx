import "../styles/global.css";

import { JobSearch } from "./components/JobSearch";
import { FilterSidebar } from "./components/FilterSidebar";
import { JobListings } from "./components/JobListings";
import { ChatAssistant } from "./components/ChatAssistant";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <JobSearch />
      <div className="flex">
        <FilterSidebar />
        <JobListings />
      </div>
      <ChatAssistant />
    </div>
  );
}
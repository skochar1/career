import { ResumeBasedRecommendations } from '../../components/ResumeBasedRecommendations';
import { Header } from '../../components/Header';

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <div className="w-full bg-[#0B0C13] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">
            AI-Powered Job Recommendations
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your resume and let our advanced AI match you with the perfect opportunities based on your skills and experience.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full bg-white">
        <ResumeBasedRecommendations />
      </div>
    </div>
  );
}
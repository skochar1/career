"use client";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gray-900">JobSearch</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Jobs</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Companies</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Salary</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Resources</a>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 font-medium">
              Post a Job
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
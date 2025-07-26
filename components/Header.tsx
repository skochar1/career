"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">JobSearch</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">Jobs</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Companies</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Salary</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Resources</a>
            </nav>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden sm:flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 font-medium">
              Post a Job
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4 pt-4">
              <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">Jobs</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Companies</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Salary</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Resources</a>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                <button className="text-left text-gray-600 hover:text-gray-900 font-medium">
                  Sign In
                </button>
                <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 font-medium text-left">
                  Post a Job
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
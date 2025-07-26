"use client";

import { useState, useRef } from "react";
import { Upload, File, CheckCircle, AlertCircle, X } from "lucide-react";

interface ParsedResumeData {
  skills: string[];
  experienceLevel: string;
  preferredLocations: string[];
  summary: string;
  education: string[];
  workExperience: {
    company: string;
    position: string;
    duration: string;
    description: string;
  }[];
}

interface ResumeUploadProps {
  onUploadComplete?: (data: ParsedResumeData) => void;
  sessionId: string;
}

export function ResumeUpload({ onUploadComplete, sessionId }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage('Please upload a PDF, TXT, DOC, or DOCX file.');
        setUploadStatus('error');
        return;
      }

      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be less than 10MB.');
        setUploadStatus('error');
        return;
      }

      setFile(selectedFile);
      setUploadStatus('idle');
      setErrorMessage('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile) {
      // Create a mock input event
      const mockEvent = {
        target: { files: [droppedFile] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(mockEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const uploadResume = async () => {
    if (!file || !sessionId) return;

    setUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('sessionId', sessionId);

      const response = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStatus('success');
        setParsedData(data.parsedData);
        onUploadComplete?.(data.parsedData);
      } else {
        setUploadStatus('error');
        setErrorMessage(data.error || 'Upload failed');
      }
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
    setParsedData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-gray-400" />;
    
    if (file.type === 'application/pdf') {
      return <File className="h-8 w-8 text-red-500" />;
    }
    return <File className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          file ? 'border-green-300 bg-green-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          id="resume-upload"
        />

        {!file ? (
          <div>
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload your resume
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop your resume file here, or click to browse
            </p>
            <label
              htmlFor="resume-upload"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-block"
            >
              Choose File
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Supports PDF, TXT, DOC, DOCX (max 10MB)
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-4">
            {getFileIcon()}
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-600">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearFile}
              className="p-1 text-gray-400 hover:text-gray-600"
              disabled={uploading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadStatus === 'error' && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="text-red-700">{errorMessage}</p>
        </div>
      )}

      {/* Upload Button */}
      {file && uploadStatus !== 'success' && (
        <div className="mt-6 text-center">
          <button
            onClick={uploadResume}
            disabled={uploading}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {uploading ? 'Processing Resume...' : 'Upload & Analyze Resume'}
          </button>
        </div>
      )}

      {/* Success Message and Parsed Data */}
      {uploadStatus === 'success' && parsedData && (
        <div className="mt-6">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 mb-6">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <p className="text-green-700 font-medium">
              Resume uploaded and analyzed successfully!
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Extracted Information
            </h3>

            {/* Summary */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
              <p className="text-gray-600 text-sm">{parsedData.summary}</p>
            </div>

            {/* Experience Level */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Experience Level</h4>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                {parsedData.experienceLevel}
              </span>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">
                Skills ({parsedData.skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {parsedData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Locations */}
            {parsedData.preferredLocations && parsedData.preferredLocations.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Preferred Locations</h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.preferredLocations.map((location, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-2 py-1 rounded text-sm"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {parsedData.education && parsedData.education.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Education</h4>
                <ul className="text-sm text-gray-600">
                  {parsedData.education.map((edu, index) => (
                    <li key={index} className="mb-1">• {edu}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* New Upload Button */}
          <div className="mt-4 text-center">
            <button
              onClick={clearFile}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Upload a different resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
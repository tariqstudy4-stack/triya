import React, { useState } from 'react';

interface DatabaseUploadZoneProps {
  onUploadSuccess?: (data: any) => void;
}

export default function DatabaseUploadZone({ onUploadSuccess }: DatabaseUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('Uploading & Parsing...');

    // Prepare the file to be sent to the FastAPI backend
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Point this to your FastAPI backend port (usually 8000)
      const response = await fetch('/api/upload-database', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        // THIS IS THE MAGIC MOMENT! 
        // We log the parsed LCA data to the browser console to prove it works.
        console.log("🔥 Database Parsed Successfully:", data);
        
        setUploadStatus('Success! Database loaded.');
        
        // Pass the data up to the parent component
        if (onUploadSuccess) {
          onUploadSuccess(data);
        }
      } else {
        setUploadStatus('Upload failed. Check backend terminal logs.');
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus('Network error. Is the backend running?');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:bg-gray-800 transition-colors bg-gray-900">
      <input
        type="file"
        id="db-upload"
        className="hidden"
        accept=".json,.csv,.zolca,.zip"
        onChange={handleFileUpload}
      />
      <label htmlFor="db-upload" className="cursor-pointer flex flex-col items-center">
        {/* Upload Icon */}
        <svg className="w-8 h-8 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span className="text-sm text-gray-200 font-semibold">
          {isUploading ? 'Parsing Database...' : 'Upload Database'}
        </span>
        <span className="text-xs text-gray-400 mt-1">.json, .csv, .zolca, .zip files</span>
      </label>
      
      {/* Status Message */}
      {uploadStatus && (
        <p className={`text-xs mt-3 ${uploadStatus.includes('Success') ? 'text-green-400' : 'text-red-400'}`}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
}
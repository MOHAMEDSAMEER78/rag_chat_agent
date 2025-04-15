'use client';

import { useState } from 'react';
import { Upload, X, FileText, Check } from 'lucide-react';

interface PdfFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

interface PdfUploaderProps {
  chromaStatus?: 'checking' | 'available' | 'unavailable';
}

export default function PdfUploader({ chromaStatus = 'checking' }: PdfUploaderProps) {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles: PdfFile[] = [];
    
    Array.from(e.target.files).forEach(file => {
      if (file.type === 'application/pdf') {
        newFiles.push({
          file,
          status: 'pending'
        });
      }
    });
    
    setFiles(prev => [...prev, ...newFiles]);
    // Reset the input so the same file can be selected again
    e.target.value = '';
  };

  // Remove a file from the list
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Upload the PDFs
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    const updatedFiles = [...files];
    
    // Process each file
    for (let i = 0; i < updatedFiles.length; i++) {
      // Skip files that are already processed
      if (updatedFiles[i].status === 'success') continue;
      
      // Update status to uploading
      updatedFiles[i].status = 'uploading';
      setFiles([...updatedFiles]);
      
      try {
        // Create form data
        const formData = new FormData();
        formData.append('file', updatedFiles[i].file);
        
        // Send the file to the API
        const response = await fetch('/api/ingest/pdf', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok && response.status !== 207) {
          throw new Error(data.error || 'Failed to upload');
        }
        
        // Update status to success
        updatedFiles[i].status = 'success';
        updatedFiles[i].message = data.message;
      } catch (error) {
        // Update status to error
        updatedFiles[i].status = 'error';
        updatedFiles[i].message = (error as Error).message;
      }
      
      setFiles([...updatedFiles]);
    }
    
    setIsUploading(false);
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white">
      <h2 className="text-xl font-semibold mb-4">Upload Insurance PDFs</h2>
      
      {chromaStatus !== 'available' && (
        <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
          <p>Warning: ChromaDB is not available. PDF text will be extracted, but vector storage will be limited.</p>
        </div>
      )}
      
      {/* File upload area */}
      <div 
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500">
          PDF files only (max 10MB each)
        </p>
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4">
          <h3 className="font-medium text-gray-700 mb-2">Files ({files.length})</h3>
          <ul className="divide-y divide-gray-200">
            {files.map((file, index) => (
              <li key={index} className="py-3 flex items-center justify-between">
                <div className="flex items-center flex-1 pr-4">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {file.status === 'uploading' && (
                    <div className="ml-2 w-4 h-4 border-2 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
                  )}
                  {file.status === 'success' && (
                    <Check className="ml-2 h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <div className="ml-2 text-xs text-red-500">{file.message}</div>
                  )}
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={isUploading}
                >
                  <X className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Upload button */}
      {files.length > 0 && (
        <div className="mt-4">
          <button
            onClick={uploadFiles}
            disabled={isUploading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      )}
    </div>
  );
} 
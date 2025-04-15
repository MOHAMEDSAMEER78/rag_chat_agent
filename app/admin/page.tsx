'use client';

import { useState, useEffect } from 'react';
import PdfUploader from '../components/PdfUploader';

export default function AdminPage() {
  const [isScrapingWeb, setIsScrapingWeb] = useState(false);
  const [scrapingResult, setScrapingResult] = useState<null | {
    status: 'success' | 'error' | 'warning';
    message: string;
  }>(null);
  const [chromaStatus, setChromaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Check if Chroma is available
  useEffect(() => {
    const checkChromaAvailability = async () => {
      try {
        const response = await fetch(`${process.env.CHROMA_URL || 'http://localhost:8000'}/api/v2/heartbeat`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000), // 2 second timeout
        });
        
        if (response.ok) {
          setChromaStatus('available');
        } else {
          setChromaStatus('unavailable');
        }
      } catch (error) {
        console.error('Error checking Chroma availability:', error);
        setChromaStatus('unavailable');
      }
    };
    
    checkChromaAvailability();
  }, []);

  // Function to start web scraping
  const startWebScraping = async () => {
    setIsScrapingWeb(true);
    setScrapingResult(null);
    
    try {
      const response = await fetch('/api/ingest?source=web', {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scrape web content');
      }
      
      if (data.results?.web?.status === 'warning') {
        setScrapingResult({
          status: 'warning',
          message: data.results.web.message
        });
      } else {
        setScrapingResult({
          status: 'success',
          message: data.results?.web?.message || 'Web scraping completed successfully'
        });
      }
    } catch (error) {
      setScrapingResult({
        status: 'error',
        message: (error as Error).message
      });
    } finally {
      setIsScrapingWeb(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
        
        {/* Chroma Status */}
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              chromaStatus === 'checking' ? 'bg-yellow-400' : 
              chromaStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>
              {chromaStatus === 'checking' ? 'Checking ChromaDB status...' : 
               chromaStatus === 'available' ? 'ChromaDB is available' : 
               'ChromaDB is unavailable - RAG functionality will be limited'}
            </span>
          </div>
          {chromaStatus === 'unavailable' && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
              <p>ChromaDB is not running. To enable full functionality:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>If using Docker: <code className="bg-gray-200 px-1 rounded">docker-compose up chromadb</code></li>
                <li>Standalone Docker: <code className="bg-gray-200 px-1 rounded">docker run -p 8000:8000 chromadb/chroma</code></li>
                <li>Or install and run Chroma locally</li>
                <li>Refresh this page after starting ChromaDB</li>
              </ol>
            </div>
          )}
        </div>
        
        {/* Web Scraping Section */}
        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300">
          <h2 className="text-xl font-semibold mb-4">Web Scraping</h2>
          <p className="text-gray-600 mb-4">
            This will scrape content from Angel One support pages and index it for the chatbot.
            The process may take several minutes to complete.
            {chromaStatus !== 'available' && " Note: Data will be extracted but not stored until ChromaDB is available."}
          </p>
          
          <button
            onClick={startWebScraping}
            disabled={isScrapingWeb}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isScrapingWeb ? 'Scraping...' : 'Start Web Scraping'}
          </button>
          
          {scrapingResult && (
            <div className={`mt-4 p-4 rounded-md ${
              scrapingResult.status === 'success' ? 'bg-green-50 text-green-800' : 
              scrapingResult.status === 'warning' ? 'bg-yellow-50 text-yellow-800' : 
              'bg-red-50 text-red-800'
            }`}>
              {scrapingResult.message}
            </div>
          )}
        </div>
        
        {/* PDF Upload Section */}
        <PdfUploader chromaStatus={chromaStatus} />
      </div>
    </main>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import PdfUploader from '../components/PdfUploader';
import { ThemeToggle } from '../../components/theme-toggle';
import Link from 'next/link';

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
        console.debug("Checking ChromaDB availability via server API");
        
        // Only use the server-side API endpoint to check ChromaDB availability
        try {
          const serverCheckResponse = await fetch('/api/check-chroma', {
            method: 'GET',
            cache: 'no-store', // Prevent caching
            headers: {
              'pragma': 'no-cache',
              'cache-control': 'no-cache'
            }
          });
          
          console.debug("Server API response status:", serverCheckResponse.status);
          
          if (serverCheckResponse.ok) {
            const result = await serverCheckResponse.json();
            console.debug("Server API response:", result);
            
            if (result.available) {
              console.debug("ChromaDB is available according to server API");
              setChromaStatus('available');
              return;
            } else {
              console.debug("ChromaDB is unavailable according to server API:", result.message);
            }
          } else {
            console.debug("Server API response not OK:", serverCheckResponse.status);
          }
          
          // If we reach here, ChromaDB is unavailable
          setChromaStatus('unavailable');
        } catch (error) {
          console.error("Error checking ChromaDB availability via server API:", error);
          setChromaStatus('unavailable');
        }
      } catch (error) {
        console.error('Fatal error in ChromaDB availability check:', error);
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
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Angel One Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-primary hover:underline">
              Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
        
        {/* Chroma Status */}
        <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm">
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
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              <p>ChromaDB is not running. To enable full functionality:</p>
              <ol className="list-decimal ml-5 mt-2 space-y-1">
                <li>If using Docker: <code className="bg-muted px-1 rounded">docker-compose up chromadb</code></li>
                <li>Standalone Docker: <code className="bg-muted px-1 rounded">docker run -p 8000:8000 chromadb/chroma</code></li>
                <li>Or install and run Chroma locally</li>
                <li>Refresh this page after starting ChromaDB</li>
              </ol>
            </div>
          )}
        </div>
        
        {/* Web Scraping Section */}
        <div className="mb-8 p-6 bg-card rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Web Scraping</h2>
          <p className="text-muted-foreground mb-4">
            This will scrape content from Angel One support pages and index it for the chatbot.
            The process may take several minutes to complete.
            {chromaStatus !== 'available' && " Note: Data will be extracted but not stored until ChromaDB is available."}
          </p>
          
          <button
            onClick={startWebScraping}
            disabled={isScrapingWeb}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {isScrapingWeb ? 'Scraping...' : 'Start Web Scraping'}
          </button>
          
          {scrapingResult && (
            <div className={`mt-4 p-4 rounded-md ${
              scrapingResult.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 
              scrapingResult.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : 
              'bg-destructive/10 text-destructive'
            }`}>
              {scrapingResult.message}
            </div>
          )}
        </div>
        
        {/* PDF Upload Section */}
        <PdfUploader chromaStatus={chromaStatus} />

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Powered by RAG - The chatbot answers questions strictly based on Angel One&apos;s documentation.</p>
        </div>
      </div>
    </main>
  );
} 
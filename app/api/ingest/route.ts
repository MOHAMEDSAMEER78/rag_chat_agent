import { NextRequest, NextResponse } from 'next/server';
import { scrapeAngelOneSupport } from '@/app/lib/scrapers/angelOneSupport';
import { 
  processAndStoreWebContent, 
  processAndStorePDFContent,
  initializeEmbeddings 
} from '@/app/lib/vectorStore';
import { processPDFDirectory } from '@/app/lib/pdf-processor';
import path from 'path';

// Initialize embeddings if API key is available
if (process.env.GOOGLE_API_KEY) {
  initializeEmbeddings(process.env.GOOGLE_API_KEY);
}

export async function GET(req: NextRequest) {
  try {
    // Check for API key
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key is not configured' },
        { status: 500 }
      );
    }
    
    // Parse parameters from URL
    const searchParams = req.nextUrl.searchParams;
    const ingestSource = searchParams.get('source') || 'all';
    
    const responses: Record<string, any> = {};
    
    // Scrape website if requested
    if (ingestSource === 'web' || ingestSource === 'all') {
      try {
        // Scrape the Angel One support pages
        const scrapeResults = await scrapeAngelOneSupport();
        
        if (scrapeResults.length > 0) {
          // Process and store the scraped content
          const docsCount = await processAndStoreWebContent(scrapeResults);
          
          if (docsCount > 0) {
            responses.web = {
              status: 'success',
              message: `Scraped ${scrapeResults.length} pages, created ${docsCount} documents`,
            };
          } else {
            responses.web = {
              status: 'warning',
              message: 'Scraped content could not be stored. Vector database may be unavailable.',
            };
          }
        } else {
          responses.web = {
            status: 'warning',
            message: 'No pages found to scrape',
          };
        }
      } catch (error) {
        console.error('Error scraping web content:', error);
        responses.web = {
          status: 'error',
          message: `Error scraping web content: ${(error as Error).message}`,
        };
      }
    }
    
    // Process PDFs if requested
    if (ingestSource === 'pdf' || ingestSource === 'all') {
      try {
        // Process the PDF files in the data directory
        const pdfDirectory = path.join(process.cwd(), 'app/data/pdfs');
        const pdfContents = await processPDFDirectory(pdfDirectory);
        
        if (pdfContents.length > 0) {
          // Process and store the PDF content
          const docsCount = await processAndStorePDFContent(pdfContents);
          
          if (docsCount > 0) {
            responses.pdf = {
              status: 'success',
              message: `Processed ${pdfContents.length} PDFs, created ${docsCount} documents`,
            };
          } else {
            responses.pdf = {
              status: 'warning',
              message: 'PDF content could not be stored. Vector database may be unavailable.',
            };
          }
        } else {
          responses.pdf = {
            status: 'warning',
            message: 'No PDF files found to process',
          };
        }
      } catch (error) {
        console.error('Error processing PDF content:', error);
        responses.pdf = {
          status: 'error',
          message: `Error processing PDF content: ${(error as Error).message}`,
        };
      }
    }
    
    // Return the responses
    return NextResponse.json({
      status: 'success',
      results: responses,
    });
    
  } catch (error) {
    console.error('Error during ingestion:', error);
    return NextResponse.json(
      { error: 'An error occurred during ingestion' },
      { status: 500 }
    );
  }
} 
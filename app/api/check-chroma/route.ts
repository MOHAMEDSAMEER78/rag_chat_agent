import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    console.log('Server checking ChromaDB at:', chromaUrl);
    
    // Get auth credentials from environment or use defaults from docker-compose
    const username = process.env.CHROMA_USERNAME || 'admin';
    const password = process.env.CHROMA_PASSWORD || 'admin';
    
    // Use fetch with increased timeout to check ChromaDB availability
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };
      
      // Add basic auth header for Token Auth provider
      // ChromaDB uses Basic Auth format: admin:admin in docker-compose
      const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
      headers['Authorization'] = `Basic ${base64Credentials}`;
      
      console.log('Sending request to ChromaDB with auth');
      
      const response = await fetch(`${chromaUrl}/api/v2/heartbeat`, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      console.log('ChromaDB server response status:', response.status);
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('ChromaDB server response text:', responseText);
        
        // Check if the response contains heartbeat data
        if (responseText.includes('heartbeat')) {
          return NextResponse.json({ 
            available: true, 
            message: 'ChromaDB is available',
            details: responseText 
          });
        }
      }
      
      console.log('ChromaDB returned invalid response:', response.status);
      return NextResponse.json({ 
        available: false, 
        message: `ChromaDB returned response with status: ${response.status}, but format was invalid`,
        status: response.status
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Error connecting to ChromaDB:', fetchError);
      
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      const isAbortError = errorMessage.includes('abort') || errorMessage.includes('timeout');
      
      return NextResponse.json({ 
        available: false, 
        message: isAbortError 
          ? `Timeout connecting to ChromaDB at ${chromaUrl}` 
          : `Error connecting to ChromaDB: ${errorMessage}`,
        error: isAbortError ? 'TIMEOUT' : 'CONNECTION_ERROR'
      });
    }
  } catch (error) {
    console.error('Server-side error checking ChromaDB:', error);
    return NextResponse.json({ 
      available: false, 
      message: `Error in ChromaDB check: ${error instanceof Error ? error.message : String(error)}`,
      error: 'GENERAL_ERROR'
    });
  }
} 
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    console.log('Server checking Chroma at:', chromaUrl);
    
    // Use node-fetch on the server side
    const response = await fetch(`${chromaUrl}/api/v2/heartbeat`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // No AbortSignal.timeout in Node.js fetch, so use a simpler timeout
      signal: AbortSignal.timeout(3000),
    });
    
    console.log('Chroma server response status:', response.status);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('Chroma server response text:', responseText);
      
      // Check if the response contains heartbeat data
      if (responseText.includes('heartbeat')) {
        return NextResponse.json({ available: true, message: 'Chroma is available' });
      }
    }
    
    return NextResponse.json({ 
      available: false, 
      message: 'Chroma returned a response but it does not appear to be valid' 
    });
  } catch (error) {
    console.error('Server-side error checking Chroma:', error);
    return NextResponse.json({ 
      available: false, 
      message: `Error connecting to Chroma: ${error instanceof Error ? error.message : String(error)}` 
    });
  }
} 
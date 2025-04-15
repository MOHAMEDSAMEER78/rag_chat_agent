// Simple script to test ChromaDB connectivity
import fetch from 'node-fetch';

async function checkChroma() {
  try {
    const chromaUrl = process.env.CHROMA_URL || 'http://localhost:8000';
    console.log('Checking ChromaDB at:', chromaUrl);
    
    // Add auth for ChromaDB token auth
    const username = 'admin';
    const password = 'admin';
    
    // Create Basic auth header (based on docker-compose.yml configuration)
    const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${base64Credentials}`
    };
    
    console.log('Using headers:', JSON.stringify(headers, null, 2));
    
    console.log(`Sending request to: ${chromaUrl}/api/v2/heartbeat`);
    const response = await fetch(`${chromaUrl}/api/v2/heartbeat`, {
      method: 'GET',
      headers,
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const responseText = await response.text();
      console.log('Response text:', responseText);
      return;
    } else {
      console.log('Failed to get valid response');
      try {
        const errorText = await response.text();
        console.log('Error response:', errorText);
      } catch (e) {
        console.log('Could not read error response');
      }
    }
  } catch (error) {
    console.error('Error checking ChromaDB:', error);
  }
}

checkChroma(); 
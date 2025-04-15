import { NextRequest, NextResponse } from 'next/server';
import { generateResponse, initializeChatModel } from '@/app/lib/chatModel';
import { initializeEmbeddings } from '@/app/lib/vectorStore';

// Initialize the models with API key from environment variables
if (process.env.GOOGLE_API_KEY) {
  initializeChatModel(process.env.GOOGLE_API_KEY);
  initializeEmbeddings(process.env.GOOGLE_API_KEY);
}

export async function POST(req: NextRequest) {
  try {
    // Check for Google API key
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key is not configured' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Extract the latest user message
    const latestMessage = messages[messages.length - 1];
    
    if (latestMessage.role !== 'user') {
      return NextResponse.json(
        { error: 'Last message must be from user' },
        { status: 400 }
      );
    }

    // Generate a response
    const response = await generateResponse(latestMessage.content);

    // Return the response
    return NextResponse.json({
      role: 'assistant',
      content: response
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating the response' },
      { status: 500 }
    );
  }
} 
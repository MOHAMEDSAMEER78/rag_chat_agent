import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractTextFromPDFBuffer } from '@/app/lib/pdf-processor';
import { processAndStorePDFContent, initializeEmbeddings } from '@/app/lib/vectorStore';

// Initialize embeddings if API key is available
if (process.env.GOOGLE_API_KEY) {
  initializeEmbeddings(process.env.GOOGLE_API_KEY);
}

// Function to ensure the uploads directory exists
function ensureUploadsDirectory() {
  const pdfDirectory = path.join(process.cwd(), 'app/data/pdfs');
  if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory, { recursive: true });
  }
  return pdfDirectory;
}

export async function POST(req: NextRequest) {
  try {
    // Check for API key
    if (!process.env.GOOGLE_API_KEY) {
      return NextResponse.json(
        { error: 'Google API key is not configured' },
        { status: 500 }
      );
    }

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Ensure it's a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Save the file to the uploads directory
    const pdfDirectory = ensureUploadsDirectory();
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(pdfDirectory, fileName);
    
    fs.writeFileSync(filePath, buffer);
    
    // Extract text from the PDF
    const pdfContent = await extractTextFromPDFBuffer(buffer, fileName);
    
    if (!pdfContent) {
      return NextResponse.json(
        { error: 'Failed to extract text from PDF' },
        { status: 500 }
      );
    }
    
    // Process and store the PDF content
    const docsCount = await processAndStorePDFContent([pdfContent]);
    
    if (docsCount > 0) {
      return NextResponse.json({
        status: 'success',
        message: `Processed ${fileName}, created ${docsCount} documents`,
        fileName
      });
    } else {
      return NextResponse.json({
        status: 'warning',
        message: `Processed ${fileName}, but could not store in vector database. It may be unavailable.`,
        fileName
      }, { status: 207 }); // Partial success
    }
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the PDF' },
      { status: 500 }
    );
  }
} 
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
  try {
    // Use the OS temporary directory instead of the app directory
    // This is more likely to have write permissions
    const tmpDir = process.env.TEMP || process.env.TMP || '/tmp';
    const pdfDirectory = path.join(tmpDir, 'angel_one_pdfs');
    
    if (!fs.existsSync(pdfDirectory)) {
      fs.mkdirSync(pdfDirectory, { recursive: true });
    }
    
    // Test write permissions by writing a test file
    const testFilePath = path.join(pdfDirectory, '.test-write-permission');
    fs.writeFileSync(testFilePath, 'test');
    fs.unlinkSync(testFilePath); // Clean up
    
    console.log(`Using PDF directory: ${pdfDirectory}`);
    return pdfDirectory;
  } catch (error) {
    console.error('Error creating or accessing uploads directory:', error);
    throw new Error(`Directory access error: ${error instanceof Error ? error.message : String(error)}`);
  }
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
    
    // Check file size (limit to 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Ensure the directory exists and is writable
    let pdfDirectory;
    try {
      pdfDirectory = ensureUploadsDirectory();
    } catch (dirError) {
      console.error('Directory error:', dirError);
      return NextResponse.json(
        { error: `Failed to access uploads directory: ${dirError instanceof Error ? dirError.message : String(dirError)}` },
        { status: 500 }
      );
    }
    
    // Save the file to the uploads directory
    const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(pdfDirectory, fileName);
    
    try {
      fs.writeFileSync(filePath, buffer);
      console.log(`PDF saved to ${filePath}`);
    } catch (writeError) {
      console.error('Error writing PDF file:', writeError);
      return NextResponse.json(
        { error: `Failed to save PDF file: ${writeError instanceof Error ? writeError.message : String(writeError)}` },
        { status: 500 }
      );
    }
    
    // Extract text from the PDF
    let pdfContent;
    try {
      pdfContent = await extractTextFromPDFBuffer(buffer, fileName);
      
      if (!pdfContent) {
        return NextResponse.json(
          { error: 'Failed to extract text from PDF - no content extracted' },
          { status: 500 }
        );
      }
      
      if (!pdfContent.content || pdfContent.content.trim() === '') {
        return NextResponse.json(
          { error: 'PDF appears to be empty or could not be parsed' },
          { status: 400 }
        );
      }
    } catch (extractError) {
      console.error('Error extracting PDF text:', extractError);
      return NextResponse.json(
        { error: `Failed to extract text from PDF: ${extractError instanceof Error ? extractError.message : String(extractError)}` },
        { status: 500 }
      );
    }
    
    // Process and store the PDF content
    try {
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
    } catch (vectorError) {
      console.error('Error storing in vector database:', vectorError);
      return NextResponse.json(
        { error: `Processed PDF but failed to store in vector database: ${vectorError instanceof Error ? vectorError.message : String(vectorError)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing PDF upload:', error);
    return NextResponse.json(
      { error: `An error occurred while processing the PDF: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 
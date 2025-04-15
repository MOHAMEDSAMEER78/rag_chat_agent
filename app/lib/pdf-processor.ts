import fs from 'fs';
import path from 'path';
import { Document } from '@langchain/core/documents';
// Import pdf-parse properly
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export interface PDFContent {
  filename: string;
  content: string;
}

// Function to extract text from a PDF file
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF
    const pdfData = await pdfParse(dataBuffer);
    
    // Return the text content
    return pdfData.text;
  } catch (error) {
    console.error(`Error extracting text from PDF ${filePath}:`, error);
    return '';
  }
}

// Function to process multiple PDF files in a directory
export async function processPDFDirectory(directoryPath: string): Promise<PDFContent[]> {
  try {
    // Check if directory exists first
    if (!fs.existsSync(directoryPath)) {
      console.log(`Directory ${directoryPath} does not exist, creating it...`);
      fs.mkdirSync(directoryPath, { recursive: true });
      return [];
    }
    
    // Read directory to get list of PDF files
    const files = fs.readdirSync(directoryPath)
      .filter(file => file.toLowerCase().endsWith('.pdf'));
    
    const results: PDFContent[] = [];
    
    // Process each PDF file
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      console.log(`Processing PDF: ${filePath}`);
      
      const content = await extractTextFromPDF(filePath);
      
      if (content) {
        results.push({
          filename: file,
          content
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error processing PDF directory:', error);
    return [];
  }
}

// Function to extract text from a PDF Buffer (useful for uploaded files)
export async function extractTextFromPDFBuffer(buffer: Buffer, filename: string): Promise<PDFContent | null> {
  try {
    // Parse PDF directly from buffer
    const pdfData = await pdfParse(buffer);
    
    if (pdfData.text) {
      return {
        filename,
        content: pdfData.text
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error extracting text from PDF buffer:`, error);
    return null;
  }
}
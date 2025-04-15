import fs from 'fs';
import path from 'path';
import { Document } from '@langchain/core/documents';
// Import pdf-parse properly
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export interface PDFContent {
  filename: string;
  content: string;
}

// Add type definitions for pdf-parse
interface TextItem {
  str: string;
  [key: string]: any;
}

interface TextContent {
  items: TextItem[];
  [key: string]: any;
}

interface PageData {
  getTextContent: () => Promise<TextContent>;
  [key: string]: any;
}

// Function to extract text from a PDF file
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    // Read the PDF file
    const dataBuffer = fs.readFileSync(filePath);
    
    // Parse the PDF with modified options
    const pdfData = await pdfParse(dataBuffer, {
      // Add options to make parsing more robust
      pagerender: function(pageData: PageData) {
        // Just return the text content, ignore rendering errors
        return pageData.getTextContent()
          .then(function(textContent: TextContent) {
            let text = '';
            for (let item of textContent.items) {
              text += item.str + ' ';
            }
            return text;
          })
          .catch(function() {
            // If text extraction fails, return empty string for this page
            return '';
          });
      }
    });
    
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
    // Add custom options to handle font issues and other parsing problems
    const options = {
      // Add options to make parsing more robust
      pagerender: function(pageData: PageData) {
        // Just return the text content, ignore rendering errors
        return pageData.getTextContent()
          .then(function(textContent: TextContent) {
            let text = '';
            for (let item of textContent.items) {
              text += item.str + ' ';
            }
            return text;
          })
          .catch(function(err: Error | string) {
            console.log(`Warning: Error extracting text from page: ${typeof err === 'object' && err.message ? err.message : err}`);
            // If text extraction fails, return empty string for this page
            return '';
          });
      },
      // This will suppress fontErrors
      verbosity: 0
    };
    
    // Parse PDF directly from buffer with custom options
    const pdfData = await pdfParse(buffer, options);
    
    if (pdfData.text) {
      return {
        filename,
        content: pdfData.text
      };
    }
    
    // If we get here but have no text, try a fallback method
    if (!pdfData.text || pdfData.text.trim() === '') {
      console.log('Primary extraction yielded no text, trying fallback method...');
      
      // Try with simpler options as fallback
      const fallbackData = await pdfParse(buffer, { verbosity: 0 });
      
      if (fallbackData.text && fallbackData.text.trim() !== '') {
        return {
          filename,
          content: fallbackData.text
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Error extracting text from PDF buffer:`, error);
    return null;
  }
}
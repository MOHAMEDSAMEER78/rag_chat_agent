import { Chroma } from '@langchain/community/vectorstores/chroma';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { ScrapeResult } from './scrapers/angelOneSupport';
import { PDFContent } from './pdf-processor';

// Initialize embeddings model
let embeddings: GoogleGenerativeAIEmbeddings;
let vectorStore: Chroma | null = null;
let isVectorStoreAvailable = true;

// Function to initialize the embeddings model
export function initializeEmbeddings(apiKey: string) {
  embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: apiKey,
    model: 'embedding-001',
  });
}

// Function to initialize the vector store
export async function initializeVectorStore() {
  if (!embeddings) {
    throw new Error('Embeddings model is not initialized');
  }

  try {
    vectorStore = new Chroma(embeddings, {
      collectionName: 'angel_one_support',
      url: process.env.CHROMA_URL || 'http://localhost:8000',
    });

    // Test the connection by performing a small query
    await vectorStore.similaritySearch("test connection", 1);
    isVectorStoreAvailable = true;
    
    return vectorStore;
  } catch (error) {
    console.error('Error initializing vector store:', error);
    isVectorStoreAvailable = false;
    vectorStore = null;
    throw new Error('Failed to initialize vector store. Is Chroma running?');
  }
}

// Function to get the vector store (creates it if it doesn't exist)
export async function getVectorStore() {
  if (!isVectorStoreAvailable) {
    // Try to reinitialize if previously marked as unavailable
    try {
      return await initializeVectorStore();
    } catch (error) {
      console.error('Vector store is still unavailable:', error);
      throw error;
    }
  }
  
  if (!vectorStore) {
    try {
      await initializeVectorStore();
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw error;
    }
  }
  
  return vectorStore;
}

// Function to process and store web scraped content
export async function processAndStoreWebContent(scrapeResults: ScrapeResult[]) {
  try {
    const store = await getVectorStore();
    if (!store) {
      console.error('Vector store is not available');
      return 0;
    }

    // Create a text splitter to break content into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const documents: Document[] = [];

    // Process each scraped content
    for (const result of scrapeResults) {
      if (!result.content) continue;

      // Split the content into chunks
      const textChunks = await textSplitter.splitText(result.content);

      // Create a document for each chunk
      for (const chunk of textChunks) {
        documents.push(
          new Document({
            pageContent: chunk,
            metadata: {
              source: result.url,
              title: result.title,
              type: 'web',
            },
          })
        );
      }
    }

    console.log(`Storing ${documents.length} documents from web content`);

    // Add documents to the vector store
    if (documents.length > 0) {
      await store.addDocuments(documents);
    }

    return documents.length;
  } catch (error) {
    console.error('Error processing web content:', error);
    return 0;
  }
}

// Function to process and store PDF content
export async function processAndStorePDFContent(pdfContents: PDFContent[]) {
  try {
    const store = await getVectorStore();
    if (!store) {
      console.error('Vector store is not available');
      return 0;
    }

    // Create a text splitter to break content into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const documents: Document[] = [];

    // Process each PDF
    for (const pdf of pdfContents) {
      if (!pdf.content) continue;

      // Split the content into chunks
      const textChunks = await textSplitter.splitText(pdf.content);

      // Create a document for each chunk
      for (const chunk of textChunks) {
        documents.push(
          new Document({
            pageContent: chunk,
            metadata: {
              source: pdf.filename,
              type: 'pdf',
            },
          })
        );
      }
    }

    console.log(`Storing ${documents.length} documents from PDF content`);

    // Add documents to the vector store
    if (documents.length > 0) {
      await store.addDocuments(documents);
    }

    return documents.length;
  } catch (error) {
    console.error('Error processing PDF content:', error);
    return 0;
  }
}

// Function to query the vector store
export async function queryVectorStore(query: string, k: number = 5) {
  try {
    const store = await getVectorStore();
    if (!store) {
      console.error('Vector store is not available');
      return [];
    }

    // Perform similarity search
    const results = await store.similaritySearch(query, k);
    return results;
  } catch (error) {
    console.error('Error querying vector store:', error);
    isVectorStoreAvailable = false; // Mark as unavailable for future calls
    return [];
  }
} 
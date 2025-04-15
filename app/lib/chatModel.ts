import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { Document } from '@langchain/core/documents';
import { 
  ChatPromptTemplate, 
  HumanMessagePromptTemplate, 
  SystemMessagePromptTemplate
} from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { queryVectorStore } from './vectorStore';

let model: ChatGoogleGenerativeAI;

// Initialize the chat model
export function initializeChatModel(apiKey: string) {
  model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: 'gemini-1.5-pro',
    temperature: 0.2,
  });
}

// Create a formatter function for retrieved documents
function formatDocumentsAsChatContext(documents: Document[]): string {
  return documents.map((doc, i) => {
    const source = doc.metadata.source || 'Unknown source';
    return `Document ${i + 1} (Source: ${source})\n${doc.pageContent}\n`;
  }).join('\n\n');
}

// Function to check if a query is within the support scope
export async function isWithinSupportScope(query: string): Promise<boolean> {
  try {
    // Attempt to retrieve relevant documents 
    const results = await queryVectorStore(query, 3);
    
    // If we found ANY relevant documents, consider it in scope
    return results.length > 0;
  } catch (error) {
    console.error('Error checking support scope:', error);
    // If there's an error accessing the vector store, return false
    return false;
  }
}

// Generate a response using RAG
export async function generateResponse(query: string): Promise<string> {
  // Check if the model is initialized
  if (!model) {
    throw new Error('Chat model is not initialized');
  }

  try {
    // First, check if the query is within the support scope
    const inScope = await isWithinSupportScope(query);

    if (!inScope) {
      // If no relevant documents, or vector store is not available
      if (model) {
        // Use the model to generate a fallback response without RAG
        return await generateBasicResponse(query);
      } else {
        return "I don't know. Also, the knowledge base is not available.";
      }
    }

    // Retrieve relevant documents
    const documents = await queryVectorStore(query, 5);
    
    // Format the documents as context
    const context = formatDocumentsAsChatContext(documents);

    // Create a system prompt that instructs the model to only use provided information
    const systemTemplate = 
      `You are a helpful customer support agent for Angel One, a financial services company.
      Answer the user's question based ONLY on the information provided in the context below.
      If the answer cannot be determined from the context, respond with "I don't know."
      Do not make up or infer information that is not explicitly stated in the context.
      
      Context:
      {context}`;

    // Create a prompt template
    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate('{query}')
    ]);

    // Create a chain
    const chain = RunnableSequence.from([
      {
        query: (input: { query: string }) => input.query,
        context: (input: { query: string }) => context
      },
      chatPrompt,
      model,
      new StringOutputParser()
    ]);

    // Run the chain
    const response = await chain.invoke({
      query: query
    });

    return response;
  } catch (error) {
    console.error('Error generating response:', error);
    return "I'm having trouble accessing my knowledge base. Please try again later.";
  }
}

// Fallback function when vector store is not available
async function generateBasicResponse(query: string): Promise<string> {
  try {
    const systemTemplate = 
      `You are a helpful customer support agent for Angel One, a financial services company.
      Answer the user's question to the best of your ability.
      If you don't know the answer, respond with "I don't know."
      State that the knowledge base is currently unavailable, but you'll try to help with general information.`;

    const chatPrompt = ChatPromptTemplate.fromMessages([
      SystemMessagePromptTemplate.fromTemplate(systemTemplate),
      HumanMessagePromptTemplate.fromTemplate('{query}')
    ]);

    const chain = RunnableSequence.from([
      {
        query: (input: { query: string }) => input.query
      },
      chatPrompt,
      model,
      new StringOutputParser()
    ]);

    const response = await chain.invoke({
      query: query
    });

    return response;
  } catch (error) {
    console.error('Error generating fallback response:', error);
    return "I'm having trouble right now. Please try again later.";
  }
} 
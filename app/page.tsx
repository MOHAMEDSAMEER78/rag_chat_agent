import ChatInterface from './components/ChatInterface';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Angel One Support Assistant
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A specialized chatbot trained on Angel One&apos;s customer support documentation.
            Ask any questions related to Angel One&apos;s services, and I&apos;ll provide accurate information.
          </p>
        </div>
        
        <div className="w-full h-[70vh]">
          <ChatInterface />
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Powered by RAG - The chatbot answers questions strictly based on Angel One&apos;s documentation.</p>
          <p className="mt-2">
            <a href="https://www.angelone.in/support" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Visit Angel One Support
            </a>
          </p>
        </div>
        </div>
      </main>
  );
}

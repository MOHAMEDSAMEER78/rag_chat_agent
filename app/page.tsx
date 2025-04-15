import ChatInterface from './components/ChatInterface';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Angel One Support Assistant
          </h1>
        </div>
        
        <div className="w-full h-[75vh]">
          <ChatInterface />
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Powered by RAG - The chatbot answers questions strictly based on Angel One&apos;s documentation.</p>
          <p className="mt-2">
            <a href="https://www.angelone.in/support" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Visit Angel One Support
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

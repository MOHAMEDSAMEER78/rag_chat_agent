import ChatInterface from './components/ChatInterface';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            Angel One Support Assistant
          </h1>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm font-medium"
            >
              Admin Dashboard
            </Link>
            <ThemeToggle />
          </div>
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

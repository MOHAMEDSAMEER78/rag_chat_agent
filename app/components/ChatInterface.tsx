'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { ThemeToggle } from "../../components/theme-toggle";
import { Loader2, Send } from 'lucide-react';

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'I am an AI assistant that can help with Angel One related queries.'
    },
    {
      role: 'assistant',
      content: "Hi there! I'm your Angel One support assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || loading) return;
    
    // Add user message
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading
    setInput('');
    setLoading(true);
    
    try {
      // Call the chat API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        // Add a timeout to prevent hanging forever
        signal: AbortSignal.timeout(15000), // 15 seconds timeout
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add the assistant's response to the chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.content 
      }]);
    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble accessing information at the moment. This could be because the knowledge database is not connected. The application needs ChromaDB running to provide accurate answers." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col w-full h-full border rounded-lg shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">AO</AvatarFallback>
          </Avatar>
          <CardTitle className="text-lg font-medium">Angel One Support Assistant</CardTitle>
        </div>
        <ThemeToggle />
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .filter(message => message.role !== 'system')
          .map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground ml-12' 
                  : 'bg-muted border ml-2'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center mb-1">
                  <Avatar className="h-6 w-6 mr-2">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">AO</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">Angel One Assistant</span>
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted border rounded-lg px-4 py-2 flex items-center space-x-2 max-w-[80%]">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="text-sm">Angel One Assistant is typing...</p>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
            disabled={loading}
          />
          <Button 
            onClick={handleSend} 
            disabled={input.trim() === '' || loading}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 
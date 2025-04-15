'use client';

import { useState } from 'react';
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
    { role: 'assistant', content: "Hi there! I'm your Angel One support assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading
    setInput('');
    setLoading(true);
    
    try {
      // This is a placeholder - in a real app, you would call your AI backend here
      // For demo purposes, we'll just simulate a response after a delay
      setTimeout(() => {
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: "I'm an AI assistant for Angel One. I'd be happy to help with your questions about Angel One's services, trading accounts, investments, or technical support. What specifically would you like to know?" 
        };
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error calling AI:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant' as const, 
        content: "I'm sorry, I encountered an error. Please try again." 
      }]);
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
        {messages.map((message, index) => (
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
      </CardContent>

      <CardFooter className="p-4 border-t">
        <div className="flex w-full items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1"
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
'use client';
import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

// Types
interface Message {
  role: 'you' | 'guide';
  content: string;
}

interface ChatResponse {
  result: string;
  error?: string | boolean;
}

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'guide', content: "Ask me anything, like: 'What's a wallet?' or 'How do I buy Bitcoin?' or 'What's crypto?'" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const runFlow = async (message: string): Promise<ChatResponse> => {
    const payload = {
      input_value: message,
      output_type: "chat",
      input_type: "chat",
      tweaks: {}
    };

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from assistant');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(typeof data.result === 'string' ? data.result : 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'you', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await runFlow(userMessage);
      const result = response.result;
      
      if (result) {
        setMessages(prev => [...prev, { role: 'guide', content: result }]);
      } else {
        throw new Error('No response from the assistant');
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'guide', 
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Sorry, there was an error processing your request.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#EEEEEE]">
      <header className="fixed top-0 left-0 right-0 bg-[#EEEEEE] z-10 p-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-semibold mb-2">
            How Do I Get Started With...
          </h1>
          <h2 className="text-gray-600 text-lg">
            Ask Me Anything: Your Crypto Questions Answered
          </h2>
        </div>
      </header>

      <div className="flex-1 mt-[160px] px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white min-h-[400px] flex flex-col rounded-lg shadow-sm">
            <div className="flex-1 overflow-y-auto max-h-[60vh] scroll-smooth">
              {messages.map((message, index) => (
                <div key={index} className="p-4">
                  <div className="text-sm text-gray-600 mb-1">{message.role.toUpperCase()}</div>
                  <div className={`p-4 rounded-lg ${
                    message.role === 'guide' ? 'bg-gray-50' : 'bg-blue-50'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="p-4">
                  <div className="text-sm text-gray-600 mb-1">GUIDE</div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4 flex gap-4 bg-white">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about the Crypto world..."
                className="flex-1 p-3 border rounded-md"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={isLoading}
                className={`p-3 rounded-md text-white transition-colors aspect-square ${
                  isLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-800'
                }`}
                aria-label="Send message"
              >
                {isLoading ? (
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <PaperAirplaneIcon className="h-6 w-6" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

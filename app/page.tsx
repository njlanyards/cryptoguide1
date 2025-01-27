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
  error?: boolean;
}

interface ApiMessage {
  role: string;
  content: string;
}

export default function Home() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'guide', content: "Ask me anything about crypto! For example: 'What's a wallet?' or 'How do I buy Bitcoin?'" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Convert UI messages to API format
  const getApiMessages = (msgs: Message[]): ApiMessage[] => {
    return msgs
      .filter(msg => msg.role !== 'guide' || msgs.indexOf(msg) !== 0) // Skip initial greeting
      .map(msg => ({
        role: msg.role === 'you' ? 'user' : 'assistant',
        content: msg.content
      }));
  };

  const runChat = async (message: string): Promise<ChatResponse> => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        message,
        history: getApiMessages(messages)
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to get response');
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = inputMessage.trim();
    if (!message || isLoading) return;

    setInputMessage('');
    setMessages(prev => [...prev, { role: 'you', content: message }]);
    setIsLoading(true);

    try {
      const response = await runChat(message);
      if (response.error) {
        throw new Error(response.result);
      }
      setMessages(prev => [...prev, { role: 'guide', content: response.result }]);
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
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-10 p-4 shadow-sm">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Crypto Guide
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">
            Your Friendly Crypto Assistant
          </p>
        </div>
      </header>

      <div className="flex-1 mt-[100px] px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="flex-1 overflow-y-auto max-h-[65vh] md:max-h-[70vh] scroll-smooth p-4">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 ${message.role === 'you' ? 'ml-auto' : 'mr-auto'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'guide' 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-blue-600 text-white ml-auto'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="border-t p-4">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ask me anything about crypto..."
                  className="w-full p-3 pr-12 rounded-full border border-gray-200 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-colors"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`absolute right-2 p-2 rounded-full transition-colors ${
                    isLoading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

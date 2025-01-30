'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import ChangeLog from './components/ChangeLog';

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
    { role: 'guide', content: "Ask me anything about crypto! For example: &apos;What&apos;s a wallet?&apos; or &apos;How do I buy Bitcoin?&apos;" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (shouldScroll && messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
      setShouldScroll(false);
    }
  }, [shouldScroll]);

  useEffect(() => {
    if (messages.length > 1 || isLoading) {
      setShouldScroll(true);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

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
    setShouldScroll(true);
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
            Crypto Crumbs
          </h1>
          <p className="text-gray-600 text-sm md:text-base mt-1">
            Curious About Crypto? Ask Me Anything!
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

      {/* SEO Content Section */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        <section className="mb-16">
          <h1 className="text-4xl font-bold mb-6 text-gray-900">Complete Guide to Understanding Cryptocurrency</h1>
          
          <div className="prose lg:prose-lg">
            <p className="lead-paragraph text-xl mb-8">
              Whether you&apos;re new to crypto or looking to deepen your understanding, this comprehensive guide covers everything from Bitcoin basics to advanced blockchain concepts. Learn how to invest safely, understand crypto mining, and navigate the exciting world of digital assets.
            </p>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-12">
              <h2 className="text-2xl font-semibold mb-4">Quick Navigation</h2>
              <nav className="grid md:grid-cols-2 gap-4">
                <a href="#basics" className="hover:text-blue-600 transition-colors">Understanding Crypto Basics</a>
                <a href="#bitcoin" className="hover:text-blue-600 transition-colors">Bitcoin for Beginners</a>
                <a href="#security" className="hover:text-blue-600 transition-colors">Crypto Security Guide</a>
                <a href="#investing" className="hover:text-blue-600 transition-colors">Smart Investment Strategies</a>
                <a href="#mining" className="hover:text-blue-600 transition-colors">Crypto Mining Explained</a>
                <a href="#trends" className="hover:text-blue-600 transition-colors">Latest Crypto Trends</a>
              </nav>
            </div>

            <section id="basics" className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">Understanding Cryptocurrency for Beginners</h2>
              <p className="mb-4">
                Cryptocurrency represents a revolutionary form of digital money that operates on blockchain technology. Unlike traditional currencies, crypto offers decentralized control, enhanced security through cryptography, and the potential for financial innovation through smart contracts and DeFi (Decentralized Finance) applications.
              </p>
              
              <div className="bg-white shadow-sm rounded-lg p-6 my-8">
                <h3 className="text-xl font-semibold mb-4">Key Concepts for Crypto Beginners</h3>
                <ul className="space-y-3">
                  <li>• <strong>Blockchain:</strong> The underlying technology that powers cryptocurrencies</li>
                  <li>• <strong>Digital Wallets:</strong> Secure storage for your crypto assets</li>
                  <li>• <strong>Public & Private Keys:</strong> Essential elements for transaction security</li>
                  <li>• <strong>Decentralization:</strong> The core principle of cryptocurrency networks</li>
                </ul>
              </div>
            </section>

            <section id="bitcoin" className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">Bitcoin for Beginners: Your Complete Guide</h2>
              <p className="mb-4">
                Bitcoin, the first and most well-known cryptocurrency, continues to lead the digital asset revolution. Understanding how to buy Bitcoin safely and manage your investments is crucial for anyone entering the crypto space.
              </p>

              <div className="grid md:grid-cols-2 gap-6 my-8">
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h4 className="font-semibold mb-3">How to Buy Bitcoin Safely</h4>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Choose a reputable cryptocurrency exchange</li>
                    <li>Set up secure two-factor authentication</li>
                    <li>Connect your bank account or payment method</li>
                    <li>Start with a small investment to learn the process</li>
                    <li>Consider cold storage for long-term holdings</li>
                  </ol>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Bitcoin Storage Options</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Hardware wallets for maximum security</li>
                    <li>Software wallets for convenience</li>
                    <li>Paper wallets for cold storage</li>
                    <li>Exchange wallets for active trading</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="security" className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">Cryptocurrency Security Best Practices</h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8">
                <h3 className="text-xl font-semibold mb-4">Essential Security Checklist</h3>
                <ul className="space-y-3">
                  <li>✓ Use hardware wallets for long-term storage</li>
                  <li>✓ Enable multi-factor authentication on all accounts</li>
                  <li>✓ Keep private keys offline and secure</li>
                  <li>✓ Use unique passwords for each platform</li>
                  <li>✓ Regularly update security software</li>
                </ul>
              </div>
            </section>

            <section id="investing" className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">Smart Crypto Investment Strategies</h2>
              <p className="mb-4">
                Learning how to invest in crypto requires understanding market dynamics, reading crypto charts, and implementing sound investment strategies. Here&apos;s what you need to know about making informed investment decisions.
              </p>

              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Research</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Analyze market trends</li>
                    <li>Study project whitepapers</li>
                    <li>Follow industry news</li>
                  </ul>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Risk Management</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Diversify investments</li>
                    <li>Set stop-loss orders</li>
                    <li>Only invest what you can afford</li>
                  </ul>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h4 className="font-semibold mb-3">Strategy</h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Dollar-cost averaging</li>
                    <li>Long-term holding</li>
                    <li>Regular portfolio rebalancing</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="mining" className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">Understanding Cryptocurrency Mining</h2>
              <p className="mb-4">
                Cryptocurrency mining is the process of validating transactions and adding them to the blockchain while earning rewards. Whether you&apos;re interested in Bitcoin mining or other cryptocurrencies, understanding the basics is essential.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg my-8">
                <h3 className="text-xl font-semibold mb-4">Mining Essentials</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Hardware Requirements</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>ASIC miners for Bitcoin</li>
                      <li>GPUs for altcoins</li>
                      <li>Cooling systems</li>
                      <li>Power supply units</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Mining Considerations</h4>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Electricity costs</li>
                      <li>Hardware maintenance</li>
                      <li>Mining pool selection</li>
                      <li>Profitability calculations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section id="trends" className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">Latest Trends in Cryptocurrency</h2>
              <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Emerging Technologies</h3>
                  <ul className="list-disc list-inside space-y-2">
                    <li>DeFi (Decentralized Finance) innovations</li>
                    <li>NFT marketplaces and applications</li>
                    <li>Web3 development and adoption</li>
                    <li>Layer-2 scaling solutions</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-semibold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h3 className="font-semibold mb-2">Is Bitcoin safe to invest in?</h3>
                  <p>While Bitcoin has established itself as a leading digital asset, all investments carry risk. Understanding the technology, following security best practices, and investing responsibly can help mitigate these risks.</p>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h3 className="font-semibold mb-2">How do I sell Bitcoin for cash?</h3>
                  <p>You can sell Bitcoin through cryptocurrency exchanges, peer-to-peer platforms, or Bitcoin ATMs. Each method offers different advantages in terms of speed, privacy, and fees.</p>
                </div>
                <div className="bg-white shadow-sm rounded-lg p-6">
                  <h3 className="font-semibold mb-2">What are meme coins?</h3>
                  <p>Meme coins are cryptocurrencies inspired by internet memes or cultural phenomena. While some like Dogecoin have gained significant attention, they often carry higher risk and volatility compared to established cryptocurrencies.</p>
                </div>
              </div>
            </section>
          </div>
        </section>
      </article>

      <ChangeLog />
    </main>
  );
}

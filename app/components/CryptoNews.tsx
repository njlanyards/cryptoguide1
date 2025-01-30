'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface NewsItem {
  title: string;
  description: string;
  link: string;
  image_url: string;
  pubDate: string;
  source_id: string;
}

// Function to check if image URL is from an allowed domain
const isAllowedImageDomain = (url: string) => {
  try {
    const hostname = new URL(url).hostname;
    const allowedDomains = [
      'techbullion.com',
      'www.techbullion.com',
      'cointelegraph.com',
      'www.cointelegraph.com',
      'coindesk.com',
      'www.coindesk.com',
      'decrypt.co',
      'www.decrypt.co',
      'bitcoinist.com',
      'www.bitcoinist.com',
      'cryptonews.com',
      'www.cryptonews.com',
      'newsbtc.com',
      'www.newsbtc.com'
    ];
    return allowedDomains.includes(hostname);
  } catch {
    return false;
  }
};

export default function CryptoNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/crypto-news');
        const data = await response.json();
        
        // Filter news items to only include those with valid image URLs
        const newsWithImages = (data.results || []).filter(
          (item: NewsItem) => item.image_url && isAllowedImageDomain(item.image_url)
        );
        
        setNews(newsWithImages);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchNews();
  }, []);

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Latest Crypto News</h3>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((item, index) => (
            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:bg-gray-50 rounded-lg transition duration-150 ease-in-out"
            >
              <article className="flex items-start space-x-6 p-4">
                <div className="flex-shrink-0 relative w-48 h-32 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.title}
                  </h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">{item.source_id}</span>
                    <span className="mx-2">•</span>
                    <time dateTime={item.pubDate}>
                      {new Date(item.pubDate).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      )}
    </div>
  );
} 
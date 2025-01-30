'use client';
import { useEffect, useRef } from 'react';

export default function NewsWidget() {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!widgetRef.current) return;

    // Create container div for the widget
    const container = document.createElement('div');
    container.id = `ct-widget-${Math.random().toString(36).substr(2, 9)}`;
    widgetRef.current.appendChild(container);

    // Load CoinTelegraph widget script
    const script = document.createElement('script');
    script.src = 'https://cointelegraph.com/news-widget';
    script.async = true;
    script.defer = true;

    // Add widget attributes
    script.setAttribute('data-ct-widget-limit', '10');
    script.setAttribute('data-ct-widget-theme', 'light');
    script.setAttribute('data-ct-widget-images', 'true');
    script.setAttribute('data-ct-widget-category', 'altcoin,blockchain,bitcoin,ethereum,litecoin,monero,ripple');
    script.setAttribute('data-ct-widget-language', 'en');
    script.setAttribute('data-ct-widget-container-id', container.id);

    // Append script to the container
    container.appendChild(script);

    return () => {
      // Cleanup when component unmounts
      if (widgetRef.current && container) {
        widgetRef.current.removeChild(container);
      }
    };
  }, []);

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Latest Crypto News</h3>
      <div ref={widgetRef} className="w-full min-h-[500px]" />
    </div>
  );
} 
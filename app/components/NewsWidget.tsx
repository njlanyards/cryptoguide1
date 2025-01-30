'use client';
import { useEffect, useRef } from 'react';

export default function NewsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Store ref value in a variable for cleanup
    const container = containerRef.current;

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://cointelegraph.com/news-widget';
    script.async = true;

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'cointelegraph-news-widget';
    widgetContainer.setAttribute('data-ct-widget-limit', '10');
    widgetContainer.setAttribute('data-ct-widget-theme', 'light');
    widgetContainer.setAttribute('data-ct-widget-size', 'medium');
    widgetContainer.setAttribute('data-ct-widget-language', 'en');
    widgetContainer.setAttribute('data-ct-widget-images', '1');

    // Add container and script
    container.appendChild(widgetContainer);
    document.body.appendChild(script);

    return () => {
      // Use stored container reference in cleanup
      if (container) {
        container.innerHTML = '';
      }
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Latest Crypto News</h3>
      <div ref={containerRef} className="w-full" />
    </div>
  );
} 
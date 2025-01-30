'use client';
import { useEffect, useRef } from 'react';

interface GeckoCoinPriceMarqueeWidgetAttributes {
  'coin-ids': string;
  'locale': string;
  'transparent-background': string;
  'outlined': string;
  'initial-currency': string;
}

declare global {
  interface HTMLElementTagNameMap {
    'gecko-coin-price-marquee-widget': HTMLElement & GeckoCoinPriceMarqueeWidgetAttributes;
  }
}

export default function CoinMarquee() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js';
    script.async = true;

    // Create widget element
    const widget = document.createElement('gecko-coin-price-marquee-widget');
    widget.setAttribute('coin-ids', 'bitcoin,ethereum,solana,cardano');
    widget.setAttribute('locale', 'en');
    widget.setAttribute('transparent-background', 'true');
    widget.setAttribute('outlined', 'true');
    widget.setAttribute('initial-currency', 'usd');

    // Add elements to container
    containerRef.current.appendChild(widget);
    document.body.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      document.body.removeChild(script);
    };
  }, []);

  return <div ref={containerRef} className="w-full" />;
} 
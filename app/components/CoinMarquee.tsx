'use client';
import Script from 'next/script';

interface GeckoCoinPriceMarqueeWidgetAttributes {
  coinIds: string;
  currency: string;
  locale: string;
}

declare global {
  interface HTMLElementTagNameMap {
    'gecko-coin-price-marquee-widget': HTMLElement & GeckoCoinPriceMarqueeWidgetAttributes;
  }
}

export default function CoinMarquee() {
  return (
    <div className="w-full bg-white/30 backdrop-blur border-b border-gray-200">
      <div dangerouslySetInnerHTML={{
        __html: `<gecko-coin-price-marquee-widget 
          coin-ids="bitcoin,ethereum,ripple,dogecoin" 
          currency="usd" 
          locale="en"
        ></gecko-coin-price-marquee-widget>`
      }} />
      <Script src="https://widgets.coingecko.com/coingecko-coin-price-marquee-widget.js" />
    </div>
  );
} 
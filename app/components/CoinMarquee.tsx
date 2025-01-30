'use client';
import Script from 'next/script';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gecko-coin-price-marquee-widget': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        locale?: string;
        'transparent-background'?: string;
        outlined?: string;
        'coin-ids'?: string;
        'initial-currency'?: string;
      };
    }
  }
}

export default function CoinMarquee() {
  const widgetHtml = `
    <gecko-coin-price-marquee-widget 
      locale="en" 
      transparent-background="true" 
      outlined="true" 
      coin-ids="bitcoin,ethereum,binancecoin,solana,cardano,ripple" 
      initial-currency="usd">
    </gecko-coin-price-marquee-widget>
  `;

  return (
    <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto">
        <Script src="https://widgets.coingecko.com/gecko-coin-price-marquee-widget.js" />
        <div dangerouslySetInnerHTML={{ __html: widgetHtml }} />
      </div>
    </div>
  );
} 
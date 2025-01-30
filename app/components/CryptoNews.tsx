'use client';

export default function CryptoNews() {
  return (
    <div className="bg-white shadow-sm rounded-lg p-6 mt-6">
      <h3 className="text-xl font-semibold mb-4">Latest Crypto News</h3>
      <iframe 
        width="100%" 
        height="600px"
        src="https://cryptopanic.com/widgets/news/?bg_color=FFFFFF&font_family=Inter&header_bg_color=4F46E5&header_text_color=FFFFFF&link_color=4F46E5&news_feed=trending&posts_limit=10&text_color=374151" 
        frameBorder="0"
        scrolling="yes"
        style={{
          borderRadius: '0.5rem',
          backgroundColor: 'white',
        }}
      />
    </div>
  );
} 
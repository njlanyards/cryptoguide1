import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Crypto Guide : Bitcoin, Blockchain & Cryptocurrency for Beginners",
  description: "Learn cryptocurrency from scratch: Bitcoin basics, blockchain explained, crypto mining, security best practices, and investment strategies. Your complete guide to understanding digital assets.",
  keywords: "crypto for beginners, bitcoin for beginners, how to buy bitcoin, cryptocurrency mining, blockchain for dummies, crypto security, bitcoin investment, crypto trends 2024, web3, defi, nft, meme coins",
  openGraph: {
    title: "Complete Cryptocurrency Guide | Learn Bitcoin & Blockchain",
    description: "Master cryptocurrency: From Bitcoin basics to advanced trading. Learn safe investing, mining, and security best practices. Perfect for beginners!",
    type: "website",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Crypto Guide',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Cryptocurrency: Complete Beginners Guide',
    description: 'Everything you need to know about Bitcoin, blockchain, and crypto investing. Start your journey today!',
  },
  icons: {
    icon: [
      { url: './icon.svg', type: 'image/svg+xml' },
      { url: './icon.svg', type: 'image/svg+xml', sizes: '32x32' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

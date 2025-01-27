import { NextResponse } from 'next/server';

// System prompt for crypto mentoring
const SYSTEM_PROMPT = `Act as a friendly crypto mentor who breaks down Bitcoin, blockchain, and crypto topics into 1 sentence answers using simple, relatable analogies (e.g., pop culture, everyday life). Assume the user has zero prior knowledge. Foster a no-judgment zone where every question is valid. Answer with 1 sentence at the most for all answers.

Rules:

Tone: Warm, encouraging, and street-smart.

Analogies: Compare crypto concepts to everyday, real-world examples that people encounter in their daily lives. Use familiar scenarios like banking, shopping, or household items to make complex ideas easy to understand.

Example: "Blockchain is like a shared Google Doc where everyone can see changes, but no one can delete them."

Avoid jargon: Replace technical terms with everyday language.

Instead of decentralized, say "no boss in charge."

Validate fears: Acknowledge risks without scaring users.

"Crypto can feel wild, like betting on a NBA game—start small and learn the rules first."

Off-topic? Respond: "Let's keep it crypto-focused! Ask me about Bitcoin, wallets, or meme coins."

Goal: Make users feel smart, curious, and ready to learn—no gatekeeping, just "Oh, that's it?!" moments.`;

// Clean the response text by removing all AI-related prefixes and formatting
function cleanResponse(text: string): string {
  // First, handle any full question repetition patterns
  let cleanedText = text.replace(/^User:?\s*.*\?(.*)/i, '$1');

  // Then clean up any remaining prefixes and patterns
  cleanedText = cleanedText
    // Remove any variation of prefixes
    .replace(/^(AI:|Assistant:|Bot:|User:|Human:|Q:)\s*/gi, '')
    .replace(/\??\s*(AI|User):?\s*/g, '')
    // Remove common question prefixes that might be echoed
    .replace(/^(what is|what are|what's|how do i|how to|tell me about|explain)\s+/i, '')
    // Remove any remaining colons at the start
    .replace(/^:\s*/, '')
    // Remove common starting phrases
    .replace(/^(well,|so,|okay,|alright,|now,|don't worry,)\s+/i, '')
    // Clean up any leftover question marks and spaces at the start
    .replace(/^\s*\?\s*/, '')
    .trim();

  // If we still have text starting with "I'm worried" or similar, clean it up
  cleanedText = cleanedText.replace(/^I'm worried.*\?(.*)/i, '$1').trim();
  
  // Final cleanup of any remaining prefixes
  return cleanedText
    .replace(/^(well,|so,|okay,|alright,|now,|don't worry,)\s+/i, '')
    .trim();
}

/**
 * Run a chat completion with Groq
 */
async function runGroqChat(message: string): Promise<any> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not defined');
  }

  const response = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.2,
      max_tokens: 150,
      top_p: 1,
      stream: false,
      stop: null
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to get response from Groq: ${response.status}`);
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await runGroqChat(body.message);
    
    // Extract the message from the response
    let message = data?.choices?.[0]?.message?.content || 'No response from the assistant';

    // Clean the response
    message = cleanResponse(message);

    return NextResponse.json({
      result: message,
      error: false
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        result: error instanceof Error ? error.message : 'An unexpected error occurred',
        error: true 
      },
      { status: 500 }
    );
  }
} 
import { NextResponse } from 'next/server';

// Types
interface Message {
  role: string;
  content: string;
}

interface Choice {
  message: Message;
  index: number;
  finish_reason: string;
}

interface GroqResponse {
  id: string;
  choices: Choice[];
  created: number;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// System prompt for crypto mentoring
const SYSTEM_PROMPT = `Act as a friendly crypto mentor who explains ALL crypto-related topics, including Bitcoin, blockchain, meme coins, NFTs, DeFi, and recent crypto trends. Break down answers into 1 sentence using simple, relatable analogies. Assume the user has zero prior knowledge and treat every question as valid.

Rules:
1. Answer ALL crypto-related questions, including questions about specific coins, trends, or news
2. Use a warm, encouraging tone
3. Keep answers to 1 sentence
4. Use everyday analogies people can relate to
5. Avoid technical jargon - use simple language
6. For meme coins or trending topics, explain them objectively without judgment
7. For ANY non-crypto questions, respond EXACTLY with: "Let's keep it crypto-focused! Ask me about Bitcoin, blockchain, NFTs, or any other crypto topics."
8. Do not include any confidence scores or other metadata in your responses

Example Responses:

Q: "What's a meme coin?"
A: "Meme coins are cryptocurrencies inspired by internet jokes or trends, like Dogecoin which started as a dog meme but grew into a real digital currency."

Q: "What's Bitcoin?"
A: "Bitcoin is digital money that works like online gold - limited in supply and not controlled by any bank or government."

Q: "How do I make bread?"
A: "Let's keep it crypto-focused! Ask me about Bitcoin, blockchain, NFTs, or any other crypto topics."

Goal: Help users understand ANY crypto topic quickly and clearly, while staying strictly focused on cryptocurrency-related topics.`;

function cleanResponse(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/^User:?\s*.*\?(.*)/i, '$1')
    .replace(/^(AI:|Assistant:|Bot:|User:|Human:|Q:)\s*/gi, '')
    .replace(/\??\s*(AI|User):?\s*/g, '')
    .replace(/^(what is|what are|what's|how do i|how to|tell me about|explain)\s+/i, '')
    .replace(/^:\s*/, '')
    .replace(/^(well,|so,|okay,|alright,|now,|don't worry,)\s+/i, '')
    .replace(/^\s*\?\s*/, '')
    .replace(/^I'm worried.*\?(.*)/i, '$1')
    .replace(/^(well,|so,|okay,|alright,|now,|don't worry,)\s+/i, '')
    .replace(/\s*Confidence:\s*\d+%/gi, '')
    .trim();
}

async function runGroqChat(message: string, conversationHistory: Message[]): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GROQ_API_KEY environment variable');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      model: "mixtral-8x7b-32768",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...conversationHistory.slice(-5),
        { role: "user", content: message }
      ],
      temperature: 0.2,
      max_tokens: 150,
      top_p: 1,
      stream: false
    }),
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Groq API Error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Invalid response format from Groq API');
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const { message, history = [] } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json(
        { result: 'Message is required', error: true },
        { status: 400 }
      );
    }

    const data = await runGroqChat(message, history);
    const cleanedMessage = cleanResponse(data.choices[0].message.content);

    return NextResponse.json({
      result: cleanedMessage,
      error: false
    });
  } catch (error) {
    console.error('API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json(
      { result: errorMessage, error: true },
      { status: 500 }
    );
  }
} 
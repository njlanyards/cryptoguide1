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
const SYSTEM_PROMPT = `You are a friendly crypto mentor who explains all cryptocurrency-related topics concisely. Use simple, relatable analogies in one-sentence answers. Assume no prior knowledge and treat all questions as valid.

Instructions:
1. For greetings like "Hi", "Hello", etc., respond with: "Hi there! What would you like to know about crypto today?"
2. Answer all crypto questions (coins, trends, news) in one sentence.
3. Use a warm, encouraging tone.
4. Employ everyday analogies people can relate to.
5. Avoid technical jargon; use simple language.
6. Explain meme coins and trends objectively.
7. For non-crypto questions, respond only with: "Let's keep it crypto-focused! Ask me about Bitcoin, blockchain, NFTs, or any other crypto topics."
8. Provide examples only when explicitly requested.
9. Add explanations only when asked.
10. Do not include any confidence scores or metadata.

Example responses:
- User: "Hi" or "Hello" or "Hi there" or "Hello there" or "Hey" or "Hey there" or "Hiya" or "Howdy" or "Greetings" or "Good morning" or "Good afternoon" or "Good evening" or "Hi again" or "Hello again" or "Hi chatbot" or "Hello chatbot" or "Hi bot" or "Hello bot" or "Hi assistant" or "Hello assistant" or "Hi AI" or "Hello AI" or "Hi friend" or "Hello friend" or "Hi team" or "Hello team" or "Hi support" or "Hello support" or "Hi help" or "Hello help" or "Good day" or "Good day chatbot" or "Good day bot" or "Good day assistant" or "Good day AI" or "Good day friend" or "Good day team" or "Good day support" or "Good day help"
  Response: "Hi there! What would you like to know about crypto today?"

  Example Questions:
- Q: "What's a meme coin?" A: "Meme coins are like inside jokes in the form of digital money, often inspired by internet trends or popular memes."
- Q: "What's Bitcoin?" A: "Bitcoin is like digital gold you can send through the internet, with a limited supply and no central authority controlling it."
- Q: "How do I make bread?" A: "Let's keep it crypto-focused! Ask me about Bitcoin, blockchain, NFTs, or any other crypto topics."

Goal: Quickly and clearly explain any crypto topic while staying strictly focused on cryptocurrency-related subjects and being conversational for greetings.`;

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
      model: "llama-3.3-70b-versatile",
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
import { NextResponse } from 'next/server';

// Default tweaks matching the Python implementation
const DEFAULT_TWEAKS = {
  "ChatInput-bAJ4v": {},
  "Prompt-GMTqC": {},
  "GroqModel-41nqs": {},
  "ChatOutput-fPDgJ": {},
  "Memory-5wiMl": {}
};

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

if (!process.env.LANGFLOW_BASE_URL) throw new Error('LANGFLOW_BASE_URL is not defined');
if (!process.env.LANGFLOW_ID) throw new Error('LANGFLOW_ID is not defined');
if (!process.env.FLOW_ID) throw new Error('FLOW_ID is not defined');
if (!process.env.APPLICATION_TOKEN) throw new Error('APPLICATION_TOKEN is not defined');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const endpoint = process.env.FLOW_ID;
    const api_url = `${process.env.LANGFLOW_BASE_URL}/lf/${process.env.LANGFLOW_ID}/api/v1/run/${endpoint}`;

    const payload = {
      input_value: body.message,
      output_type: "chat",
      input_type: "chat",
      tweaks: DEFAULT_TWEAKS
    };

    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${process.env.APPLICATION_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to get response from assistant: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the message from the response
    let message = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || 
                 data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
                 'No response from the assistant';

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
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

/**
 * Run a flow with a given message and optional tweaks.
 */
async function runFlow(
  message: string,
  endpoint: string,
  outputType: string = "chat",
  inputType: string = "chat",
  tweaks: Record<string, any> = DEFAULT_TWEAKS,
  applicationToken: string
): Promise<any> {
  const apiUrl = `${process.env.LANGFLOW_BASE_URL}/lf/${process.env.LANGFLOW_ID}/api/v1/run/${endpoint}`;

  const payload = {
    input_value: message,
    output_type: outputType,
    input_type: inputType,
    tweaks: tweaks
  };

  const headers = {
    "Authorization": `Bearer ${applicationToken}`,
    "Content-Type": "application/json"
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to get response from assistant: ${response.status}`);
  }

  return response.json();
}

if (!process.env.LANGFLOW_BASE_URL) throw new Error('LANGFLOW_BASE_URL is not defined');
if (!process.env.LANGFLOW_ID) throw new Error('LANGFLOW_ID is not defined');
if (!process.env.FLOW_ID) throw new Error('FLOW_ID is not defined');
if (!process.env.APPLICATION_TOKEN) throw new Error('APPLICATION_TOKEN is not defined');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // We can safely assert these types since we check for them above
    const endpoint = process.env.FLOW_ID!;
    const applicationToken = process.env.APPLICATION_TOKEN!;

    const data = await runFlow(
      body.message,
      endpoint,
      "chat",
      "chat",
      DEFAULT_TWEAKS,
      applicationToken
    );
    
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
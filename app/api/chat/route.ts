import { NextResponse } from 'next/server';

if (!process.env.LANGFLOW_BASE_URL) throw new Error('LANGFLOW_BASE_URL is not defined');
if (!process.env.LANGFLOW_ID) throw new Error('LANGFLOW_ID is not defined');
if (!process.env.FLOW_ID) throw new Error('FLOW_ID is not defined');
if (!process.env.APPLICATION_TOKEN) throw new Error('APPLICATION_TOKEN is not defined');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const api_url = `${process.env.LANGFLOW_BASE_URL}/lf/${process.env.LANGFLOW_ID}/api/v1/run/${process.env.FLOW_ID}`;
    
    console.log('Received request body:', body);
    console.log('Making request to:', api_url);

    const response = await fetch(api_url, {
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${process.env.APPLICATION_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const data = await response.json();
    console.log('Response data:', data);

    // Extract the message from the nested structure
    const message = data?.outputs?.[0]?.outputs?.[0]?.results?.message?.text || 
                   data?.outputs?.[0]?.outputs?.[0]?.artifacts?.message ||
                   'No response from the assistant';

    // Return the extracted message
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
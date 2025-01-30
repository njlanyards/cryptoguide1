import { NextResponse } from 'next/server';

const API_KEY = process.env.NEWSDATA_API_KEY;
const API_URL = 'https://newsdata.io/api/1/news';

export async function GET() {
  try {
    const response = await fetch(
      `${API_URL}?apikey=${API_KEY}&q=cryptocurrency OR bitcoin OR ethereum&language=en&category=business,technology`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching crypto news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
} 
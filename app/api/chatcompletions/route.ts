import { NextRequest, NextResponse } from 'next/server';

type ApiResponse = {
  error?: string;
  data?: any;
};

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const API_KEY = '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';


  try {
    const { question } = await req.json(); // Get the question from the request body

    // Define the request payload with the dynamic question
    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: question, // Use the dynamic question here
        },
      ],
    };

    // Make the API request to Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    // Check if the response is successful
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message || 'Unknown error' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ data });
  } catch (error) {
    // Handle error
    return NextResponse.json({ error: 'Failed to fetch data from Groq API', data: error }, { status: 500 });
  }
}
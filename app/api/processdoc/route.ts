import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const doc_id = searchParams.get('doc_id');

    if (!user_id || !doc_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(
      `http://localhost:8080/process-document?user_id=${user_id}&doc_id=${doc_id}`,
      {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      }
    );

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}

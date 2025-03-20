import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const doc_id = searchParams.get('doc_id');

    if (!user_id || !doc_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const response = await fetch(`http://localhost:8000/check?user_id=${user_id}&doc_id=${doc_id}`);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check document' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();
     console.log('🔥 FRONTEND API RECEIVED:', body);
  const res = await fetch('http://localhost:8000/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

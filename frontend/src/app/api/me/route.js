import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const backendRes = await fetch('http://localhost:8000/me', {
      method: 'GET',
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
      cache: 'no-store', // ✅ VERY IMPORTANT
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: data.detail || 'Unauthorized' },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch {
    return NextResponse.json(
      { message: 'Backend not reachable' },
      { status: 500 }
    );
  }
}

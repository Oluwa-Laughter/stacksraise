import { NextResponse } from 'next/server';

export const revalidate = 10; // Cache for 10 seconds

export async function GET() {
  try {
    const res = await fetch('https://api.testnet.hiro.so/v2/info', {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Hiro node returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    console.error('Failed to proxy Stacks testnet info:', err);
    return NextResponse.json(
      { error: err?.message || 'Proxy error' },
      { status: 502 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

export const revalidate = 5; // Cache for 5 seconds

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address || !address.startsWith('S')) {
    return NextResponse.json(
      { error: 'Valid Stacks address required' },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${address}/balances`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 5 },
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
    console.error('Failed to proxy Stacks balance:', err);
    return NextResponse.json(
      { error: err?.message || 'Proxy error' },
      { status: 502 }
    );
  }
}

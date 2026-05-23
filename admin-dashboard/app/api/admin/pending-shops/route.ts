import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('pos_admin_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${API_BASE}/admin/pending-shops`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Failed to fetch shops' }, { status: 500 });
  }
}

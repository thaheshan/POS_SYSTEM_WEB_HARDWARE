import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Handle NestJS TransformInterceptor wrapper: { success: true, data: { data: { access_token: "..." } } }
    const actualData = data.success && data.data ? data.data : data;
    const token = actualData.data?.access_token || actualData.access_token;

    if (!token) {
      return NextResponse.json({ message: 'No token in response' }, { status: 500 });
    }

    const response = NextResponse.json({ ok: true, user: data.data?.user });

    // Set HttpOnly cookie — never accessible to JavaScript, fully secure
    response.cookies.set('pos_admin_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Login failed' }, { status: 500 });
  }
}

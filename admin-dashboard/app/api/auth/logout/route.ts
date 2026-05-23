import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Clear the HttpOnly cookie
  response.cookies.set('pos_admin_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  return response;
}

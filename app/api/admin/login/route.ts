import { NextResponse } from 'next/server'
import { signToken } from '@/lib/auth'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { email, password } = (body as Record<string, unknown>) ?? {}

  // Credentials checked server-side against env vars — never exposed to client
  const validEmail = process.env.ADMIN_EMAIL
  const validPassword = process.env.ADMIN_PASSWORD

  if (
    !validEmail ||
    !validPassword ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    email !== validEmail ||
    password !== validPassword
  ) {
    // Uniform delay to prevent timing attacks
    await new Promise((r) => setTimeout(r, 300))
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_session', token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    secure: process.env.NODE_ENV === 'production',
  })
  return res
}

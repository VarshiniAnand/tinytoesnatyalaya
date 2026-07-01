import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { signStudentToken } from '@/lib/auth'
import { readStudentByLoginPhone, verifyPassword } from '@/lib/students'

export async function POST(request: Request) {
  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { loginPhone, password } = (body as Record<string, unknown>) ?? {}

  if (typeof loginPhone !== 'string' || !loginPhone.trim())
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  if (typeof password !== 'string' || !password)
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })

  const student = await readStudentByLoginPhone(loginPhone.trim())

  // Always run verifyPassword to avoid timing-based enumeration
  const dummyHash = '0'.repeat(128)
  const dummySalt = '0'.repeat(64)
  const valid = student
    ? verifyPassword(password, student.passwordHash, student.passwordSalt)
    : verifyPassword(password, dummyHash, dummySalt)

  if (!student || !valid)
    return NextResponse.json({ error: 'Invalid phone number or password' }, { status: 401 })

  const token = signStudentToken(student.id)
  const store = await cookies()
  store.set('student_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  })
  return NextResponse.json({ ok: true })
}

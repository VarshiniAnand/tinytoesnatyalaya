import crypto from 'crypto'

function b64uEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/** Sign a session token using HMAC-SHA256 (runs in Node.js only — API routes). */
export function signToken(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET env var is not set')

  const payload = { role: 'admin', iat: Date.now() }
  const data = b64uEncode(Buffer.from(JSON.stringify(payload)))
  const sig = b64uEncode(crypto.createHmac('sha256', secret).update(data).digest())
  return `${data}.${sig}`
}

/** Verify a session token. Returns true only if the HMAC signature matches. */
export function verifyToken(token: string): boolean {
  const secret = process.env.SESSION_SECRET
  if (!secret || !token) return false

  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expectedSig = b64uEncode(
    crypto.createHmac('sha256', secret).update(data).digest(),
  )

  try {
    const sigBuf = Buffer.from(sig + '==', 'base64')
    const expBuf = Buffer.from(expectedSig + '==', 'base64')
    if (sigBuf.length !== expBuf.length) return false
    return crypto.timingSafeEqual(sigBuf, expBuf)
  } catch {
    return false
  }
}

/** Sign a student session token containing the student's ID. */
export function signStudentToken(studentId: string): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET env var is not set')

  const payload = { role: 'student', studentId, iat: Date.now() }
  const data = b64uEncode(Buffer.from(JSON.stringify(payload)))
  const sig = b64uEncode(crypto.createHmac('sha256', secret).update(data).digest())
  return `${data}.${sig}`
}

/** Verify a student session token. Returns the studentId if valid, otherwise null. */
export function verifyStudentToken(token: string): string | null {
  const secret = process.env.SESSION_SECRET
  if (!secret || !token) return null

  const dot = token.lastIndexOf('.')
  if (dot === -1) return null
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  const expectedSig = b64uEncode(
    crypto.createHmac('sha256', secret).update(data).digest(),
  )

  try {
    const sigBuf = Buffer.from(sig + '==', 'base64')
    const expBuf = Buffer.from(expectedSig + '==', 'base64')
    if (sigBuf.length !== expBuf.length) return null
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null

    const payload = JSON.parse(
      Buffer.from(data, 'base64url').toString('utf-8'),
    ) as { role?: string; studentId?: string }
    if (payload.role !== 'student' || typeof payload.studentId !== 'string') return null
    return payload.studentId
  } catch {
    return null
  }
}

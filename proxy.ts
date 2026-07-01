import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** Decode a base64url string to Uint8Array (Web Crypto safe). */
function b64uDecode(str: string): Uint8Array<ArrayBuffer> {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
  const binary = atob(padded)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf
}

/** Verify the HMAC-SHA256 session token using the Web Crypto API (edge-compatible). */
async function verifySessionEdge(token: string): Promise<boolean> {
  const secret = process.env.SESSION_SECRET
  if (!secret || !token) return false

  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const data = token.slice(0, dot)
  const sig = token.slice(dot + 1)

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify'],
    )
    return await crypto.subtle.verify(
      'HMAC',
      key,
      b64uDecode(sig),
      new TextEncoder().encode(data),
    )
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect already-authenticated users away from the login page
  if (pathname === '/admin/login') {
    const token = request.cookies.get('admin_session')?.value ?? ''
    if (token && (await verifySessionEdge(token))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Protect all other /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_session')?.value ?? ''
    const valid = token ? await verifySessionEdge(token) : false
    if (!valid) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const DATE_RE = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value ?? ''
  return verifyToken(token)
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json(await readEvents())
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { date, name, moveable } = (body as Record<string, unknown>) ?? {}

  if (typeof date !== 'string' || !DATE_RE.test(date)) {
    return NextResponse.json({ error: 'Invalid or missing date (expected YYYY-MM-DD)' }, { status: 400 })
  }
  if (typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Event name is required' }, { status: 400 })
  }

  await prisma.event.upsert({
    where: { date },
    update: { name: name.trim().slice(0, 100), moveable: moveable === true },
    create: { id: crypto.randomUUID(), date, name: name.trim().slice(0, 100), moveable: moveable === true },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { date } = (body as Record<string, unknown>) ?? {}
  if (typeof date !== 'string' || !DATE_RE.test(date)) {
    return NextResponse.json({ error: 'Invalid or missing date' }, { status: 400 })
  }

  await prisma.event.delete({ where: { date } })
  return NextResponse.json({ ok: true })
}

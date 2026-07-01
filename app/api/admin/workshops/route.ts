import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readWorkshops } from '@/lib/workshops'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value ?? ''
  return verifyToken(token)
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await readWorkshops())
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { title, date, time, venue, description, slots, price } =
    (body as Record<string, unknown>) ?? {}

  if (typeof title !== 'string' || !title.trim())
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })

  await prisma.workshop.create({
    data: {
      id: crypto.randomUUID(),
      title: title.trim().slice(0, 100),
      date,
      time: typeof time === 'string' ? time : '',
      venue: typeof venue === 'string' ? venue.trim().slice(0, 150) : '',
      description: typeof description === 'string' ? description.trim().slice(0, 500) : '',
      slots: typeof slots === 'number' ? Math.max(0, Math.floor(slots)) : 0,
      price: typeof price === 'string' ? price.trim().slice(0, 50) : '',
    },
  })
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, title, date, time, venue, description, slots, price } =
    (body as Record<string, unknown>) ?? {}

  if (typeof id !== 'string' || !id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })
  if (typeof title !== 'string' || !title.trim())
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  const existing = await prisma.workshop.findUnique({ where: { id } })
  if (!existing) return NextResponse.json({ error: 'Workshop not found' }, { status: 404 })

  await prisma.workshop.update({
    where: { id },
    data: {
      title: title.trim().slice(0, 100),
      date: typeof date === 'string' ? date : existing.date,
      time: typeof time === 'string' ? time : '',
      venue: typeof venue === 'string' ? venue.trim().slice(0, 150) : '',
      description: typeof description === 'string' ? description.trim().slice(0, 500) : '',
      slots: typeof slots === 'number' ? Math.max(0, Math.floor(slots)) : 0,
      price: typeof price === 'string' ? price.trim().slice(0, 50) : '',
    },
  })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id } = (body as Record<string, unknown>) ?? {}
  if (typeof id !== 'string' || !id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  await prisma.workshop.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


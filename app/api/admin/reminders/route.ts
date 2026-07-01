import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readReminders } from '@/lib/reminders'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value ?? ''
  return verifyToken(token)
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await readReminders())
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { studentName, email, phone, amount, dueDate } =
    (body as Record<string, unknown>) ?? {}

  if (typeof studentName !== 'string' || !studentName.trim())
    return NextResponse.json({ error: 'Student name is required' }, { status: 400 })
  if (typeof dueDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate))
    return NextResponse.json({ error: 'Invalid due date' }, { status: 400 })

  await prisma.studentReminder.create({
    data: {
      id: crypto.randomUUID(),
      studentName: studentName.trim().slice(0, 100),
      email: typeof email === 'string' ? email.trim().slice(0, 150) : '',
      phone: typeof phone === 'string' ? phone.trim().slice(0, 20) : '',
      amount: typeof amount === 'number' ? Math.max(0, amount) : 0,
      dueDate,
      paid: false,
    },
  })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, paid, lastReminded } = (body as Record<string, unknown>) ?? {}
  if (typeof id !== 'string' || !id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {}
  if (typeof paid === 'boolean') data.paid = paid
  if (typeof lastReminded === 'string') data.lastReminded = lastReminded

  await prisma.studentReminder.update({ where: { id }, data })
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

  await prisma.studentReminder.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

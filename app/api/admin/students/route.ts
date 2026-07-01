import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import {
  readStudents,
  readStudentById,
  hashPassword,
  generateSalt,
  type Student,
} from '@/lib/students'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value ?? ''
  return verifyToken(token)
}

function safeStudent(s: Student) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _h, passwordSalt: _s, ...rest } = s
  return rest
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json((await readStudents()).map(safeStudent))
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, phone, loginPhone, password } = (body as Record<string, unknown>) ?? {}

  if (typeof name !== 'string' || !name.trim())
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (typeof loginPhone !== 'string' || !loginPhone.trim())
    return NextResponse.json({ error: 'Login phone is required' }, { status: 400 })
  if (typeof password !== 'string' || password.length < 4)
    return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })

  const existing = await prisma.student.findUnique({ where: { loginPhone: loginPhone.trim() } })
  if (existing)
    return NextResponse.json({ error: 'Login phone already in use' }, { status: 409 })

  const salt = generateSalt()
  await prisma.student.create({
    data: {
      id: crypto.randomUUID(),
      name: name.trim().slice(0, 100),
      phone: typeof phone === 'string' ? phone.trim().slice(0, 20) : '',
      loginPhone: loginPhone.trim().slice(0, 20),
      passwordHash: hashPassword(password, salt),
      passwordSalt: salt,
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

  const { id, name, phone, loginPhone, newPassword } = (body as Record<string, unknown>) ?? {}

  if (typeof id !== 'string' || !id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  const student = await prisma.student.findUnique({ where: { id } })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  if (typeof loginPhone === 'string' && loginPhone.trim() !== student.loginPhone) {
    const dup = await prisma.student.findUnique({ where: { loginPhone: loginPhone.trim() } })
    if (dup) return NextResponse.json({ error: 'Login phone already in use' }, { status: 409 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: Record<string, any> = {}
  if (typeof name === 'string' && name.trim()) data.name = name.trim().slice(0, 100)
  if (typeof phone === 'string') data.phone = phone.trim().slice(0, 20)
  if (typeof loginPhone === 'string' && loginPhone.trim())
    data.loginPhone = loginPhone.trim().slice(0, 20)
  if (typeof newPassword === 'string' && newPassword.length >= 4) {
    const salt = generateSalt()
    data.passwordSalt = salt
    data.passwordHash = hashPassword(newPassword, salt)
  }

  await prisma.student.update({ where: { id }, data })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const { action, studentId } = b

  if (typeof studentId !== 'string' || !studentId)
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 })

  const student = await readStudentById(studentId)
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  switch (action) {
    case 'addPayment': {
      const { amount, description, date, status } = b
      if (typeof amount !== 'number')
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      await prisma.payment.create({
        data: {
          id: crypto.randomUUID(),
          studentId,
          amount: Math.max(0, amount),
          description: typeof description === 'string' ? description.trim().slice(0, 200) : '',
          date: typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? date
            : new Date().toISOString().split('T')[0],
          status: status === 'pending' ? 'pending' : 'paid',
        },
      })
      break
    }
    case 'deletePayment': {
      const { paymentId } = b
      if (typeof paymentId !== 'string')
        return NextResponse.json({ error: 'paymentId required' }, { status: 400 })
      await prisma.payment.delete({ where: { id: paymentId } })
      break
    }
    case 'addSubmission': {
      const { title, notes, date } = b
      if (typeof title !== 'string' || !title.trim())
        return NextResponse.json({ error: 'Title required' }, { status: 400 })
      await prisma.submission.create({
        data: {
          id: crypto.randomUUID(),
          studentId,
          title: title.trim().slice(0, 150),
          notes: typeof notes === 'string' ? notes.trim().slice(0, 1000) : '',
          date: typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
            ? date
            : new Date().toISOString().split('T')[0],
        },
      })
      break
    }
    case 'deleteSubmission': {
      const { submissionId } = b
      if (typeof submissionId !== 'string')
        return NextResponse.json({ error: 'submissionId required' }, { status: 400 })
      await prisma.submission.delete({ where: { id: submissionId } })
      break
    }
    case 'toggleVideo': {
      const { videoId } = b
      if (typeof videoId !== 'string')
        return NextResponse.json({ error: 'videoId required' }, { status: 400 })
      const existing = await prisma.studentContent.findUnique({
        where: { studentId_contentId: { studentId, contentId: videoId } },
      })
      if (existing) {
        await prisma.studentContent.delete({
          where: { studentId_contentId: { studentId, contentId: videoId } },
        })
      } else {
        await prisma.studentContent.create({ data: { studentId, contentId: videoId } })
      }
      break
    }
    case 'setEligibleWorkshops': {
      const { workshopIds } = b
      if (!Array.isArray(workshopIds))
        return NextResponse.json({ error: 'workshopIds must be array' }, { status: 400 })
      const ids = (workshopIds as unknown[]).filter((id): id is string => typeof id === 'string')
      await prisma.studentWorkshop.deleteMany({ where: { studentId, type: 'eligible' } })
      if (ids.length > 0) {
        await prisma.studentWorkshop.createMany({
          data: ids.map(workshopId => ({ studentId, workshopId, type: 'eligible' })),
        })
      }
      break
    }
    case 'setOtherWorkshops': {
      const { workshopIds } = b
      if (!Array.isArray(workshopIds))
        return NextResponse.json({ error: 'workshopIds must be array' }, { status: 400 })
      const ids = (workshopIds as unknown[]).filter((id): id is string => typeof id === 'string')
      await prisma.studentWorkshop.deleteMany({ where: { studentId, type: 'other' } })
      if (ids.length > 0) {
        await prisma.studentWorkshop.createMany({
          data: ids.map(workshopId => ({ studentId, workshopId, type: 'other' })),
        })
      }
      break
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

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

  await prisma.student.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}


async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value ?? ''
  return verifyToken(token)
}

function safeStudent(s: Student) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _h, passwordSalt: _s, ...rest } = s
  return rest
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(readStudents().map(safeStudent))
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { name, phone, loginPhone, password } = (body as Record<string, unknown>) ?? {}

  if (typeof name !== 'string' || !name.trim())
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  if (typeof loginPhone !== 'string' || !loginPhone.trim())
    return NextResponse.json({ error: 'Login phone is required' }, { status: 400 })
  if (typeof password !== 'string' || password.length < 4)
    return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 })

  const students = readStudents()
  if (students.some(s => s.loginPhone === loginPhone.trim()))
    return NextResponse.json({ error: 'Login phone already in use' }, { status: 409 })

  const salt = generateSalt()
  students.push({
    id: crypto.randomUUID(),
    name: name.trim().slice(0, 100),
    phone: typeof phone === 'string' ? phone.trim().slice(0, 20) : '',
    loginPhone: loginPhone.trim().slice(0, 20),
    passwordHash: hashPassword(password, salt),
    passwordSalt: salt,
    submissions: [],
    paymentHistory: [],
    assignedVideoIds: [],
    eligibleWorkshopIds: [],
    otherWorkshopIds: [],
  })
  writeStudents(students)
  return NextResponse.json({ ok: true })
}

export async function PUT(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { id, name, phone, loginPhone, newPassword } = (body as Record<string, unknown>) ?? {}

  if (typeof id !== 'string' || !id)
    return NextResponse.json({ error: 'ID is required' }, { status: 400 })

  const students = readStudents()
  const idx = students.findIndex(s => s.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  if (typeof loginPhone === 'string' && loginPhone.trim() !== students[idx].loginPhone) {
    if (students.some((s, i) => i !== idx && s.loginPhone === loginPhone.trim()))
      return NextResponse.json({ error: 'Login phone already in use' }, { status: 409 })
  }

  if (typeof name === 'string' && name.trim()) students[idx].name = name.trim().slice(0, 100)
  if (typeof phone === 'string') students[idx].phone = phone.trim().slice(0, 20)
  if (typeof loginPhone === 'string' && loginPhone.trim())
    students[idx].loginPhone = loginPhone.trim().slice(0, 20)
  if (typeof newPassword === 'string' && newPassword.length >= 4) {
    const salt = generateSalt()
    students[idx].passwordSalt = salt
    students[idx].passwordHash = hashPassword(newPassword, salt)
  }

  writeStudents(students)
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const b = body as Record<string, unknown>
  const { action, studentId } = b

  if (typeof studentId !== 'string' || !studentId)
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 })

  const students = readStudents()
  const idx = students.findIndex(s => s.id === studentId)
  if (idx === -1) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  switch (action) {
    case 'addPayment': {
      const { amount, description, date, status } = b
      if (typeof amount !== 'number')
        return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
      const payment: Payment = {
        id: crypto.randomUUID(),
        amount: Math.max(0, amount),
        description: typeof description === 'string' ? description.trim().slice(0, 200) : '',
        date: typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
          ? date
          : new Date().toISOString().split('T')[0],
        status: status === 'pending' ? 'pending' : 'paid',
      }
      students[idx].paymentHistory.push(payment)
      break
    }
    case 'deletePayment': {
      const { paymentId } = b
      if (typeof paymentId !== 'string')
        return NextResponse.json({ error: 'paymentId required' }, { status: 400 })
      students[idx].paymentHistory = students[idx].paymentHistory.filter(p => p.id !== paymentId)
      break
    }
    case 'addSubmission': {
      const { title, notes, date } = b
      if (typeof title !== 'string' || !title.trim())
        return NextResponse.json({ error: 'Title required' }, { status: 400 })
      const submission: Submission = {
        id: crypto.randomUUID(),
        title: title.trim().slice(0, 150),
        notes: typeof notes === 'string' ? notes.trim().slice(0, 1000) : '',
        date: typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
          ? date
          : new Date().toISOString().split('T')[0],
      }
      students[idx].submissions.push(submission)
      break
    }
    case 'deleteSubmission': {
      const { submissionId } = b
      if (typeof submissionId !== 'string')
        return NextResponse.json({ error: 'submissionId required' }, { status: 400 })
      students[idx].submissions = students[idx].submissions.filter(s => s.id !== submissionId)
      break
    }
    case 'toggleVideo': {
      const { videoId } = b
      if (typeof videoId !== 'string')
        return NextResponse.json({ error: 'videoId required' }, { status: 400 })
      const has = students[idx].assignedVideoIds.includes(videoId)
      students[idx].assignedVideoIds = has
        ? students[idx].assignedVideoIds.filter(v => v !== videoId)
        : [...students[idx].assignedVideoIds, videoId]
      break
    }
    case 'setEligibleWorkshops': {
      const { workshopIds } = b
      if (!Array.isArray(workshopIds))
        return NextResponse.json({ error: 'workshopIds must be array' }, { status: 400 })
      students[idx].eligibleWorkshopIds = (workshopIds as unknown[]).filter(
        (id): id is string => typeof id === 'string',
      )
      break
    }
    case 'setOtherWorkshops': {
      const { workshopIds } = b
      if (!Array.isArray(workshopIds))
        return NextResponse.json({ error: 'workshopIds must be array' }, { status: 400 })
      students[idx].otherWorkshopIds = (workshopIds as unknown[]).filter(
        (id): id is string => typeof id === 'string',
      )
      break
    }
    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  writeStudents(students)
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

  writeStudents(readStudents().filter((s: Student) => s.id !== id))
  return NextResponse.json({ ok: true })
}

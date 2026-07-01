import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export interface Submission {
  id: string
  title: string
  notes: string
  date: string
}

export interface Payment {
  id: string
  amount: number
  description: string
  date: string
  status: 'paid' | 'pending'
}

export interface Student {
  id: string
  name: string
  phone: string
  loginPhone: string
  passwordHash: string
  passwordSalt: string
  submissions: Submission[]
  paymentHistory: Payment[]
  assignedVideoIds: string[]
  eligibleWorkshopIds: string[]
  otherWorkshopIds: string[]
}

const includeAll = {
  submissions: true,
  payments: true,
  assignedVideos: { select: { contentId: true } },
  workshops: { select: { workshopId: true, type: true } },
} as const

function dbReady(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgresql') && !url.includes('ep-xxxx')
}

function readStudentsFile(): Student[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'students.json'), 'utf-8')
    return JSON.parse(raw) as Student[]
  } catch { return [] }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStudent(s: any): Student {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone,
    loginPhone: s.loginPhone,
    passwordHash: s.passwordHash,
    passwordSalt: s.passwordSalt,
    submissions: s.submissions.map((sub: { id: string; title: string; notes: string; date: string }) => ({
      id: sub.id,
      title: sub.title,
      notes: sub.notes,
      date: sub.date,
    })),
    paymentHistory: s.payments.map((p: { id: string; amount: number; description: string; date: string; status: string }) => ({
      id: p.id,
      amount: p.amount,
      description: p.description,
      date: p.date,
      status: p.status as 'paid' | 'pending',
    })),
    assignedVideoIds: s.assignedVideos.map((v: { contentId: string }) => v.contentId),
    eligibleWorkshopIds: s.workshops
      .filter((w: { workshopId: string; type: string }) => w.type === 'eligible')
      .map((w: { workshopId: string; type: string }) => w.workshopId),
    otherWorkshopIds: s.workshops
      .filter((w: { workshopId: string; type: string }) => w.type === 'other')
      .map((w: { workshopId: string; type: string }) => w.workshopId),
  }
}

export async function readStudents(): Promise<Student[]> {
  if (!dbReady()) return readStudentsFile()
  try {
    const students = await prisma.student.findMany({ include: includeAll })
    return students.map(mapStudent)
  } catch { return readStudentsFile() }
}

export async function readStudentById(id: string): Promise<Student | null> {
  if (!dbReady()) return readStudentsFile().find(s => s.id === id) ?? null
  try {
    const s = await prisma.student.findUnique({ where: { id }, include: includeAll })
    return s ? mapStudent(s) : null
  } catch { return readStudentsFile().find(s => s.id === id) ?? null }
}

export async function readStudentByLoginPhone(loginPhone: string): Promise<Student | null> {
  if (!dbReady()) return readStudentsFile().find(s => s.loginPhone === loginPhone) ?? null
  try {
    const s = await prisma.student.findUnique({ where: { loginPhone }, include: includeAll })
    return s ? mapStudent(s) : null
  } catch { return readStudentsFile().find(s => s.loginPhone === loginPhone) ?? null }
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100_000, 64, 'sha512').toString('hex')
}

export function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = hashPassword(password, salt)
  try {
    const a = Buffer.from(computed, 'hex')
    const b = Buffer.from(hash, 'hex')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

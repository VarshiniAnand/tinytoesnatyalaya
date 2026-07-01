import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export interface StudentReminder {
  id: string
  studentName: string
  email: string
  phone: string
  amount: number
  dueDate: string
  paid: boolean
  lastReminded?: string
}

function dbReady(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgresql') && !url.includes('ep-xxxx')
}

function readRemindersFile(): StudentReminder[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'reminders.json'), 'utf-8')
    return JSON.parse(raw) as StudentReminder[]
  } catch { return [] }
}

export async function readReminders(): Promise<StudentReminder[]> {
  if (!dbReady()) return readRemindersFile()
  try {
    const rows = await prisma.studentReminder.findMany({ orderBy: { dueDate: 'asc' } })
    return rows.map(r => ({ ...r, lastReminded: r.lastReminded ?? undefined }))
  } catch { return readRemindersFile() }
}

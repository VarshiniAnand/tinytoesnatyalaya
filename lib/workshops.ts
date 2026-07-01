import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export interface Workshop {
  id: string
  title: string
  date: string
  time: string
  venue: string
  description: string
  slots: number
  price: string
}

function dbReady(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgresql') && !url.includes('ep-xxxx')
}

function readWorkshopsFile(): Workshop[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'workshops.json'), 'utf-8')
    return JSON.parse(raw) as Workshop[]
  } catch { return [] }
}

export async function readWorkshops(): Promise<Workshop[]> {
  if (!dbReady()) return readWorkshopsFile()
  try {
    return await prisma.workshop.findMany({ orderBy: { date: 'asc' } })
  } catch { return readWorkshopsFile() }
}

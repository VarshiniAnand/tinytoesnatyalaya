import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { DEFAULT_EVENTS } from '@/types/events'

export type { EventMap } from '@/types/events'
import type { EventMap } from '@/types/events'

function dbReady(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgresql') && !url.includes('ep-xxxx')
}

function readEventsFile(): EventMap {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'events.json'), 'utf-8')
    return JSON.parse(raw) as EventMap
  } catch { return { ...DEFAULT_EVENTS } }
}

export async function readEvents(): Promise<EventMap> {
  if (!dbReady()) return readEventsFile()
  try {
    const rows = await prisma.event.findMany()
    if (rows.length === 0) return { ...DEFAULT_EVENTS }
    const map: EventMap = {}
    for (const e of rows) {
      map[e.date] = { name: e.name, ...(e.moveable ? { moveable: true as const } : {}) }
    }
    return map
  } catch { return readEventsFile() }
}

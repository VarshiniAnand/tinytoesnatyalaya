import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export interface ContentItem {
  id: string
  title: string
  tab: string
  type: string
  videoType: 'youtube' | 'instagram'
  url: string
  embedId: string
  description: string
  createdAt: string
}

function dbReady(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgresql') && !url.includes('ep-xxxx')
}

function readContentFile(): ContentItem[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'content.json'), 'utf-8')
    return JSON.parse(raw) as ContentItem[]
  } catch { return [] }
}

export async function readContent(): Promise<ContentItem[]> {
  if (!dbReady()) return readContentFile()
  try {
    const items = await prisma.contentItem.findMany({ orderBy: { createdAt: 'desc' } })
    return items.map(item => ({
      ...item,
      tab: item.tab,
      type: item.type,
      videoType: item.videoType as 'youtube' | 'instagram',
      createdAt: item.createdAt.toISOString(),
    }))
  } catch { return readContentFile() }
}


import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export interface GalleryItem {
  id: string
  type: 'youtube' | 'instagram'
  url: string
  embedId: string
  title: string
}

function dbReady(): boolean {
  const url = process.env.DATABASE_URL ?? ''
  return url.startsWith('postgresql') && !url.includes('ep-xxxx')
}

function readGalleryFile(): GalleryItem[] {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'gallery.json'), 'utf-8')
    return JSON.parse(raw) as GalleryItem[]
  } catch { return [] }
}

export async function readGallery(): Promise<GalleryItem[]> {
  if (!dbReady()) return readGalleryFile()
  try {
    const items = await prisma.galleryItem.findMany()
    return items.map(item => ({ ...item, type: item.type as 'youtube' | 'instagram' }))
  } catch { return readGalleryFile() }
}

export function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  return m ? m[1] : null
}

export function extractInstagramId(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/)
  return m ? m[1] : null
}


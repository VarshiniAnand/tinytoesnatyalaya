import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readGallery, extractYouTubeId, extractInstagramId } from '@/lib/gallery'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value ?? ''
  return verifyToken(token)
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await readGallery())
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { type, url, title } = (body as Record<string, unknown>) ?? {}

  if (type !== 'youtube' && type !== 'instagram')
    return NextResponse.json({ error: 'Type must be youtube or instagram' }, { status: 400 })
  if (typeof url !== 'string' || !url.trim())
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  if (typeof title !== 'string' || !title.trim())
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })

  let embedId = ''
  if (type === 'youtube') {
    const id = extractYouTubeId(url)
    if (!id)
      return NextResponse.json(
        { error: 'Could not extract YouTube video ID. Use a standard youtube.com or youtu.be URL.' },
        { status: 400 },
      )
    embedId = id
  } else {
    embedId = extractInstagramId(url) ?? ''
  }

  await prisma.galleryItem.create({
    data: {
      id: crypto.randomUUID(),
      type,
      url: url.trim(),
      embedId,
      title: title.trim().slice(0, 100),
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

  await prisma.galleryItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

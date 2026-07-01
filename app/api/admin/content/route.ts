import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { readContent } from '@/lib/content'
import { extractYouTubeId, extractInstagramId } from '@/lib/gallery'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

async function requireAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get('admin_session')?.value ?? ''
  return verifyToken(token)
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await readContent())
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { title, type, videoType, url, description } = (body as Record<string, unknown>) ?? {}

  if (typeof title !== 'string' || !title.trim())
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  if (type !== 'self-paced' && type !== 'class-ref')
    return NextResponse.json({ error: 'Type must be self-paced or class-ref' }, { status: 400 })
  if (videoType !== 'youtube' && videoType !== 'instagram')
    return NextResponse.json({ error: 'Video type must be youtube or instagram' }, { status: 400 })
  if (typeof url !== 'string' || !url.trim())
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })

  let embedId = ''
  if (videoType === 'youtube') {
    const id = extractYouTubeId(url)
    if (!id) return NextResponse.json(
      { error: 'Could not extract YouTube video ID. Use a standard youtube.com or youtu.be URL.' },
      { status: 400 },
    )
    embedId = id
  } else {
    embedId = extractInstagramId(url) ?? ''
  }

  await prisma.contentItem.create({
    data: {
      id: crypto.randomUUID(),
      title: title.trim().slice(0, 100),
      type,
      videoType,
      url: url.trim(),
      embedId,
      description: typeof description === 'string' ? description.trim().slice(0, 300) : '',
    },
  })
  return NextResponse.json({ ok: true })
}

/** Toggle a content item assignment for a student. Body: { contentId, studentId } */
export async function PATCH(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { contentId, studentId } = (body as Record<string, unknown>) ?? {}
  if (typeof contentId !== 'string' || !contentId)
    return NextResponse.json({ error: 'contentId is required' }, { status: 400 })
  if (typeof studentId !== 'string' || !studentId)
    return NextResponse.json({ error: 'studentId is required' }, { status: 400 })

  const student = await prisma.student.findUnique({ where: { id: studentId } })
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  const existing = await prisma.studentContent.findUnique({
    where: { studentId_contentId: { studentId, contentId } },
  })
  if (existing) {
    await prisma.studentContent.delete({
      where: { studentId_contentId: { studentId, contentId } },
    })
  } else {
    await prisma.studentContent.create({ data: { studentId, contentId } })
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

  // onDelete: Cascade on StudentContent handles the assignment cleanup
  await prisma.contentItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

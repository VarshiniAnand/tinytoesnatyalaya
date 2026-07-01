/**
 * Prisma seed script — run once after `prisma migrate deploy`.
 * Reads existing JSON data files and populates the database.
 * Safe to run multiple times (uses upsert / skipDuplicates).
 *
 * Usage:  npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
 *    or:  npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { DEFAULT_EVENTS } from '../types/events'

const prisma = new PrismaClient()

function readJson<T>(filename: string): T | null {
  const file = path.join(process.cwd(), 'data', filename)
  if (!fs.existsSync(file)) return null
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8')) as T
  } catch {
    return null
  }
}

async function main() {
  console.log('🌱 Seeding database from JSON files...')

  // ── Gallery ──────────────────────────────────────────────────────────────
  const gallery = readJson<{id:string;type:string;url:string;embedId:string;title:string}[]>('gallery.json')
  if (gallery?.length) {
    await prisma.galleryItem.createMany({ data: gallery, skipDuplicates: true })
    console.log(`  ✓ Gallery: ${gallery.length} items`)
  }

  // ── Workshops ─────────────────────────────────────────────────────────────
  const workshops = readJson<{id:string;title:string;date:string;time:string;venue:string;description:string;slots:number;price:string}[]>('workshops.json')
  if (workshops?.length) {
    await prisma.workshop.createMany({ data: workshops, skipDuplicates: true })
    console.log(`  ✓ Workshops: ${workshops.length} items`)
  }

  // ── Reminders ─────────────────────────────────────────────────────────────
  const reminders = readJson<{id:string;studentName:string;email:string;phone:string;amount:number;dueDate:string;paid:boolean;lastReminded?:string}[]>('reminders.json')
  if (reminders?.length) {
    await prisma.studentReminder.createMany({ data: reminders, skipDuplicates: true })
    console.log(`  ✓ Reminders: ${reminders.length} items`)
  }

  // ── Events ────────────────────────────────────────────────────────────────
  const eventsJson = readJson<Record<string, {name:string;moveable?:true}>>('events.json')
  const eventsSource = eventsJson ?? DEFAULT_EVENTS
  const eventRows = Object.entries(eventsSource).map(([date, { name, moveable }]) => ({
    id: date, // use date as stable id for upsert
    date,
    name,
    moveable: moveable === true,
  }))
  for (const row of eventRows) {
    await prisma.event.upsert({
      where: { date: row.date },
      update: { name: row.name, moveable: row.moveable },
      create: row,
    })
  }
  console.log(`  ✓ Events: ${eventRows.length} items`)

  // ── Content library ───────────────────────────────────────────────────────
  const content = readJson<{id:string;title:string;type:string;videoType:string;url:string;embedId:string;description:string;createdAt:string}[]>('content.json')
  if (content?.length) {
    await prisma.contentItem.createMany({
      data: content.map(c => ({ ...c, createdAt: new Date(c.createdAt) })),
      skipDuplicates: true,
    })
    console.log(`  ✓ Content: ${content.length} items`)
  }

  // ── Students ──────────────────────────────────────────────────────────────
  const students = readJson<{
    id: string
    name: string
    phone: string
    loginPhone: string
    passwordHash: string
    passwordSalt: string
    submissions: {id:string;title:string;notes:string;date:string}[]
    paymentHistory: {id:string;amount:number;description:string;date:string;status:string}[]
    assignedVideoIds: string[]
    eligibleWorkshopIds: string[]
    otherWorkshopIds: string[]
  }[]>('students.json')

  if (students?.length) {
    for (const s of students) {
      await prisma.student.upsert({
        where: { id: s.id },
        update: {},
        create: {
          id: s.id,
          name: s.name,
          phone: s.phone ?? '',
          loginPhone: s.loginPhone,
          passwordHash: s.passwordHash,
          passwordSalt: s.passwordSalt,
        },
      })

      // submissions
      if (s.submissions?.length) {
        await prisma.submission.createMany({
          data: s.submissions.map(sub => ({ ...sub, studentId: s.id })),
          skipDuplicates: true,
        })
      }

      // payments
      if (s.paymentHistory?.length) {
        await prisma.payment.createMany({
          data: s.paymentHistory.map(p => ({ ...p, studentId: s.id })),
          skipDuplicates: true,
        })
      }

      // assigned videos (only if content was seeded)
      if (s.assignedVideoIds?.length && content?.length) {
        const validIds = s.assignedVideoIds.filter(vid =>
          content.some(c => c.id === vid),
        )
        for (const contentId of validIds) {
          await prisma.studentContent.upsert({
            where: { studentId_contentId: { studentId: s.id, contentId } },
            update: {},
            create: { studentId: s.id, contentId },
          })
        }
      }

      // workshop assignments
      if (workshops?.length) {
        const eligible = (s.eligibleWorkshopIds ?? []).filter(wid =>
          workshops.some(w => w.id === wid),
        )
        const other = (s.otherWorkshopIds ?? []).filter(wid =>
          workshops.some(w => w.id === wid),
        )
        for (const workshopId of eligible) {
          await prisma.studentWorkshop.upsert({
            where: { studentId_workshopId_type: { studentId: s.id, workshopId, type: 'eligible' } },
            update: {},
            create: { studentId: s.id, workshopId, type: 'eligible' },
          })
        }
        for (const workshopId of other) {
          await prisma.studentWorkshop.upsert({
            where: { studentId_workshopId_type: { studentId: s.id, workshopId, type: 'other' } },
            update: {},
            create: { studentId: s.id, workshopId, type: 'other' },
          })
        }
      }
    }
    console.log(`  ✓ Students: ${students.length} items`)
  }

  console.log('✅ Seeding complete.')
}

main()
  .catch(e => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

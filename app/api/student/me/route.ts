import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyStudentToken } from '@/lib/auth'
import { readStudentById } from '@/lib/students'
import { readContent } from '@/lib/content'
import { readWorkshops } from '@/lib/workshops'

export async function GET() {
  const store = await cookies()
  const token = store.get('student_session')?.value ?? ''
  const studentId = verifyStudentToken(token)
  if (!studentId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [student, allContent, allWorkshops] = await Promise.all([
    readStudentById(studentId),
    readContent(),
    readWorkshops(),
  ])
  if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

  return NextResponse.json({
    id: student.id,
    name: student.name,
    phone: student.phone,
    loginPhone: student.loginPhone,
    submissions: student.submissions,
    paymentHistory: student.paymentHistory,
    assignedVideos: allContent.filter(c => student.assignedVideoIds.includes(c.id)),
    eligibleWorkshops: allWorkshops.filter(w => student.eligibleWorkshopIds.includes(w.id)),
    otherWorkshops: allWorkshops.filter(w => student.otherWorkshopIds.includes(w.id)),
  })
}

'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

type Tab = 'workshops' | 'reminders' | 'gallery' | 'students' | 'content'
type StudentSubTab = 'profile' | 'payments' | 'submissions' | 'learning' | 'workshops'

interface Workshop {
  id: string
  title: string
  date: string
  time: string
  venue: string
  description: string
  slots: number
  price: string
}

interface StudentReminder {
  id: string
  studentName: string
  email: string
  phone: string
  amount: number
  dueDate: string
  paid: boolean
  lastReminded?: string
}

interface GalleryItem {
  id: string
  type: 'youtube' | 'instagram'
  url: string
  embedId: string
  title: string
}

interface Payment {
  id: string
  amount: number
  description: string
  date: string
  status: 'paid' | 'pending'
}

interface Submission {
  id: string
  title: string
  notes: string
  date: string
}

interface StudentRecord {
  id: string
  name: string
  phone: string
  loginPhone: string
  submissions: Submission[]
  paymentHistory: Payment[]
  assignedVideoIds: string[]
  eligibleWorkshopIds: string[]
  otherWorkshopIds: string[]
}

interface ContentItem {
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

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function categoryLabel(type: string): string {
  if (type === 'self-paced') return 'Self-Paced Learning'
  if (type === 'class-ref') return 'Class Reference'
  return type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

const inputCls =
  'w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white/80'
const editInputCls =
  'w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 bg-white'
const labelCls = 'block text-xs text-stone-500 mb-1'
const primaryBtn =
  'bg-[#800000] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition disabled:opacity-60'

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('workshops')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  // ── Workshops ──────────────────────────────────────────────────
  const [workshops, setWorkshops] = useState<Workshop[]>([])
  const [loadingWS, setLoadingWS] = useState(true)
  const [editingWS, setEditingWS] = useState<Workshop | null>(null)
  const [wsTitle, setWsTitle] = useState('')
  const [wsDate, setWsDate] = useState('')
  const [wsTime, setWsTime] = useState('')
  const [wsVenue, setWsVenue] = useState('')
  const [wsDesc, setWsDesc] = useState('')
  const [wsSlots, setWsSlots] = useState('')
  const [wsPrice, setWsPrice] = useState('')

  // ── Reminders ──────────────────────────────────────────────────
  const [reminders, setReminders] = useState<StudentReminder[]>([])
  const [loadingRM, setLoadingRM] = useState(true)
  const [rmName, setRmName] = useState('')
  const [rmEmail, setRmEmail] = useState('')
  const [rmPhone, setRmPhone] = useState('')
  const [rmAmount, setRmAmount] = useState('')
  const [rmDueDate, setRmDueDate] = useState('')

  // ── Gallery ────────────────────────────────────────────────────
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [loadingGL, setLoadingGL] = useState(true)
  const [glType, setGlType] = useState<'youtube' | 'instagram'>('youtube')
  const [glUrl, setGlUrl] = useState('')
  const [glTitle, setGlTitle] = useState('')

  // ── Students ──────────────────────────────────────────────────
  const [students, setStudents] = useState<StudentRecord[]>([])
  const [loadingST, setLoadingST] = useState(true)
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null)
  const [studentSubTab, setStudentSubTab] = useState<StudentSubTab>('profile')
  const [stName, setStName] = useState('')
  const [stPhone, setStPhone] = useState('')
  const [stLoginPhone, setStLoginPhone] = useState('')
  const [stPassword, setStPassword] = useState('')
  const [editingST, setEditingST] = useState<{ name: string; phone: string; loginPhone: string; newPassword: string } | null>(null)
  const [pmAmount, setPmAmount] = useState('')
  const [pmDesc, setPmDesc] = useState('')
  const [pmDate, setPmDate] = useState(new Date().toISOString().split('T')[0])
  const [pmStatus, setPmStatus] = useState<'paid' | 'pending'>('paid')
  const [subTitle, setSubTitle] = useState('')
  const [subNotes, setSubNotes] = useState('')
  const [subDate, setSubDate] = useState(new Date().toISOString().split('T')[0])

  // ── Content Library ────────────────────────────────────────────
  const [content, setContent] = useState<ContentItem[]>([])
  const [loadingCT, setLoadingCT] = useState(true)
  const [ctTitle, setCtTitle] = useState('')
  const [ctTab, setCtTab] = useState<string>('Learning')
  const [ctIsNewTab, setCtIsNewTab] = useState(false)
  const [ctNewTab, setCtNewTab] = useState('')
  const [ctType, setCtType] = useState<string>('self-paced')
  const [ctVideoType, setCtVideoType] = useState<'youtube' | 'instagram'>('youtube')
  const [ctUrl, setCtUrl] = useState('')
  const [ctDesc, setCtDesc] = useState('')
  const [ctIsNewCategory, setCtIsNewCategory] = useState(false)
  const [ctNewCategory, setCtNewCategory] = useState('')
  const [assigningItem, setAssigningItem] = useState<ContentItem | null>(null)

  useEffect(() => {
    void loadWorkshops()
    void loadReminders()
    void loadGallery()
    void loadStudents()
    void loadContent()
  }, [])

  function flash(msg: string) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  // ── Workshop helpers ───────────────────────────────────────────
  async function loadWorkshops() {
    setLoadingWS(true)
    try {
      const res = await fetch('/api/admin/workshops')
      if (res.status === 401) { router.push('/admin/login'); return }
      if (!res.ok) throw new Error()
      setWorkshops((await res.json()) as Workshop[])
    } catch {
      setError('Failed to load workshops.')
    } finally {
      setLoadingWS(false)
    }
  }

  async function handleAddWorkshop(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/workshops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: wsTitle.trim(), date: wsDate, time: wsTime,
          venue: wsVenue.trim(), description: wsDesc.trim(),
          slots: parseInt(wsSlots) || 0, price: wsPrice.trim(),
        }),
      })
      if (!res.ok) throw new Error()
      setWsTitle(''); setWsDate(''); setWsTime(''); setWsVenue('')
      setWsDesc(''); setWsSlots(''); setWsPrice('')
      await loadWorkshops()
      flash('Workshop scheduled.')
    } catch {
      setError('Failed to add workshop.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEditWorkshop() {
    if (!editingWS) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/workshops', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingWS),
      })
      if (!res.ok) throw new Error()
      setEditingWS(null)
      await loadWorkshops()
      flash('Workshop updated.')
    } catch {
      setError('Failed to update workshop.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteWorkshop(id: string) {
    if (!confirm('Delete this workshop?')) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/workshops', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      await loadWorkshops()
      flash('Workshop deleted.')
    } catch {
      setError('Failed to delete workshop.')
    } finally {
      setSaving(false)
    }
  }

  // ── Reminder helpers ───────────────────────────────────────────
  async function loadReminders() {
    setLoadingRM(true)
    try {
      const res = await fetch('/api/admin/reminders')
      if (res.status === 401) { router.push('/admin/login'); return }
      if (!res.ok) throw new Error()
      setReminders((await res.json()) as StudentReminder[])
    } catch {
      setError('Failed to load reminders.')
    } finally {
      setLoadingRM(false)
    }
  }

  async function handleAddReminder(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: rmName.trim(), email: rmEmail.trim(),
          phone: rmPhone.trim(), amount: parseFloat(rmAmount) || 0,
          dueDate: rmDueDate,
        }),
      })
      if (!res.ok) throw new Error()
      setRmName(''); setRmEmail(''); setRmPhone(''); setRmAmount(''); setRmDueDate('')
      await loadReminders()
      flash('Student added.')
    } catch {
      setError('Failed to add student.')
    } finally {
      setSaving(false)
    }
  }

  async function togglePaid(id: string, paid: boolean) {
    setSaving(true)
    try {
      await fetch('/api/admin/reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, paid }),
      })
      await loadReminders()
    } catch {
      setError('Failed to update payment status.')
    } finally {
      setSaving(false)
    }
  }

  async function markReminderSent(id: string) {
    await fetch('/api/admin/reminders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, lastReminded: new Date().toISOString() }),
    })
    await loadReminders()
  }

  async function handleDeleteReminder(id: string) {
    if (!confirm('Remove this student?')) return
    setSaving(true)
    try {
      await fetch('/api/admin/reminders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await loadReminders()
      flash('Student removed.')
    } catch {
      setError('Failed to remove student.')
    } finally {
      setSaving(false)
    }
  }

  function sendWhatsAppReminder(r: StudentReminder) {
    const msg = encodeURIComponent(
      `Dear ${r.studentName}, this is a friendly reminder that your payment of ₹${r.amount} for TinyToes Natyalaya is due on ${formatDate(r.dueDate)}. Please make the payment at your earliest convenience. Thank you!`,
    )
    const phone = r.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank')
    void markReminderSent(r.id)
  }

  function sendEmailReminder(r: StudentReminder) {
    const subject = encodeURIComponent('Payment Reminder – TinyToes Natyalaya')
    const body = encodeURIComponent(
      `Dear ${r.studentName},\n\nThis is a friendly reminder that your payment of ₹${r.amount} for TinyToes Natyalaya is due on ${formatDate(r.dueDate)}.\n\nPlease make the payment at your earliest convenience.\n\nThank you,\nTinyToes Natyalaya`,
    )
    window.open(`mailto:${r.email}?subject=${subject}&body=${body}`, '_blank')
    void markReminderSent(r.id)
  }

  // ── Gallery helpers ────────────────────────────────────────────
  async function loadGallery() {
    setLoadingGL(true)
    try {
      const res = await fetch('/api/admin/gallery')
      if (res.status === 401) { router.push('/admin/login'); return }
      if (!res.ok) throw new Error()
      setGallery((await res.json()) as GalleryItem[])
    } catch {
      setError('Failed to load gallery.')
    } finally {
      setLoadingGL(false)
    }
  }

  async function handleAddGallery(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: glType, url: glUrl.trim(), title: glTitle.trim() }),
      })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        throw new Error(data.error ?? 'Failed to add video.')
      }
      setGlUrl(''); setGlTitle('')
      await loadGallery()
      flash('Video added to gallery.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add video.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteGallery(id: string) {
    if (!confirm('Remove this video from the gallery?')) return
    setSaving(true)
    try {
      await fetch('/api/admin/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      await loadGallery()
      flash('Video removed.')
    } catch {
      setError('Failed to remove video.')
    } finally {
      setSaving(false)
    }
  }

  // ── Student helpers ────────────────────────────────────────────
  async function loadStudents() {
    setLoadingST(true)
    try {
      const res = await fetch('/api/admin/students')
      if (res.status === 401) { router.push('/admin/login'); return }
      if (!res.ok) throw new Error()
      setStudents((await res.json()) as StudentRecord[])
    } catch {
      setError('Failed to load students.')
    } finally {
      setLoadingST(false)
    }
  }

  async function handleAddStudent(e: FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: stName.trim(), phone: stPhone.trim(), loginPhone: stLoginPhone.trim(), password: stPassword }),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        throw new Error(d.error ?? 'Failed to add student.')
      }
      setStName(''); setStPhone(''); setStLoginPhone(''); setStPassword('')
      await loadStudents()
      flash('Student added.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add student.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveEditStudent() {
    if (!editingST || !selectedStudent) return
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/students', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStudent.id,
          name: editingST.name, phone: editingST.phone, loginPhone: editingST.loginPhone,
          ...(editingST.newPassword ? { newPassword: editingST.newPassword } : {}),
        }),
      })
      if (!res.ok) {
        const d = (await res.json()) as { error?: string }
        throw new Error(d.error ?? 'Failed to update.')
      }
      setEditingST(null)
      const fresh = (await (await fetch('/api/admin/students')).json()) as StudentRecord[]
      setStudents(fresh)
      setSelectedStudent(fresh.find(s => s.id === selectedStudent.id) ?? null)
      flash('Student updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteStudent(id: string) {
    if (!confirm('Delete this student? This cannot be undone.')) return
    setSaving(true)
    try {
      await fetch('/api/admin/students', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (selectedStudent?.id === id) setSelectedStudent(null)
      await loadStudents()
      flash('Student deleted.')
    } catch { setError('Failed to delete student.') } finally { setSaving(false) }
  }

  async function studentPatch(body: Record<string, unknown>) {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/students', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = (await res.json()) as { error?: string }; throw new Error(d.error ?? 'Operation failed.') }
      const fresh = (await (await fetch('/api/admin/students')).json()) as StudentRecord[]
      setStudents(fresh)
      if (selectedStudent) setSelectedStudent(fresh.find(s => s.id === selectedStudent.id) ?? null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Operation failed.') } finally { setSaving(false) }
  }

  async function handleAddPayment(e: FormEvent) {
    e.preventDefault(); if (!selectedStudent) return
    await studentPatch({ action: 'addPayment', studentId: selectedStudent.id, amount: parseFloat(pmAmount) || 0, description: pmDesc.trim(), date: pmDate, status: pmStatus })
    setPmAmount(''); setPmDesc(''); setPmStatus('paid')
    flash('Payment added.')
  }

  async function handleAddSubmission(e: FormEvent) {
    e.preventDefault(); if (!selectedStudent) return
    await studentPatch({ action: 'addSubmission', studentId: selectedStudent.id, title: subTitle.trim(), notes: subNotes.trim(), date: subDate })
    setSubTitle(''); setSubNotes('')
    flash('Submission added.')
  }

  // ── Content helpers ────────────────────────────────────────────
  async function loadContent() {
    setLoadingCT(true)
    try {
      const res = await fetch('/api/admin/content')
      if (res.status === 401) { router.push('/admin/login'); return }
      if (!res.ok) throw new Error()
      setContent((await res.json()) as ContentItem[])
    } catch { setError('Failed to load content library.') } finally { setLoadingCT(false) }
  }

  async function handleAddContent(e: FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const tabToUse = ctIsNewTab ? ctNewTab.trim() : ctTab
    const typeToUse = ctIsNewCategory ? ctNewCategory.trim() : ctType
    if (!tabToUse) { setError('Tab name is required.'); setSaving(false); return }
    if (!typeToUse) { setError('Category name is required.'); setSaving(false); return }
    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: ctTitle.trim(), tab: tabToUse, type: typeToUse, videoType: ctVideoType, url: ctUrl.trim(), description: ctDesc.trim() }),
      })
      if (!res.ok) { const d = (await res.json()) as { error?: string }; throw new Error(d.error ?? 'Failed to add content.') }
      setCtTitle(''); setCtUrl(''); setCtDesc('')
      setCtIsNewTab(false); setCtNewTab(''); setCtTab(tabToUse)
      setCtIsNewCategory(false); setCtNewCategory(''); setCtType(typeToUse)
      await loadContent(); flash('Video added to content library.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed to add content.') } finally { setSaving(false) }
  }

  async function handleDeleteContent(id: string) {
    if (!confirm('Delete this video? It will be removed from all students.')) return
    setSaving(true)
    try {
      await fetch('/api/admin/content', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (assigningItem?.id === id) setAssigningItem(null)
      await loadContent(); await loadStudents(); flash('Video deleted.')
    } catch { setError('Failed to delete video.') } finally { setSaving(false) }
  }

  async function handleToggleContentStudent(contentId: string, studentId: string) {
    setSaving(true)
    try {
      await fetch('/api/admin/content', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contentId, studentId }) })
      await loadStudents(); flash('Assignment updated.')
    } catch { setError('Failed to update assignment.') } finally { setSaving(false) }
  }

  // ── Render ─────────────────────────────────────────────────────
  return (
    <main className="heritage-bg min-h-screen p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-maroon font-cinzel">TinyToes Admin</h1>
            <p className="text-stone-500 text-sm">Manage your dance academy</p>
          </div>
          <div className="flex gap-4 text-sm">
            <a href="/" className="text-stone-500 hover:text-maroon transition">← View Site</a>
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm">
            {success}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-stone-100/80 rounded-2xl p-1 overflow-x-auto">
          {(
            [
              { id: 'workshops' as Tab, label: 'Workshops' },
              { id: 'reminders' as Tab, label: 'Payments' },
              { id: 'gallery' as Tab, label: 'Gallery' },
              { id: 'students' as Tab, label: 'Students' },
              { id: 'content' as Tab, label: 'Content Library' },
            ]
          ).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 min-w-max py-2.5 px-3 text-sm font-semibold rounded-xl transition whitespace-nowrap ${
                tab === id ? 'bg-[#800000] text-white shadow' : 'text-stone-500 hover:text-maroon'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════ WORKSHOPS ══════════════ */}
        {tab === 'workshops' && (
          <div>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">
                Schedule New Workshop
              </h2>
              <form onSubmit={handleAddWorkshop} className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="flex-[2] min-w-[200px]">
                    <label className={labelCls}>Workshop Title</label>
                    <input
                      type="text" required maxLength={100}
                      value={wsTitle} onChange={(e) => setWsTitle(e.target.value)}
                      placeholder="e.g. Bharatanatyam Basics"
                      className={inputCls}
                    />
                  </div>
                  <div className="min-w-[160px]">
                    <label className={labelCls}>Date</label>
                    <input
                      type="date" required
                      value={wsDate} onChange={(e) => setWsDate(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="min-w-[130px]">
                    <label className={labelCls}>Time</label>
                    <input
                      type="time"
                      value={wsTime} onChange={(e) => setWsTime(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex-[2] min-w-[200px]">
                    <label className={labelCls}>Venue</label>
                    <input
                      type="text" maxLength={150}
                      value={wsVenue} onChange={(e) => setWsVenue(e.target.value)}
                      placeholder="e.g. Studio 1, TinyToes Natyalaya"
                      className={inputCls}
                    />
                  </div>
                  <div className="min-w-[100px]">
                    <label className={labelCls}>Slots</label>
                    <input
                      type="number" min={1} max={999}
                      value={wsSlots} onChange={(e) => setWsSlots(e.target.value)}
                      placeholder="20"
                      className={inputCls}
                    />
                  </div>
                  <div className="min-w-[100px]">
                    <label className={labelCls}>Price</label>
                    <input
                      type="text" maxLength={50}
                      value={wsPrice} onChange={(e) => setWsPrice(e.target.value)}
                      placeholder="₹500"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Description</label>
                  <textarea
                    rows={2} maxLength={500}
                    value={wsDesc} onChange={(e) => setWsDesc(e.target.value)}
                    placeholder="Brief description of the workshop…"
                    className={`${inputCls} resize-none`}
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={saving} className={primaryBtn}>
                    Schedule Workshop
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">
                Scheduled Workshops · {workshops.length}
              </h2>
              {loadingWS ? (
                <p className="text-stone-400 text-sm text-center py-6 animate-pulse">Loading…</p>
              ) : workshops.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-6">No workshops scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...workshops]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((ws) =>
                      editingWS?.id === ws.id ? (
                        <div key={ws.id} className="border border-gold/30 bg-gold/5 rounded-xl p-4 space-y-3">
                          <div className="flex flex-wrap gap-3">
                            <div className="flex-[2] min-w-[200px]">
                              <label className={labelCls}>Title</label>
                              <input type="text" maxLength={100} value={editingWS.title}
                                onChange={(e) => setEditingWS({ ...editingWS, title: e.target.value })}
                                className={editInputCls} />
                            </div>
                            <div className="min-w-[160px]">
                              <label className={labelCls}>Date</label>
                              <input type="date" value={editingWS.date}
                                onChange={(e) => setEditingWS({ ...editingWS, date: e.target.value })}
                                className={editInputCls} />
                            </div>
                            <div className="min-w-[130px]">
                              <label className={labelCls}>Time</label>
                              <input type="time" value={editingWS.time}
                                onChange={(e) => setEditingWS({ ...editingWS, time: e.target.value })}
                                className={editInputCls} />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-3">
                            <div className="flex-[2] min-w-[200px]">
                              <label className={labelCls}>Venue</label>
                              <input type="text" maxLength={150} value={editingWS.venue}
                                onChange={(e) => setEditingWS({ ...editingWS, venue: e.target.value })}
                                className={editInputCls} />
                            </div>
                            <div className="min-w-[100px]">
                              <label className={labelCls}>Slots</label>
                              <input type="number" min={1} value={editingWS.slots}
                                onChange={(e) => setEditingWS({ ...editingWS, slots: parseInt(e.target.value) || 0 })}
                                className={editInputCls} />
                            </div>
                            <div className="min-w-[100px]">
                              <label className={labelCls}>Price</label>
                              <input type="text" maxLength={50} value={editingWS.price}
                                onChange={(e) => setEditingWS({ ...editingWS, price: e.target.value })}
                                className={editInputCls} />
                            </div>
                          </div>
                          <div>
                            <label className={labelCls}>Description</label>
                            <textarea rows={2} maxLength={500} value={editingWS.description}
                              onChange={(e) => setEditingWS({ ...editingWS, description: e.target.value })}
                              className={`${editInputCls} resize-none`} />
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setEditingWS(null)}
                              className="text-sm text-stone-400 hover:text-stone-700 px-4 py-2 rounded-lg transition">
                              Cancel
                            </button>
                            <button onClick={handleSaveEditWorkshop} disabled={saving}
                              className="text-sm bg-[#800000] text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-60">
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div key={ws.id}
                          className="flex items-start gap-4 px-4 py-3 rounded-xl hover:bg-stone-50/80 transition group border border-stone-100">
                          <div className="flex-shrink-0 w-12 h-12 bg-[#800000] rounded-xl flex flex-col items-center justify-center text-white shadow-sm">
                            <span className="text-[8px] uppercase font-bold leading-none opacity-70">
                              {new Date(ws.date + 'T00:00:00').toLocaleString('default', { month: 'short' })}
                            </span>
                            <span className="text-base font-black leading-tight">
                              {new Date(ws.date + 'T00:00:00').getDate()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-stone-800">{ws.title}</p>
                            <p className="text-xs text-stone-400 mt-0.5">
                              {[ws.time, ws.venue, ws.slots > 0 ? `${ws.slots} slots` : '', ws.price]
                                .filter(Boolean).join(' · ')}
                            </p>
                            {ws.description && (
                              <p className="text-xs text-stone-500 mt-1 line-clamp-2">{ws.description}</p>
                            )}
                          </div>
                          <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition shrink-0">
                            <button onClick={() => setEditingWS(ws)}
                              className="text-xs text-[#800000] hover:text-[#600000] font-medium transition">
                              Edit
                            </button>
                            <button onClick={() => handleDeleteWorkshop(ws.id)} disabled={saving}
                              className="text-xs text-red-400 hover:text-red-600 transition">
                              Delete
                            </button>
                          </div>
                        </div>
                      ),
                    )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ PAYMENT REMINDERS ══════════════ */}
        {tab === 'reminders' && (
          <div>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">
                Add Student Payment
              </h2>
              <form onSubmit={handleAddReminder} className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="flex-[2] min-w-[160px]">
                    <label className={labelCls}>Student Name</label>
                    <input type="text" required maxLength={100}
                      value={rmName} onChange={(e) => setRmName(e.target.value)}
                      placeholder="Aarav Sharma" className={inputCls} />
                  </div>
                  <div className="flex-[2] min-w-[160px]">
                    <label className={labelCls}>Email</label>
                    <input type="email" maxLength={150}
                      value={rmEmail} onChange={(e) => setRmEmail(e.target.value)}
                      placeholder="parent@example.com" className={inputCls} />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className={labelCls}>Phone (WhatsApp)</label>
                    <input type="tel" maxLength={20}
                      value={rmPhone} onChange={(e) => setRmPhone(e.target.value)}
                      placeholder="+91 9876543210" className={inputCls} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className={labelCls}>Amount (₹)</label>
                    <input type="number" required min={0}
                      value={rmAmount} onChange={(e) => setRmAmount(e.target.value)}
                      placeholder="2000" className={inputCls} />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <label className={labelCls}>Due Date</label>
                    <input type="date" required
                      value={rmDueDate} onChange={(e) => setRmDueDate(e.target.value)}
                      className={inputCls} />
                  </div>
                  <button type="submit" disabled={saving} className={primaryBtn}>
                    Add
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-1">
                Students · {reminders.length}
              </h2>
              <p className="text-stone-400 text-xs mb-4">
                {reminders.filter((r) => !r.paid).length} pending · {reminders.filter((r) => r.paid).length} paid
              </p>
              {loadingRM ? (
                <p className="text-stone-400 text-sm text-center py-6 animate-pulse">Loading…</p>
              ) : reminders.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-6">No students added yet.</p>
              ) : (
                <div className="space-y-2">
                  {reminders.map((r) => (
                    <div
                      key={r.id}
                      className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border transition group ${
                        r.paid
                          ? 'border-green-100 bg-green-50/40'
                          : 'border-stone-100 hover:bg-stone-50/80'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-stone-800">{r.studentName}</p>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              r.paid ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'
                            }`}
                          >
                            {r.paid ? 'PAID' : 'PENDING'}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-0.5">
                          ₹{r.amount} · Due {formatDate(r.dueDate)}
                          {r.lastReminded &&
                            ` · Last reminded ${new Date(r.lastReminded).toLocaleDateString()}`}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap shrink-0">
                        {!r.paid && r.phone && (
                          <button
                            onClick={() => sendWhatsAppReminder(r)}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition font-medium"
                          >
                            WhatsApp
                          </button>
                        )}
                        {!r.paid && r.email && (
                          <button
                            onClick={() => sendEmailReminder(r)}
                            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium"
                          >
                            Email
                          </button>
                        )}
                        <button
                          onClick={() => togglePaid(r.id, !r.paid)}
                          disabled={saving}
                          className={`text-xs px-3 py-1.5 rounded-lg transition font-medium ${
                            r.paid
                              ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                              : 'bg-[#800000] text-white hover:opacity-90'
                          }`}
                        >
                          {r.paid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                        <button
                          onClick={() => handleDeleteReminder(r.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ GALLERY ══════════════ */}
        {tab === 'gallery' && (
          <div>
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">
                Add Video to Gallery
              </h2>
              <form onSubmit={handleAddGallery} className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="min-w-[160px]">
                    <label className={labelCls}>Platform</label>
                    <select
                      value={glType}
                      onChange={(e) => setGlType(e.target.value as 'youtube' | 'instagram')}
                      className={inputCls}
                    >
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram</option>
                    </select>
                  </div>
                  <div className="flex-[3] min-w-[240px]">
                    <label className={labelCls}>Video URL</label>
                    <input
                      type="url" required
                      value={glUrl} onChange={(e) => setGlUrl(e.target.value)}
                      placeholder={
                        glType === 'youtube'
                          ? 'https://www.youtube.com/watch?v=...'
                          : 'https://www.instagram.com/reel/...'
                      }
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[200px]">
                    <label className={labelCls}>Title</label>
                    <input
                      type="text" required maxLength={100}
                      value={glTitle} onChange={(e) => setGlTitle(e.target.value)}
                      placeholder="e.g. Diwali Performance 2025"
                      className={inputCls}
                    />
                  </div>
                  <button type="submit" disabled={saving} className={primaryBtn}>
                    Add to Gallery
                  </button>
                </div>
              </form>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">
                Gallery Videos · {gallery.length}
              </h2>
              {loadingGL ? (
                <p className="text-stone-400 text-sm text-center py-6 animate-pulse">Loading…</p>
              ) : gallery.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-6">
                  No videos yet. Add a YouTube or Instagram video above.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="border border-stone-100 rounded-xl overflow-hidden group"
                    >
                      {item.type === 'youtube' ? (
                        <div className="aspect-video bg-black">
                          <img
                            src={`https://img.youtube.com/vi/${item.embedId}/mqdefault.jpg`}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold shadow">
                              IG
                            </div>
                            <p className="text-xs text-stone-500">Instagram</p>
                          </div>
                        </div>
                      )}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-stone-800 truncate">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.type === 'youtube'
                                  ? 'bg-red-50 text-red-600'
                                  : 'bg-purple-50 text-purple-600'
                              }`}
                            >
                              {item.type === 'youtube' ? 'YouTube' : 'Instagram'}
                            </span>
                            <a
                              href={item.url} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-stone-400 hover:text-maroon transition"
                            >
                              View →
                            </a>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteGallery(item.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ STUDENTS ══════════════ */}
        {tab === 'students' && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">Add New Student</h2>
              <form onSubmit={handleAddStudent} className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="flex-[2] min-w-[160px]">
                    <label className={labelCls}>Full Name</label>
                    <input type="text" required maxLength={100} value={stName} onChange={e => setStName(e.target.value)} placeholder="Ananya Sharma" className={inputCls} />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Display Phone</label>
                    <input type="tel" maxLength={20} value={stPhone} onChange={e => setStPhone(e.target.value)} placeholder="+91 9876543210" className={inputCls} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Login Phone</label>
                    <input type="tel" required maxLength={20} value={stLoginPhone} onChange={e => setStLoginPhone(e.target.value)} placeholder="+91 9876543210" className={inputCls} />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <label className={labelCls}>Password</label>
                    <input type="password" required minLength={4} maxLength={100} value={stPassword} onChange={e => setStPassword(e.target.value)} placeholder="Min 4 characters" className={inputCls} />
                  </div>
                  <button type="submit" disabled={saving} className={primaryBtn}>Add Student</button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Student list */}
              <div className="glass-card rounded-2xl p-4 md:col-span-1 h-fit">
                <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-3">Students · {students.length}</h2>
                {loadingST ? (
                  <p className="text-stone-400 text-xs text-center py-4 animate-pulse">Loading…</p>
                ) : students.length === 0 ? (
                  <p className="text-stone-400 text-xs text-center py-4">No students yet.</p>
                ) : (
                  <div className="space-y-1">
                    {students.map(s => (
                      <button key={s.id} onClick={() => { setSelectedStudent(s); setStudentSubTab('profile'); setEditingST(null) }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition text-sm ${selectedStudent?.id === s.id ? 'bg-[#800000] text-white' : 'hover:bg-stone-100 text-stone-700'}`}>
                        <p className="font-semibold truncate">{s.name}</p>
                        <p className={`text-xs truncate ${selectedStudent?.id === s.id ? 'text-white/70' : 'text-stone-400'}`}>{s.loginPhone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Detail panel */}
              <div className="glass-card rounded-2xl p-5 md:col-span-2">
                {!selectedStudent ? (
                  <p className="text-stone-400 text-sm text-center py-12">Select a student to view details.</p>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                      <div>
                        <h3 className="font-bold text-stone-800 text-base">{selectedStudent.name}</h3>
                        <p className="text-xs text-stone-400">{selectedStudent.phone}</p>
                      </div>
                      <button onClick={() => handleDeleteStudent(selectedStudent.id)} className="text-xs text-red-400 hover:text-red-600 transition">Delete Student</button>
                    </div>

                    {/* Sub-tabs */}
                    <div className="flex gap-1 mb-4 bg-stone-100/80 rounded-xl p-0.5 overflow-x-auto">
                      {(['profile', 'payments', 'submissions', 'learning', 'workshops'] as StudentSubTab[]).map(id => (
                        <button key={id} onClick={() => { setStudentSubTab(id); setEditingST(null) }}
                          className={`flex-1 min-w-max py-1.5 px-2 text-xs font-semibold rounded-lg transition whitespace-nowrap capitalize ${studentSubTab === id ? 'bg-[#800000] text-white shadow' : 'text-stone-500 hover:text-maroon'}`}>
                          {id}
                        </button>
                      ))}
                    </div>

                    {/* Profile */}
                    {studentSubTab === 'profile' && (
                      <div>
                        {editingST ? (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-3">
                              <div className="flex-1 min-w-[140px]"><label className={labelCls}>Name</label><input type="text" maxLength={100} value={editingST.name} onChange={e => setEditingST({ ...editingST, name: e.target.value })} className={editInputCls} /></div>
                              <div className="flex-1 min-w-[140px]"><label className={labelCls}>Display Phone</label><input type="tel" maxLength={20} value={editingST.phone} onChange={e => setEditingST({ ...editingST, phone: e.target.value })} className={editInputCls} /></div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <div className="flex-1 min-w-[140px]"><label className={labelCls}>Login Phone</label><input type="tel" maxLength={20} value={editingST.loginPhone} onChange={e => setEditingST({ ...editingST, loginPhone: e.target.value })} className={editInputCls} /></div>
                              <div className="flex-1 min-w-[140px]"><label className={labelCls}>New Password (blank = keep)</label><input type="password" minLength={4} maxLength={100} value={editingST.newPassword} onChange={e => setEditingST({ ...editingST, newPassword: e.target.value })} placeholder="New password" className={editInputCls} /></div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setEditingST(null)} className="text-sm text-stone-400 hover:text-stone-700 px-4 py-2 rounded-lg">Cancel</button>
                              <button onClick={handleSaveEditStudent} disabled={saving} className="text-sm bg-[#800000] text-white font-bold px-5 py-2 rounded-lg hover:opacity-90 disabled:opacity-60">Save</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 text-sm text-stone-600">
                              <p><span className="font-medium text-stone-500">Name:</span> {selectedStudent.name}</p>
                              <p><span className="font-medium text-stone-500">Phone:</span> {selectedStudent.phone || '—'}</p>
                              <p><span className="font-medium text-stone-500">Login Phone:</span> {selectedStudent.loginPhone}</p>
                              <p><span className="font-medium text-stone-500">Videos assigned:</span> {selectedStudent.assignedVideoIds.length}</p>
                              <p><span className="font-medium text-stone-500">Payments:</span> {selectedStudent.paymentHistory.length}</p>
                              <p><span className="font-medium text-stone-500">Submissions:</span> {selectedStudent.submissions.length}</p>
                            </div>
                            <button onClick={() => setEditingST({ name: selectedStudent.name, phone: selectedStudent.phone, loginPhone: selectedStudent.loginPhone, newPassword: '' })} className="text-xs text-[#800000] font-semibold hover:underline shrink-0">Edit</button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payments */}
                    {studentSubTab === 'payments' && (
                      <div className="space-y-4">
                        <form onSubmit={handleAddPayment} className="space-y-2 bg-stone-50/80 rounded-xl p-3">
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Add Payment</p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex-1 min-w-[100px]"><label className={labelCls}>Amount (₹)</label><input type="number" required min={0} value={pmAmount} onChange={e => setPmAmount(e.target.value)} placeholder="2000" className={editInputCls} /></div>
                            <div className="flex-[2] min-w-[140px]"><label className={labelCls}>Description</label><input type="text" maxLength={200} value={pmDesc} onChange={e => setPmDesc(e.target.value)} placeholder="Monthly fee – July" className={editInputCls} /></div>
                          </div>
                          <div className="flex flex-wrap gap-2 items-end">
                            <div className="flex-1 min-w-[130px]"><label className={labelCls}>Date</label><input type="date" required value={pmDate} onChange={e => setPmDate(e.target.value)} className={editInputCls} /></div>
                            <div className="min-w-[110px]"><label className={labelCls}>Status</label><select value={pmStatus} onChange={e => setPmStatus(e.target.value as 'paid' | 'pending')} className={editInputCls}><option value="paid">Paid</option><option value="pending">Pending</option></select></div>
                            <button type="submit" disabled={saving} className="text-sm bg-[#800000] text-white font-bold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-60">Add</button>
                          </div>
                        </form>
                        {selectedStudent.paymentHistory.length === 0 ? (
                          <p className="text-stone-400 text-xs text-center py-4">No payments recorded.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {[...selectedStudent.paymentHistory].sort((a, b) => b.date.localeCompare(a.date)).map(p => (
                              <div key={p.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg border text-sm group ${p.status === 'paid' ? 'border-green-100 bg-green-50/40' : 'border-red-100 bg-red-50/30'}`}>
                                <div className="flex-1 min-w-0"><p className="font-medium text-stone-700 truncate">{p.description || 'Payment'}</p><p className="text-xs text-stone-400">{formatDate(p.date)}</p></div>
                                <p className="font-bold text-stone-700 shrink-0">₹{p.amount}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.status.toUpperCase()}</span>
                                <button onClick={() => studentPatch({ action: 'deletePayment', studentId: selectedStudent.id, paymentId: p.id })} className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition shrink-0">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submissions */}
                    {studentSubTab === 'submissions' && (
                      <div className="space-y-4">
                        <form onSubmit={handleAddSubmission} className="space-y-2 bg-stone-50/80 rounded-xl p-3">
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">Add Submission / Feedback</p>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex-1 min-w-[140px]"><label className={labelCls}>Title</label><input type="text" required maxLength={150} value={subTitle} onChange={e => setSubTitle(e.target.value)} placeholder="e.g. Homework Week 3" className={editInputCls} /></div>
                            <div className="min-w-[130px]"><label className={labelCls}>Date</label><input type="date" required value={subDate} onChange={e => setSubDate(e.target.value)} className={editInputCls} /></div>
                          </div>
                          <div><label className={labelCls}>Notes / Feedback</label><textarea rows={2} maxLength={1000} value={subNotes} onChange={e => setSubNotes(e.target.value)} placeholder="Teacher feedback, notes, observations…" className={`${editInputCls} resize-none`} /></div>
                          <div className="flex justify-end"><button type="submit" disabled={saving} className="text-sm bg-[#800000] text-white font-bold px-4 py-2 rounded-lg hover:opacity-90 disabled:opacity-60">Add</button></div>
                        </form>
                        {selectedStudent.submissions.length === 0 ? (
                          <p className="text-stone-400 text-xs text-center py-4">No submissions recorded.</p>
                        ) : (
                          <div className="space-y-2">
                            {[...selectedStudent.submissions].sort((a, b) => b.date.localeCompare(a.date)).map(s => (
                              <div key={s.id} className="border border-stone-100 rounded-xl px-3 py-2.5 bg-white/60 group">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-stone-800">{s.title}</p><p className="text-xs text-stone-400 mt-0.5">{formatDate(s.date)}</p></div>
                                  <button onClick={() => studentPatch({ action: 'deleteSubmission', studentId: selectedStudent.id, submissionId: s.id })} className="text-xs text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition shrink-0">✕</button>
                                </div>
                                {s.notes && <p className="text-sm text-stone-600 mt-1.5 leading-relaxed whitespace-pre-wrap">{s.notes}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Learning */}
                    {studentSubTab === 'learning' && (
                      <div>
                        <p className="text-xs text-stone-400 mb-3">Check videos from the Content Library to assign them to this student.</p>
                        {content.length === 0 ? (
                          <p className="text-stone-400 text-xs text-center py-4">No content yet. Add videos in the Content Library tab.</p>
                        ) : (
                          <div className="space-y-4">
                            {Array.from(new Set(content.map(c => c.tab))).map(tabName => {
                              const tabItems = content.filter(c => c.tab === tabName)
                              return (
                                <div key={tabName}>
                                  <p className="text-xs font-bold text-maroon uppercase tracking-widest mb-2 border-b border-stone-100 pb-1">{tabName}</p>
                                  <div className="space-y-3 pl-1">
                                    {Array.from(new Set(tabItems.map(c => c.type))).map(type => {
                                      const items = tabItems.filter(c => c.type === type)
                                      if (items.length === 0) return null
                                      return (
                                        <div key={type}>
                                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">{categoryLabel(type)}</p>
                                          <div className="space-y-1.5">
                                            {items.map(item => {
                                              const assigned = selectedStudent.assignedVideoIds.includes(item.id)
                                              return (
                                                <div key={item.id} onClick={() => studentPatch({ action: 'toggleVideo', studentId: selectedStudent.id, videoId: item.id })}
                                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer ${assigned ? 'border-[#800000]/30 bg-[#800000]/5' : 'border-stone-100 hover:border-stone-200'}`}>
                                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${assigned ? 'bg-[#800000] border-[#800000]' : 'border-stone-300'}`}>
                                                    {assigned && <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                                  </div>
                                                  <div className="flex-1 min-w-0"><p className="text-sm font-medium text-stone-800 truncate">{item.title}</p><p className="text-xs text-stone-400">{item.videoType}</p></div>
                                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${assigned ? 'bg-[#800000] text-white' : 'bg-stone-100 text-stone-500'}`}>{assigned ? 'Assigned' : 'Unassigned'}</span>
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Workshops */}
                    {studentSubTab === 'workshops' && (
                      <div className="space-y-5">
                        <div>
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Eligible Workshops</p>
                          <p className="text-xs text-stone-400 mb-2">Workshops this student is eligible to attend.</p>
                          {workshops.length === 0 ? <p className="text-stone-400 text-xs">No workshops scheduled yet.</p> : (
                            <div className="space-y-1.5">
                              {[...workshops].sort((a, b) => a.date.localeCompare(b.date)).map(ws => {
                                const isEligible = selectedStudent.eligibleWorkshopIds.includes(ws.id)
                                return (
                                  <div key={ws.id} onClick={() => {
                                    const next = isEligible ? selectedStudent.eligibleWorkshopIds.filter(id => id !== ws.id) : [...selectedStudent.eligibleWorkshopIds, ws.id]
                                    studentPatch({ action: 'setEligibleWorkshops', studentId: selectedStudent.id, workshopIds: next })
                                  }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer ${isEligible ? 'border-[#800000]/30 bg-[#800000]/5' : 'border-stone-100 hover:border-stone-200'}`}>
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${isEligible ? 'bg-[#800000] border-[#800000]' : 'border-stone-300'}`}>
                                      {isEligible && <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    </div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-stone-800 truncate">{ws.title}</p><p className="text-xs text-stone-400">{formatDate(ws.date)}{ws.price ? ` · ${ws.price}` : ''}</p></div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">Other Workshops (Visible to Student)</p>
                          <p className="text-xs text-stone-400 mb-2">Additional workshops shown in the student portal.</p>
                          {workshops.length === 0 ? <p className="text-stone-400 text-xs">No workshops scheduled yet.</p> : (
                            <div className="space-y-1.5">
                              {[...workshops].sort((a, b) => a.date.localeCompare(b.date)).map(ws => {
                                const isOther = selectedStudent.otherWorkshopIds.includes(ws.id)
                                return (
                                  <div key={ws.id} onClick={() => {
                                    const next = isOther ? selectedStudent.otherWorkshopIds.filter(id => id !== ws.id) : [...selectedStudent.otherWorkshopIds, ws.id]
                                    studentPatch({ action: 'setOtherWorkshops', studentId: selectedStudent.id, workshopIds: next })
                                  }} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition cursor-pointer ${isOther ? 'border-amber-300/50 bg-amber-50/40' : 'border-stone-100 hover:border-stone-200'}`}>
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition ${isOther ? 'bg-amber-500 border-amber-500' : 'border-stone-300'}`}>
                                      {isOther && <svg viewBox="0 0 12 10" fill="none" className="w-3 h-3"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                    </div>
                                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-stone-800 truncate">{ws.title}</p><p className="text-xs text-stone-400">{formatDate(ws.date)}{ws.price ? ` · ${ws.price}` : ''}</p></div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ CONTENT LIBRARY ══════════════ */}
        {tab === 'content' && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">Add Video to Content Library</h2>
              <form onSubmit={handleAddContent} className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <div className="flex-[2] min-w-[200px]"><label className={labelCls}>Title</label><input type="text" required maxLength={100} value={ctTitle} onChange={e => setCtTitle(e.target.value)} placeholder="e.g. Namaskaram – Step by Step" className={inputCls} /></div>
                  <div className="min-w-[140px]"><label className={labelCls}>Tab</label>
                    {ctIsNewTab ? (
                      <div className="flex gap-1 items-center">
                        <input type="text" autoFocus required maxLength={50} value={ctNewTab} onChange={e => setCtNewTab(e.target.value)} placeholder="New tab name…" className={inputCls + ' flex-1'} />
                        <button type="button" onClick={() => { setCtIsNewTab(false); setCtNewTab('') }} className="text-stone-400 hover:text-stone-600 px-1 text-lg leading-none" title="Cancel">✕</button>
                      </div>
                    ) : (
                      <select value={ctTab} onChange={e => { if (e.target.value === '__new__') { setCtIsNewTab(true); setCtNewTab('') } else { setCtTab(e.target.value) } }} className={inputCls}>
                        {Array.from(new Set(['Learning', ...content.map(c => c.tab)])).map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                        <option value="__new__">＋ Create new tab…</option>
                      </select>
                    )}
                  </div>
                  <div className="min-w-[160px]"><label className={labelCls}>Category</label>
                    {ctIsNewCategory ? (
                      <div className="flex gap-1 items-center">
                        <input type="text" autoFocus required maxLength={50} value={ctNewCategory} onChange={e => setCtNewCategory(e.target.value)} placeholder="New category name…" className={inputCls + ' flex-1'} />
                        <button type="button" onClick={() => { setCtIsNewCategory(false); setCtNewCategory('') }} className="text-stone-400 hover:text-stone-600 px-1 text-lg leading-none" title="Cancel">✕</button>
                      </div>
                    ) : (
                      <select value={ctType} onChange={e => { if (e.target.value === '__new__') { setCtIsNewCategory(true); setCtNewCategory('') } else { setCtType(e.target.value) } }} className={inputCls}>
                        {Array.from(new Set(['self-paced', 'class-ref', ...content.map(c => c.type)])).map(cat => (
                          <option key={cat} value={cat}>{categoryLabel(cat)}</option>
                        ))}
                        <option value="__new__">＋ Create new category…</option>
                      </select>
                    )}
                  </div>
                  <div className="min-w-[140px]"><label className={labelCls}>Platform</label><select value={ctVideoType} onChange={e => setCtVideoType(e.target.value as 'youtube' | 'instagram')} className={inputCls}><option value="youtube">YouTube</option><option value="instagram">Instagram</option></select></div>
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="flex-[2] min-w-[240px]"><label className={labelCls}>Video URL</label><input type="url" required value={ctUrl} onChange={e => setCtUrl(e.target.value)} placeholder={ctVideoType === 'youtube' ? 'https://www.youtube.com/watch?v=...' : 'https://www.instagram.com/reel/...'} className={inputCls} /></div>
                  <div className="flex-1 min-w-[180px]"><label className={labelCls}>Description (optional)</label><input type="text" maxLength={300} value={ctDesc} onChange={e => setCtDesc(e.target.value)} placeholder="Brief description…" className={inputCls} /></div>
                  <button type="submit" disabled={saving} className={primaryBtn}>Add Video</button>
                </div>
              </form>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-4">Content Library · {content.length}</h2>
              {loadingCT ? (
                <p className="text-stone-400 text-sm text-center py-6 animate-pulse">Loading…</p>
              ) : content.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-6">No videos yet. Add one above.</p>
              ) : (
                <div className="space-y-6">
                  {Array.from(new Set(content.map(c => c.tab))).map(tabName => {
                    const tabItems = content.filter(c => c.tab === tabName)
                    return (
                      <div key={tabName}>
                        <p className="text-xs font-bold text-maroon uppercase tracking-widest mb-3 border-b border-stone-100 pb-1.5">{tabName}</p>
                        <div className="space-y-4 pl-1">
                          {Array.from(new Set(tabItems.map(c => c.type))).map(type => {
                            const items = tabItems.filter(c => c.type === type)
                            if (items.length === 0) return null
                            return (
                              <div key={type}>
                                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{categoryLabel(type)}</p>
                                <div className="space-y-2">
                                  {items.map(item => (
                                    <div key={item.id} className="border border-stone-100 rounded-xl overflow-hidden group">
                                      <div className="flex items-center gap-3 p-3">
                                        {item.videoType === 'youtube' ? (
                                          <div className="w-16 h-10 bg-stone-900 rounded-lg overflow-hidden shrink-0">
                                            <img src={`https://img.youtube.com/vi/${item.embedId}/default.jpg`} alt={item.title} className="w-full h-full object-cover" />
                                          </div>
                                        ) : (
                                          <div className="w-16 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-purple-600">IG</span>
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-semibold text-stone-800 truncate">{item.title}</p>
                                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.type === 'self-paced' ? 'bg-blue-50 text-blue-600' : item.type === 'class-ref' ? 'bg-purple-50 text-purple-600' : 'bg-teal-50 text-teal-600'}`}>{categoryLabel(item.type)}</span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.videoType === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-pink-50 text-pink-600'}`}>{item.videoType}</span>
                                            {item.description && <span className="text-xs text-stone-400 truncate max-w-[180px]">{item.description}</span>}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                          <button onClick={() => setAssigningItem(assigningItem?.id === item.id ? null : item)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${assigningItem?.id === item.id ? 'bg-[#800000] text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>Assign</button>
                                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-400 hover:text-maroon transition">View →</a>
                                          <button onClick={() => handleDeleteContent(item.id)} className="text-xs text-red-400 hover:text-red-600 transition opacity-0 group-hover:opacity-100">Delete</button>
                                        </div>
                                      </div>

                                      {/* Assign panel */}
                                      {assigningItem?.id === item.id && (
                                        <div className="border-t border-stone-100 bg-stone-50/80 p-3">
                                          <p className="text-xs font-bold text-stone-500 mb-2">Push to students · click to toggle access</p>
                                          {students.length === 0 ? (
                                            <p className="text-xs text-stone-400">No students yet.</p>
                                          ) : (
                                            <div className="flex flex-wrap gap-2">
                                              {students.map(s => {
                                                const assigned = s.assignedVideoIds.includes(item.id)
                                                return (
                                                  <button key={s.id} onClick={() => handleToggleContentStudent(item.id, s.id)} disabled={saving}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${assigned ? 'bg-[#800000] text-white border-[#800000]' : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'}`}>
                                                    <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${assigned ? 'bg-white border-white' : 'border-current'}`}>
                                                      {assigned && <svg viewBox="0 0 8 8" fill="none" className="w-2 h-2"><path d="M1 4l2 2 4-4" stroke="#800000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                                    </span>
                                                    {s.name}
                                                  </button>
                                                )
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type StudentTab = string

interface ContentItem {
  id: string
  title: string
  tab: string
  type: string
  videoType: 'youtube' | 'instagram'
  url: string
  embedId: string
  description: string
}

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

interface StudentData {
  id: string
  name: string
  phone: string
  loginPhone: string
  submissions: Submission[]
  paymentHistory: Payment[]
  assignedVideos: ContentItem[]
  eligibleWorkshops: Workshop[]
  otherWorkshops: Workshop[]
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}

function VideoCard({ item }: { item: ContentItem }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="border border-stone-100 rounded-2xl overflow-hidden bg-white/80 shadow-sm hover:shadow-md transition">
      {playing && item.videoType === 'youtube' ? (
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${item.embedId}?autoplay=1`}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : (
        <div
          className="aspect-video bg-stone-900 relative cursor-pointer group"
          onClick={() => item.videoType === 'youtube' && setPlaying(true)}
        >
          {item.videoType === 'youtube' ? (
            <>
              <img
                src={`https://img.youtube.com/vi/${item.embedId}/mqdefault.jpg`}
                alt={item.title}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-75 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-1">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </>
          ) : (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mx-auto mb-2 flex items-center justify-center text-white font-bold shadow-lg">
                    IG
                  </div>
                  <p className="text-xs text-stone-500 font-medium">View on Instagram</p>
                </div>
              </div>
            </a>
          )}
        </div>
      )}
      <div className="p-4">
        <p className="text-sm font-semibold text-stone-800 leading-tight">{item.title}</p>
        {item.description && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{item.description}</p>
        )}
        {item.videoType === 'youtube' && !playing && (
          <button
            onClick={() => setPlaying(true)}
            className="mt-3 text-xs text-[#800000] font-semibold hover:underline"
          >
            ▶ Watch video
          </button>
        )}
      </div>
    </div>
  )
}

function WorkshopCard({ ws, badge }: { ws: Workshop; badge?: string }) {
  const d = new Date(ws.date + 'T00:00:00')
  return (
    <div className="flex gap-4 p-4 rounded-2xl border border-stone-100 bg-white/80 shadow-sm hover:shadow-md transition">
      <div className="flex-shrink-0 w-14 h-14 bg-[#800000] rounded-xl flex flex-col items-center justify-center text-white shadow-sm">
        <span className="text-[8px] uppercase font-bold leading-none opacity-80">
          {MONTHS[d.getMonth()]}
        </span>
        <span className="text-xl font-black leading-tight">{d.getDate()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <p className="text-sm font-semibold text-stone-800">{ws.title}</p>
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/20 text-amber-800">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-stone-400 mt-0.5">
          {[ws.time, ws.venue, ws.slots > 0 ? `${ws.slots} slots` : '', ws.price]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {ws.description && (
          <p className="text-xs text-stone-500 mt-1 line-clamp-2">{ws.description}</p>
        )}
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const router = useRouter()
  const [data, setData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<StudentTab>('__workshops')

  useEffect(() => {
    void loadData()
  }, [])

  async function loadData() {
    try {
      const res = await fetch('/api/student/me')
      if (res.status === 401) { router.push('/student/login'); return }
      if (!res.ok) throw new Error()
      const loaded = (await res.json()) as StudentData
      setData(loaded)
      if (loaded.assignedVideos.length > 0) {
        setTab(loaded.assignedVideos[0].tab)
      } else {
        setTab('__workshops')
      }
    } catch {
      router.push('/student/login')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/student/logout', { method: 'POST' })
    router.push('/student/login')
  }

  if (loading) {
    return (
      <main className="heritage-bg min-h-screen flex items-center justify-center">
        <p className="text-stone-400 animate-pulse text-sm">Loading your dashboard…</p>
      </main>
    )
  }

  if (!data) return null

  // Derive unique video tabs in the order they first appear
  const videoTabs = Array.from(new Set(data.assignedVideos.map(v => v.tab)))

  function categoryLabel(type: string): string {
    if (type === 'self-paced') return 'Self-Paced Learning'
    if (type === 'class-ref') return 'Class Reference'
    return type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  const tabs: { id: string; label: string }[] = [
    ...videoTabs.map(t => ({ id: t, label: t })),
    { id: '__workshops', label: 'Workshops' },
    { id: '__payments', label: 'Payments' },
    { id: '__submissions', label: 'Submissions' },
  ]

  return (
    <main className="heritage-bg min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-maroon font-cinzel">{data.name}</h1>
            <p className="text-stone-500 text-sm">Tiny Toes Natyalaya · Student Portal</p>
          </div>
          <div className="flex gap-4 text-sm items-center">
            <a href="/" className="text-stone-500 hover:text-maroon transition">← Home</a>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium transition">
              Logout
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-6 bg-stone-100/80 rounded-2xl p-1 overflow-x-auto">
          {tabs.map(({ id, label }) => (
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

        {/* ══════════════ DYNAMIC VIDEO TABS ══════════════ */}
        {videoTabs.includes(tab) && (
          <div className="space-y-6">
            {Array.from(new Set(data.assignedVideos.filter(v => v.tab === tab).map(v => v.type))).map(cat => {
              const videos = data.assignedVideos.filter(v => v.tab === tab && v.type === cat)
              return (
                <div key={cat} className="glass-card rounded-2xl p-6">
                  <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-1">{categoryLabel(cat)}</h2>
                  {videos.length === 0 ? (
                    <p className="text-stone-400 text-sm text-center py-8">No videos assigned yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      {videos.map(v => <VideoCard key={v.id} item={v} />)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ══════════════ WORKSHOPS ══════════════ */}
        {tab === '__workshops' && (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-1">
                Eligible Workshops
              </h2>
              <p className="text-stone-400 text-xs mb-4">Workshops you are eligible to join</p>
              {data.eligibleWorkshops.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">
                  No eligible workshops at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...data.eligibleWorkshops]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(ws => <WorkshopCard key={ws.id} ws={ws} badge="Eligible" />)}
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-1">
                Other Workshops
              </h2>
              <p className="text-stone-400 text-xs mb-4">More workshops available at the academy</p>
              {data.otherWorkshops.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">
                  No other workshops available at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {[...data.otherWorkshops]
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(ws => <WorkshopCard key={ws.id} ws={ws} />)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════ PAYMENTS ══════════════ */}
        {tab === '__payments' && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-1">
              Payment History
            </h2>
            <p className="text-stone-400 text-xs mb-4">
              {data.paymentHistory.filter(p => p.status === 'pending').length} pending ·{' '}
              {data.paymentHistory.filter(p => p.status === 'paid').length} paid
            </p>
            {data.paymentHistory.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">No payment records yet.</p>
            ) : (
              <div className="space-y-2">
                {[...data.paymentHistory]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(p => (
                    <div
                      key={p.id}
                      className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl border transition ${
                        p.status === 'paid'
                          ? 'border-green-100 bg-green-50/40'
                          : 'border-red-100 bg-red-50/30'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800">
                          {p.description || 'Class fee'}
                        </p>
                        <p className="text-xs text-stone-400 mt-0.5">{formatDate(p.date)}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className="text-sm font-bold text-stone-700">₹{p.amount}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'paid'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {p.status === 'paid' ? 'PAID' : 'PENDING'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ SUBMISSIONS ══════════════ */}
        {tab === '__submissions' && (
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-bold text-maroon uppercase tracking-widest text-xs mb-1">
              Submissions
            </h2>
            <p className="text-stone-400 text-xs mb-4">Feedback and notes from your teacher</p>
            {data.submissions.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">
                No submissions recorded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {[...data.submissions]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map(s => (
                    <div
                      key={s.id}
                      className="border border-stone-100 rounded-xl px-4 py-3 bg-white/60"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-stone-800">{s.title}</p>
                        <p className="text-xs text-stone-400">{formatDate(s.date)}</p>
                      </div>
                      {s.notes && (
                        <p className="text-sm text-stone-600 mt-2 leading-relaxed whitespace-pre-wrap">
                          {s.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}

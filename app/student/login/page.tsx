'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function StudentLoginPage() {
  const router = useRouter()
  const [loginPhone, setLoginPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginPhone, password }),
      })
      if (res.ok) {
        router.push('/student')
        router.refresh()
      } else {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Login failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="heritage-bg min-h-screen flex items-center justify-center p-6">
      <div className="glass-card rounded-3xl p-8 md:p-12 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#800000] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-xl font-cinzel">TTN</span>
          </div>
          <h1 className="text-2xl font-bold text-maroon font-cinzel">Student Login</h1>
          <p className="text-stone-500 text-sm mt-1">Tiny Toes Natyalaya</p>
        </div>

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              htmlFor="loginPhone"
              className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5"
            >
              Phone Number
            </label>
            <input
              id="loginPhone"
              type="tel"
              required
              autoComplete="username"
              value={loginPhone}
              onChange={(e) => setLoginPhone(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition bg-white/80"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition bg-white/80"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#800000] text-white font-bold py-3 rounded-xl hover:opacity-90 transition text-sm disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-stone-400 mt-6">
          Contact your teacher for login credentials.
        </p>
      </div>
    </main>
  )
}

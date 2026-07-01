'use client'

import { useState } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '#about', label: 'Tradition' },
    { href: '#syllabus', label: 'Syllabus' },
    { href: '#classes', label: 'Classes' },
    { href: '#calendar', label: 'Calendar' },
    { href: '#contact', label: 'Enroll' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 border-b border-gold/30 backdrop-blur-md">
      <div className="mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="relative group cursor-pointer flex-shrink-0">
            <div className="w-9 h-9 md:w-11 md:h-11 bg-[#800000] rounded-full flex items-center justify-center border-2 border-gold shadow-lg transition-transform group-hover:rotate-12">
              <span className="text-white font-bold text-[9px] md:text-[10px] text-center leading-tight">TTN</span>
            </div>
            <div className="absolute -inset-1 border border-gold/30 rounded-full animate-pulse" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-maroon font-bold text-xs md:text-base lg:text-lg tracking-wider truncate">
              TinyToes Natyalaya
            </h1>
            <p className="text-[7px] md:text-[9px] uppercase tracking-widest text-gold -mt-0.5 font-semibold truncate">
              Online Academy
            </p>
          </div>
        </div>

        {/* Desktop nav links */}
        <div className="hidden xl:flex gap-4 text-xs font-semibold uppercase tracking-widest text-maroon">
          {navLinks.map(({ href, label }) => (
            <a key={href} href={href} className="hover:text-gold transition-colors whitespace-nowrap">
              {label}
            </a>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Student Login — desktop only */}
          <a
            href="/student/login"
            className="hidden xl:inline-flex items-center gap-1.5 border border-[#800000]/40 text-maroon px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#800000]/5 transition-colors whitespace-nowrap"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Student Login
          </a>

          {/* Register — tablet+ */}
          <a
            href="https://forms.gle/TwZwvy3vmANFznc89"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-block bg-gold text-[#800000] px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest cta-button whitespace-nowrap"
          >
            Register
          </a>

          {/* Demo — always visible */}
          <a
            href="https://wa.me/14374539541?text=Hello!%20I%20am%20interested%20in%20your%20dance%20classes.%20could%20you%20provide%20details%20on%20demo%20class?"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#800000] text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest cta-button whitespace-nowrap"
          >
            Demo
          </a>

          {/* Hamburger — below xl */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="xl:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-stone-100 transition-colors flex-shrink-0"
          >
            <span className={`block w-5 h-0.5 bg-maroon rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-maroon rounded transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-maroon rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile / tablet dropdown menu */}
      {menuOpen && (
        <div className="xl:hidden border-t border-gold/20 bg-white/98 px-4 py-4 space-y-1">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-3 text-sm font-semibold uppercase tracking-widest text-maroon hover:bg-stone-50 hover:text-gold rounded-xl transition-colors"
            >
              {label}
            </a>
          ))}
          <div className="pt-2 border-t border-stone-100">
            <a
              href="/student/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-maroon hover:bg-stone-50 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Student Login
            </a>
            <a
              href="https://forms.gle/TwZwvy3vmANFznc89"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-maroon hover:bg-stone-50 rounded-xl transition-colors md:hidden"
            >
              Register for Classes
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

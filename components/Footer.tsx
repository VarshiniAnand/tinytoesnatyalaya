'use client'

import { useState } from 'react'

export default function Footer() {
  const [studentName, setStudentName] = useState('')
  const [age, setAge] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const name = studentName.trim()
    const ageVal = age.trim()
    let number = whatsappNumber.trim()

    if (!number.startsWith('+')) {
      number = '+' + number
    }

    const regex = /^\+[1-9]\d{1,14}$/
    if (!regex.test(number)) {
      alert('Please enter a valid phone number with country code')
      return
    }

    const message = `Hello! I am interested in your dance classes. Here are my details:%0AName: ${name}%0AAge: ${ageVal}%0AWhatsApp Number: ${number}%0ACould you provide more details ?`
    window.open(
      `https://wa.me/14374539541?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    )

    setStudentName('')
    setAge('')
    setWhatsappNumber('')
  }

  return (
    <footer
      id="contact"
      className="bg-stone-950 text-white pt-20 md:pt-32 pb-12 px-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-maroon via-gold to-maroon" />
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-20 mb-16 md:mb-24">
          {/* Contact Info */}
          <div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 italic text-gold">
              Begin the <br />
              Divine Journey
            </h2>
            <p className="text-stone-400 mb-10 text-base md:text-lg leading-relaxed max-w-md">
              Our virtual doors are open for passionate dancer across the globe.
              Let the rhythm of the salangai change your life.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="#25D366"
                  >
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.93.5 3.82 1.45 5.5L2 22l4.77-1.25a9.86 9.86 0 0 0 5.27 1.51h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.75 14.43c-.24.67-1.4 1.3-1.93 1.38-.49.07-1.12.1-3.63-.75-3.21-1.11-5.28-4.6-5.44-4.82-.15-.21-1.29-1.72-1.29-3.29s.82-2.33 1.11-2.65c.29-.32.64-.4.86-.4h.62c.2 0 .47-.07.73.56.27.67.91 2.3.99 2.47.08.17.13.37.02.58-.11.21-.17.37-.33.57-.16.2-.34.45-.48.6-.16.16-.33.33-.14.65.19.32.84 1.38 1.8 2.24 1.23 1.1 2.26 1.44 2.58 1.6.32.16.51.14.7-.08.19-.21.8-.93 1.01-1.25.21-.32.42-.26.7-.16.29.11 1.82.86 2.13 1.02.31.16.52.24.6.37.08.13.08.77-.16 1.44z" />
                  </svg>
                </div>
                <a
                  href="https://wa.me/14374539541?text=Hello!%20I%20am%20interested%20in%20your%20dance%20classes.%20could%20you%20please%20provide%20more%20details"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg md:text-xl font-medium hover:text-gold transition-colors"
                >
                  +1 437 453 9541
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                  <span className="text-gold">📍</span>
                </div>
                <span className="text-base md:text-lg">
                  Online via Zoom &amp; Google Meet
                </span>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="glass-card !bg-white/5 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl">
            <h4 className="font-bold mb-6 md:mb-8 uppercase tracking-[0.2em] text-[10px] text-gold">
              For more details, please submit your inquiry
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Student Name"
                  className="bg-transparent border-b border-white/20 py-3 md:py-4 outline-none focus:border-gold transition-colors w-full text-sm"
                  required
                />
                <input
                  type="text"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Age"
                  className="bg-transparent border-b border-white/20 py-3 md:py-4 outline-none focus:border-gold transition-colors w-full text-sm"
                  required
                />
              </div>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="WhatsApp Number with country code"
                className="w-full bg-transparent border-b border-white/20 py-3 md:py-4 outline-none focus:border-gold transition-colors text-sm"
                required
              />
              <button
                type="submit"
                className="w-full bg-gold text-maroon font-black py-4 md:py-5 rounded-xl md:rounded-2xl hover:bg-white hover:text-[#800000] transition-all uppercase tracking-widest text-xs mt-4"
              >
                Submit Inquiry
              </button>
            </form>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center border border-gold/30">
              <span className="text-gold font-bold text-[10px]">TTN</span>
            </div>
            <p className="text-stone-500 text-[10px] md:text-xs">
              © 2024 TinyToes Natyalaya. All Rights Reserved.
            </p>
          </div>
          <div className="flex gap-6 text-stone-500 text-[10px] md:text-xs uppercase font-bold tracking-widest">
            <a
              href="https://www.instagram.com/tinytoesnatyalaya/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61585815603267"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function Hero() {
  return (
    <header className="relative min-h-[80vh] md:min-h-[90vh] flex items-center justify-center px-6 py-12 md:py-20 overflow-hidden">
      <svg
        className="lotus-mark -left-20 top-10 w-64 h-64 md:w-[500px] md:h-[500px]"
        viewBox="0 0 200 200"
        fill="currentColor"
        style={{ color: 'var(--maroon)' }}
      >
        <path d="M100 20 C120 60 180 80 100 180 C20 80 80 60 100 20" />
        <path
          d="M100 40 C110 70 140 80 100 140 C60 80 90 70 100 40"
          opacity="0.5"
        />
      </svg>

      <div className="max-w-4xl text-center z-10">
        <div className="mb-6 md:mb-8 inline-block bg-[#800000] text-white px-4 md:px-6 py-1.5 rounded-full border border-gold/50 shadow-inner">
          <span className="font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-[8px] md:text-[10px]">
            Affiliated to Aangika Fine Arts Academy
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-maroon mb-6 leading-tight">
          Roots of <span className="italic text-gold">Grace</span>
        </h1>

        <p className="text-lg md:text-2xl text-stone-700 mb-8 md:mb-12 max-w-2xl mx-auto italic font-medium leading-relaxed px-4">
          Nurturing the next generation through the divine art of Bharatanatyam.
          A journey of discipline, storytelling, and rhythm.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
          <a
            href="#syllabus"
            className="w-full sm:w-auto bg-[#800000] text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest cta-button text-[10px] md:text-sm"
          >
            10-Step Grade System
          </a>
          <a
            href="#about"
            className="w-full sm:w-auto bg-[#800000] text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest cta-button text-[10px] md:text-sm"
          >
            Our Heritage
          </a>
          <a
            href="/TinyToesNatyalaya_Brochure.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="w-full sm:w-auto bg-[#800000] text-white px-8 md:px-12 py-4 md:py-5 rounded-full font-bold uppercase tracking-widest cta-button text-[10px] md:text-sm"
          >
            Download Brochure
          </a>
        </div>

        <div className="mt-6">
          <a
            href="/student/login"
            className="inline-flex items-center gap-2 text-stone-500 hover:text-maroon transition-colors text-xs md:text-sm font-medium group whitespace-nowrap"
          >
            <span className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-stone-300 group-hover:border-maroon/50 flex-shrink-0 flex items-center justify-center transition-colors">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 md:w-3.5 md:h-3.5">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </span>
            <span>Already a student?{' '}<span className="text-maroon font-semibold group-hover:underline underline-offset-2">Sign in →</span></span>
          </a>
        </div>
      </div>
    </header>
  )
}

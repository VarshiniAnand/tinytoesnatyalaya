export default function Syllabus() {
  return (
    <section
      id="syllabus"
      className="py-16 md:py-24 px-6 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-16 items-center">
          {/* Left: Text + Grade Cards */}
          <div className="lg:w-1/2 w-full">
            <h2 className="text-3xl md:text-5xl font-bold text-maroon mb-6 leading-tight">
              The Ten Steps to <br className="hidden md:block" />
              <span className="text-gold">Mastery</span>
            </h2>
            <p className="text-stone-700 mb-8 md:mb-10 text-base md:text-lg leading-relaxed">
              Our 10-step grade system is designed by experts to guide students
              from their first <i>Namaskaram</i> to complex <i>Varnams</i> and
              beyond.
            </p>

            <div className="space-y-4 md:space-y-6">
              {/* Grade 1-4 */}
              <div className="flex items-center gap-4 md:gap-5 glass-card p-4 md:p-6 rounded-2xl group cursor-default">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#800000] text-white flex items-center justify-center flex-shrink-0 font-bold border-2 border-gold/30 text-sm md:text-base transition-transform group-hover:scale-110">
                  1-4
                </div>
                <div>
                  <h4 className="font-bold text-maroon uppercase tracking-wider text-xs md:text-sm group-hover:text-gold transition-colors">
                    Arambham (The Beginning)
                  </h4>
                  <p className="text-[10px] md:text-sm text-stone-600">
                    Focus on Araimandi, Basic Adavus, and Mudras.
                  </p>
                </div>
              </div>

              {/* Grade 5-9 */}
              <div className="flex items-center gap-4 md:gap-5 glass-card p-4 md:p-6 rounded-2xl group cursor-default">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gold text-maroon flex items-center justify-center flex-shrink-0 font-bold border-2 border-maroon/30 text-sm md:text-base transition-transform group-hover:scale-110">
                  5-9
                </div>
                <div>
                  <h4 className="font-bold text-maroon uppercase tracking-wider text-xs md:text-sm group-hover:text-gold transition-colors">
                    Madhyama (Intermediate)
                  </h4>
                  <p className="text-[10px] md:text-sm text-stone-600">
                    Introduction to Tala, Jatis, Abhinaya and Margam.
                  </p>
                </div>
              </div>

              {/* Grade 10 */}
              <div className="flex items-center gap-4 md:gap-5 glass-card p-4 md:p-6 rounded-2xl group cursor-default">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#800000] text-white flex items-center justify-center flex-shrink-0 font-bold border-2 border-gold/30 text-sm md:text-base transition-transform group-hover:scale-110">
                  10
                </div>
                <div>
                  <h4 className="font-bold text-maroon uppercase tracking-wider text-xs md:text-sm group-hover:text-gold transition-colors">
                    Natyalankara (Final Step)
                  </h4>
                  <p className="text-[10px] md:text-sm text-stone-600">
                    Complete Margam knowledge and choreography.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Visual Grid */}
          <div className="lg:w-1/2 w-full relative">
            <div className="relative z-10 grid grid-cols-2 gap-4 md:gap-6">
              <div className="aspect-square bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center shadow-xl border-b-4 border-gold group hover:bg-maroon transition-colors duration-500">
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12 md:w-20 md:h-20 mb-4 transition-transform group-hover:scale-90"
                >
                  <path
                    d="M10 90 Q 50 10 90 90"
                    fill="none"
                    stroke="currentColor"
                    className="text-maroon group-hover:text-gold"
                    strokeWidth="2"
                  />
                  <path
                    d="M20 90 Q 50 30 80 90"
                    fill="none"
                    stroke="currentColor"
                    className="text-gold group-hover:text-gold"
                    strokeWidth="2"
                  />
                </svg>
                <h4 className="font-bold text-maroon text-center uppercase tracking-tighter text-xs md:text-sm group-hover:text-white">
                  Technique
                </h4>
              </div>

              <div className="aspect-square bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 flex flex-col items-center justify-center shadow-xl border-b-4 border-gold mt-6 md:mt-12 group hover:bg-maroon transition-colors duration-500">
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12 md:w-20 md:h-20 mb-4 transition-transform group-hover:scale-90"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="30"
                    fill="currentColor"
                    className="text-maroon group-hover:text-gold"
                    opacity="0.1"
                  />
                  <path
                    d="M50 20 L50 80 M20 50 L80 50"
                    stroke="currentColor"
                    className="text-gold group-hover:text-white"
                    strokeWidth="3"
                  />
                </svg>
                <h4 className="font-bold text-maroon text-center uppercase tracking-tighter text-xs md:text-sm group-hover:text-white">
                  Rhythm
                </h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

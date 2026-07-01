export default function Classes() {
  return (
    <section
      id="classes"
      className="py-16 md:py-24 px-6 bg-stone-900/5 backdrop-blur-sm"
    >
      <div className="max-w-6xl mx-auto text-center mb-12 md:mb-20">
        <h2 className="text-3xl md:text-5xl font-bold text-maroon mb-4">
          Age-Based Personalization
        </h2>
        <p className="text-stone-600 max-w-xl mx-auto text-base md:text-lg italic font-medium">
          Small group sizes. Large creative growth.
        </p>
        <p className="text-stone-600">
          We don&apos;t believe in one-size-fits-all. Every child&apos;s journey
          is unique and tailored to their developmental stage.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 md:gap-10">
        {/* Juniors */}
        <div className="group relative bg-white p-8 md:p-10 rounded-[2rem] shadow-lg border-b-4 border-gold/30 hover:border-maroon hover:-translate-y-2 transition-all duration-500 cursor-default">
          <div className="w-12 h-12 bg-[#800000]/5 group-hover:bg-[#800000] rounded-xl flex items-center justify-center mb-6 transition-colors duration-500">
            <span className="text-maroon group-hover:text-white font-bold transition-colors">
              4-6
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-maroon mb-2">
            Juniors
          </h3>
          <p className="text-stone-500 group-hover:text-stone-700 text-sm mb-6 leading-relaxed transition-colors">
            Introducing the basics of Mudras and storytelling through fun games.
          </p>
          <div className="flex items-center gap-2 text-gold font-bold text-xs mb-8">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            30 Min Classes
          </div>
          <button className="w-full py-4 bg-[#800000]/5 text-maroon font-bold rounded-xl text-xs uppercase tracking-widest group-hover:bg-[#800000] group-hover:text-white transition-all duration-300 hover:bg-[#800000] hover:text-white">
            Details
          </button>
        </div>

        {/* Kids (Featured) */}
        <div className="group relative bg-[#800000] p-8 md:p-10 rounded-[2rem] shadow-2xl border-b-4 border-gold text-white md:-translate-y-6 hover:-translate-y-8 transition-all duration-500 cursor-default overflow-hidden">
          <div className="absolute inset-0 bg-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="bg-gold text-maroon text-[8px] font-black uppercase py-1 px-3 rounded-full inline-block mb-6 tracking-widest group-hover:scale-110 transition-transform">
              Foundation Level
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-2">
              The Young Dancers
            </h3>
            <p className="text-stone-300 group-hover:text-white text-sm mb-6 leading-relaxed transition-colors">
              Mastering Adavus, posture, and the depth of Abhinaya expression.
            </p>
            <div className="flex items-center gap-2 text-gold font-bold text-xs mb-8">
              <div className="w-2 h-2 rounded-full bg-gold" />
              45 Min Classes
            </div>
            <button className="w-full py-4 bg-gold text-maroon font-bold rounded-xl cta-button text-xs uppercase tracking-widest group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              Join Batch
            </button>
          </div>
        </div>

        {/* Advanced */}
        <div className="group relative bg-white p-8 md:p-10 rounded-[2rem] shadow-lg border-b-4 border-gold/30 hover:border-maroon hover:-translate-y-2 transition-all duration-500 cursor-default">
          <div className="w-12 h-12 bg-[#800000]/5 group-hover:bg-[#800000] rounded-xl flex items-center justify-center mb-6 transition-colors duration-500">
            <span className="text-maroon group-hover:text-white font-bold transition-colors">
              13+
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-maroon mb-2">
            Advanced
          </h3>
          <p className="text-stone-500 group-hover:text-stone-700 text-sm mb-6 leading-relaxed transition-colors">
            Deep technique, professional choreography, and performance training.
          </p>
          <div className="flex items-center gap-2 text-gold font-bold text-xs mb-8">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            60 Min Classes
          </div>
          <button className="w-full py-4 bg-[#800000]/5 text-maroon font-bold rounded-xl text-xs uppercase tracking-widest group-hover:bg-[#800000] group-hover:text-white transition-all duration-300">
            Details
          </button>
        </div>
      </div>
    </section>
  )
}

export default function CertificationBanner() {
  return (
    <section className="bg-[#800000] py-12 md:py-16 px-6 text-center text-white relative shadow-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-px bg-gold/50 self-center" />
          <div className="mx-4 text-gold uppercase tracking-[0.3em] text-[10px] font-bold">
            Standard of Excellence
          </div>
          <div className="w-12 h-px bg-gold/50 self-center" />
        </div>
        <h2 className="text-2xl md:text-4xl font-bold mb-6 tracking-wide px-2">
          Aangika Fine Arts Academy
        </h2>
        <p className="text-stone-300 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          As a certified affiliate, we provide a structured curriculum that
          honors the roots of Bharatanatyam, providing students with globally
          recognized certification.
        </p>
      </div>
    </section>
  )
}

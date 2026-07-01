import Image from 'next/image'

export default function About() {
  return (
    <section
      id="about"
      className="py-16 md:py-32 px-6 max-w-6xl mx-auto relative overflow-hidden"
    >
      <div className="flex flex-col lg:flex-row gap-12 md:gap-20 items-center">
        {/* Image Column */}
        <div className="lg:w-1/2 w-full">
          <div className="relative p-2 md:p-4 group">
            <div className="absolute inset-0 border-2 border-gold/20 translate-x-4 translate-y-4 rounded-3xl group-hover:translate-x-2 group-hover:translate-y-2 transition-transform duration-500" />
            <div className="relative bg-stone-200 aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-2 border-white">
              <Image
                src="https://res.cloudinary.com/dyubndq0p/image/upload/v1767147814/rootmeetstrends_wjwhj3.png"
                alt="Instructor Varshini Anand"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 bg-[#800000] text-white p-4 md:p-6 rounded-2xl shadow-xl border-2 border-white group-hover:rotate-6 transition-transform">
              <div className="text-center">
                <div className="font-black text-xl md:text-2xl leading-none">
                  <p>Magic</p>
                  Happens
                </div>
                <div className="text-[8px] md:text-[10px] font-bold tracking-[0.25px] mt-2">
                  When you dive deeper!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Text Column */}
        <div className="lg:w-1/2 w-full">
          <h2 className="text-3xl md:text-5xl font-bold text-maroon mb-8 md:mb-10 leading-tight">
            Preserving the <span className="text-gold">Heritage</span>
          </h2>
          <div className="space-y-6 md:space-y-10">
            <div className="flex gap-4 md:gap-6 group">
              <div className="bell-icon mt-1.5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <div>
                <h4 className="font-bold text-maroon text-lg md:text-xl mb-2">
                  Mythology &amp; Expression
                </h4>
                <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                  Understanding the &apos;Why&apos; behind every movement. We
                  teach the stories that bring the dance to life.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 group">
              <div className="bell-icon mt-1.5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <div>
                <h4 className="font-bold text-maroon text-lg md:text-xl mb-2">
                  Festive Dances
                </h4>
                <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                  Krishna Jayanti, Ganesh Chaturthi, Navaratri, Ram Navami,
                  Eid, Christmas (Jingle Bells), Pongal, Maha Sivaratri
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 group">
              <div className="bell-icon mt-1.5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <div>
                <h4 className="font-bold text-maroon text-lg md:text-xl mb-2">
                  Cultural Connect Workshops
                </h4>
                <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                  Thiruppavai, Thirukkural, Mahabharata &amp; Ramayana stories,
                  Amar Chitrakatha, Folk tales from India and around the world.
                </p>
              </div>
            </div>

            <div className="flex gap-4 md:gap-6 group">
              <div className="bell-icon mt-1.5 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <div>
                <h4 className="font-bold text-maroon text-lg md:text-xl mb-2">
                  Passion Driven Learning
                </h4>
                <p className="text-stone-600 text-sm md:text-base leading-relaxed">
                  <strong>Movie songs</strong> (Kaatrodu Kuzhal, Bharatavedham,
                  Mukunda Mukunda &amp; many){' '}
                  <strong>Fun-filled fusions</strong> (Kaantha, Shape of You
                  &amp; Western fusions, Athinthom, Apsara Aali)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

import type { GalleryItem } from '@/lib/gallery'

export default function Gallery({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null

  return (
    <section id="gallery" className="py-16 md:py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-px bg-gold/50 self-center" />
            <div className="mx-4 text-gold uppercase tracking-[0.3em] text-[10px] font-bold">
              Watch Us Dance
            </div>
            <div className="w-12 h-px bg-gold/50 self-center" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-maroon mb-4">
            Our <span className="text-gold">Gallery</span>
          </h2>
          <p className="text-stone-600 max-w-xl mx-auto text-sm md:text-base">
            Watch our students shine in performances, workshops, and celebrations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) =>
            item.type === 'youtube' ? (
              <div key={item.id} className="glass-card rounded-2xl overflow-hidden">
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${item.embedId}`}
                    title={item.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-stone-800">{item.title}</p>
                </div>
              </div>
            ) : (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card rounded-2xl overflow-hidden group block hover:shadow-lg transition"
              >
                <div className="aspect-video bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>
                    <p className="text-stone-600 text-sm font-medium">View on Instagram</p>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-stone-800 group-hover:text-maroon transition">
                    {item.title}
                  </p>
                </div>
              </a>
            ),
          )}
        </div>
      </div>
    </section>
  )
}


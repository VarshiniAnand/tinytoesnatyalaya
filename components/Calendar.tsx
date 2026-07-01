'use client'

import { DEFAULT_EVENTS } from '@/types/events'
import type { EventMap } from '@/types/events'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function MonthGrid({ year, month, today, events }: { year: number; month: number; today: Date; events: EventMap }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month

  return (
    <div className="glass-card rounded-2xl p-4">
      <h3
        className={`text-center font-bold text-xs uppercase tracking-widest mb-3 ${
          isCurrentMonth ? 'text-maroon' : 'text-stone-500'
        }`}
      >
        {MONTHS[month]}
      </h3>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div
            key={d}
            className="text-center text-[9px] font-bold text-stone-400 py-0.5"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const event = events[dateStr]
          const isToday = isCurrentMonth && today.getDate() === day

          return (
            <div
              key={day}
              title={event?.name}
              className={`
                relative flex items-center justify-center text-[11px] h-6 rounded-md cursor-default select-none
                ${isToday ? 'bg-maroon text-white font-bold' : ''}
                ${event && !isToday ? 'bg-gold/25 text-maroon font-semibold ring-1 ring-gold/40' : ''}
                ${!event && !isToday ? 'text-stone-600 hover:bg-stone-100' : ''}
              `}
            >
              {day}
              {event && !isToday && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold inline-block" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Calendar({ events = DEFAULT_EVENTS }: { events?: EventMap }) {
  const today = new Date()
  const year = today.getFullYear()

  const upcomingEvents = Object.entries(events)
    .filter(([date]) => new Date(date) >= new Date(today.toDateString()))
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 6)

  return (
    <section id="calendar" className="py-16 md:py-24 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-px bg-gold/50 self-center" />
            <div className="mx-4 text-gold uppercase tracking-[0.3em] text-[10px] font-bold">
              Festive Year
            </div>
            <div className="w-12 h-px bg-gold/50 self-center" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-maroon mb-4">
            {year} <span className="text-gold">Calendar</span>
          </h2>
          <p className="text-stone-600 italic text-base md:text-lg max-w-xl mx-auto">
            Cultural celebrations &amp; festive dances throughout the year
          </p>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-5 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-maroon" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-gold/25 ring-1 ring-gold/40" />
              <span>Festive Day</span>
            </div>
          </div>
        </div>

        {/* 12-month grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-12">
          {Array.from({ length: 12 }, (_, i) => (
            <MonthGrid key={i} year={year} month={i} today={today} events={events} />
          ))}
        </div>

        {/* Upcoming events strip */}
        {upcomingEvents.length > 0 && (
          <div className="glass-card rounded-[2rem] p-6 md:p-8">
            <h3 className="font-bold text-maroon uppercase tracking-widest text-xs mb-6">
              Upcoming Celebrations
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map(([date, ev]) => {
                const d = new Date(date)
                return (
                  <div key={date} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#800000] rounded-xl flex flex-col items-center justify-center text-white">
                      <span className="text-[9px] uppercase font-bold leading-none opacity-70">
                        {MONTHS[d.getMonth()].slice(0, 3)}
                      </span>
                      <span className="text-lg font-black leading-none">
                        {d.getDate()}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-maroon text-sm group-hover:text-gold transition-colors">
                        {ev.name}
                      </p>
                      {ev.moveable && (
                        <p className="text-[10px] text-stone-400">
                          approx. date
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <p className="text-[10px] text-stone-400 mt-6 italic">
              * Dates of moveable festivals are approximate and may vary by region and lunar calendar.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

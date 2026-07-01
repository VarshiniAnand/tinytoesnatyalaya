export type EventMap = Record<string, { name: string; moveable?: true }>

export const DEFAULT_EVENTS: EventMap = {
  '2026-01-14': { name: 'Pongal' },
  '2026-01-15': { name: 'Pongal' },
  '2026-01-16': { name: 'Kannum Pongal' },
  '2026-02-17': { name: 'Maha Sivaratri', moveable: true },
  '2026-03-30': { name: 'Ram Navami', moveable: true },
  '2026-04-06': { name: 'Ugadi', moveable: true },
  '2026-08-16': { name: 'Krishna Jayanti', moveable: true },
  '2026-08-22': { name: 'Ganesh Chaturthi', moveable: true },
  '2026-09-23': { name: 'Navaratri Begins', moveable: true },
  '2026-10-02': { name: 'Vijaya Dashami', moveable: true },
  '2026-10-21': { name: 'Diwali', moveable: true },
  '2026-12-25': { name: 'Christmas' },
}

/** Federal filing and payment deadlines (weekend/holiday-adjusted). */
export interface Deadline {
  date: string
  title: string
  detail: string
}

export const DEADLINES: readonly Deadline[] = [
  { date: '2026-04-15', title: '2025 individual returns & Q1 2026 estimates', detail: 'Form 1040 / 4868 and 1040-ES voucher 1' },
  { date: '2026-06-15', title: 'Q2 2026 estimated tax payment', detail: 'Form 1040-ES voucher 2' },
  { date: '2026-09-15', title: 'Q3 2026 estimates & extended 1120-S / 1065', detail: 'Form 1040-ES voucher 3' },
  { date: '2026-10-15', title: 'Extended 2025 individual returns', detail: 'Form 1040 on extension' },
  { date: '2027-01-15', title: 'Q4 2026 estimated tax payment', detail: 'Form 1040-ES voucher 4' },
  { date: '2027-02-01', title: 'W-2 and 1099-NEC filing', detail: 'Furnish and file with SSA / IRS' },
  { date: '2027-03-15', title: '2026 S corporation & partnership returns', detail: 'Form 1120-S / 1065 or extension' },
  { date: '2027-04-15', title: '2026 individual returns & Q1 2027 estimates', detail: 'Form 1040 / 4868 and 1040-ES' },
]

export function upcomingDeadlines(today: Date = new Date(), count = 4): (Deadline & { daysAway: number })[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
  return DEADLINES.map((d) => ({ ...d, daysAway: Math.round((new Date(`${d.date}T00:00:00`).getTime() - start) / 86_400_000) }))
    .filter((d) => d.daysAway >= 0)
    .slice(0, count)
}

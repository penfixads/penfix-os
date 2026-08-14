// Period helpers for the Client Feedback record. Periods are Philippine calendar periods — a
// submission at 11pm on Jul 31 Manila time belongs to July, not August, even though it's
// stored as an August UTC timestamp. PH has no DST, so a constant offset is exact.
const PH_UTC_OFFSET_HOURS = 8
const OFFSET_MS = PH_UTC_OFFSET_HOURS * 60 * 60 * 1000

export type Period = 'week' | 'month'

// 'YYYY-MM' for a month; for a week, the PH-local Monday as 'YYYY-MM-DD'. Using the week's
// start date rather than an ISO week number keeps the key unambiguous and sidesteps the
// year-boundary edge cases ISO weeks bring (week 1 of 2027 starting in December 2026).
export type PeriodKey = string

function toPHLocal(iso: string | Date): Date {
  const t = typeof iso === 'string' ? new Date(iso) : iso
  return new Date(t.getTime() + OFFSET_MS)
}

export function periodKeyOf(iso: string | Date, period: Period): PeriodKey {
  const local = toPHLocal(iso)
  if (period === 'month') return local.toISOString().slice(0, 10).slice(0, 7)
  // Monday-start: getUTCDay() is 0 for Sunday, so Sunday rolls back 6 days, not 0.
  const dayOfWeek = local.getUTCDay()
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const monday = new Date(local.getTime() - daysFromMonday * 24 * 60 * 60 * 1000)
  return monday.toISOString().slice(0, 10)
}

export function currentPeriodKey(period: Period): PeriodKey {
  return periodKeyOf(new Date(), period)
}

export function isValidKey(key: string, period: Period): boolean {
  return period === 'month' ? /^\d{4}-\d{2}$/.test(key) : /^\d{4}-\d{2}-\d{2}$/.test(key)
}

// The UTC instants bounding a PH-local period — the [start, end) range to query on.
export function periodBoundsUTC(key: PeriodKey, period: Period): { startUTC: string; endUTC: string } {
  if (period === 'month') {
    const [year, mon] = key.split('-').map(Number)
    const startLocalMs = Date.UTC(year, mon - 1, 1)
    const endLocalMs = Date.UTC(mon === 12 ? year + 1 : year, mon === 12 ? 0 : mon, 1)
    return {
      startUTC: new Date(startLocalMs - OFFSET_MS).toISOString(),
      endUTC: new Date(endLocalMs - OFFSET_MS).toISOString(),
    }
  }
  const [year, mon, day] = key.split('-').map(Number)
  const startLocalMs = Date.UTC(year, mon - 1, day)
  const endLocalMs = startLocalMs + 7 * 24 * 60 * 60 * 1000
  return {
    startUTC: new Date(startLocalMs - OFFSET_MS).toISOString(),
    endUTC: new Date(endLocalMs - OFFSET_MS).toISOString(),
  }
}

export function periodLabel(key: PeriodKey, period: Period): string {
  if (period === 'month') {
    const [year, mon] = key.split('-').map(Number)
    return new Date(Date.UTC(year, mon - 1, 1)).toLocaleDateString('en-PH', {
      month: 'long', year: 'numeric', timeZone: 'UTC',
    })
  }
  const [year, mon, day] = key.split('-').map(Number)
  const start = new Date(Date.UTC(year, mon - 1, day))
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000)
  const sameMonth = start.getUTCMonth() === end.getUTCMonth()
  const startLabel = start.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', timeZone: 'UTC' })
  const endLabel = end.toLocaleDateString('en-PH', {
    month: sameMonth ? undefined : 'short', day: 'numeric', timeZone: 'UTC',
  })
  return `${startLabel}–${endLabel}, ${end.getUTCFullYear()}`
}

// Short label for the trend strip's x-axis.
export function periodShortLabel(key: PeriodKey, period: Period): string {
  if (period === 'month') return key.slice(5)
  const [year, mon, day] = key.split('-').map(Number)
  return new Date(Date.UTC(year, mon - 1, day)).toLocaleDateString('en-PH', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

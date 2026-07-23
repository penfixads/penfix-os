// Shared by every "did you mean this existing record?" duplicate check (clients, purchases,
// supplier deliveries, overhead expenses) — one Levenshtein implementation instead of one
// per module.

export function normalizeText(s: string): string {
  return (s || '').toLowerCase().trim().replace(/\s+/g, ' ')
}

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let prevDiag = prev[0]
    prev[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = prev[j]
      prev[j] = a[i - 1] === b[j - 1]
        ? prevDiag
        : 1 + Math.min(prevDiag, prev[j], prev[j - 1])
      prevDiag = tmp
    }
  }
  return prev[n]
}

export function textSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(a, b) / maxLen
}

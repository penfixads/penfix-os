// Flags likely-duplicate clients before a new one is saved — this is what the Aurea
// Pangilinan / Alma Manaloto duplicates (merged 2026-07-11) came from: staff typing a
// slightly different spelling instead of finding the client's existing record.

import { normalizeText as normalizeName, textSimilarity as nameSimilarity } from './text-similarity'

export interface ClientCandidate {
  client_id: string
  client_name: string | null
  company_name: string | null
  contact_number?: string | null
  email?: string | null
}

export interface ClientMatch {
  client: ClientCandidate
  score: number
  reason: 'exact' | 'contact' | 'subset' | 'similar'
}

function normalizeContact(s: string | null | undefined): string {
  return (s || '').toLowerCase().trim().replace(/[\s()-]/g, '')
}

function wordSet(s: string): Set<string> {
  return new Set(normalizeName(s).split(' ').filter(Boolean))
}

const SIMILARITY_THRESHOLD = 0.8

// Compares a not-yet-saved client's name/contact info against existing clients and returns
// likely matches, best first. Pass `excludeClientId` when checking edits so a client doesn't
// flag itself.
export function findLikelyDuplicateClients(
  name: string,
  companyName: string | null | undefined,
  candidates: ClientCandidate[],
  opts?: { email?: string | null; contactNumber?: string | null; excludeClientId?: string }
): ClientMatch[] {
  const normName = normalizeName(name)
  const normCompany = normalizeName(companyName || '')
  if (!normName && !normCompany) return []

  const inputWords = wordSet(name)
  const normEmail = normalizeContact(opts?.email)
  const normContact = normalizeContact(opts?.contactNumber)

  const matches: ClientMatch[] = []

  for (const c of candidates) {
    if (opts?.excludeClientId && c.client_id === opts.excludeClientId) continue

    if (normEmail && normalizeContact(c.email) === normEmail) {
      matches.push({ client: c, score: 1, reason: 'contact' })
      continue
    }
    if (normContact && normalizeContact(c.contact_number) === normContact) {
      matches.push({ client: c, score: 1, reason: 'contact' })
      continue
    }

    const cName = normalizeName(c.client_name || '')
    const cCompany = normalizeName(c.company_name || '')

    if (normName && (cName === normName || (normCompany && cCompany === normCompany))) {
      matches.push({ client: c, score: 1, reason: 'exact' })
      continue
    }

    if (normName && cName) {
      const cWords = wordSet(c.client_name || '')
      const smaller = inputWords.size <= cWords.size ? inputWords : cWords
      const larger = inputWords.size <= cWords.size ? cWords : inputWords
      if (smaller.size > 0 && [...smaller].every(w => larger.has(w))) {
        matches.push({ client: c, score: 0.9, reason: 'subset' })
        continue
      }

      const sim = nameSimilarity(normName, cName)
      if (sim >= SIMILARITY_THRESHOLD) {
        matches.push({ client: c, score: sim, reason: 'similar' })
      }
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 5)
}

const SEMAPHORE_API_URL = 'https://api.semaphore.co/api/v4/messages'

export async function sendSMS(number: string, message: string) {
  const apiKey = process.env.SEMAPHORE_API_KEY
  if (!apiKey) throw new Error('SEMAPHORE_API_KEY is not configured.')

  const res = await fetch(SEMAPHORE_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apikey: apiKey, number, message }),
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.message || `Semaphore request failed (${res.status})`)
  }
  return data
}

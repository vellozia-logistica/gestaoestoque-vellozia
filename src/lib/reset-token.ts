// Server-only — do NOT import this in client components
import { createHmac, timingSafeEqual } from 'crypto'

const SECRET = process.env.RESET_TOKEN_SECRET ?? 'dev-secret-change-in-production'
const TTL_MS = 60 * 60 * 1000 // 1 hora

export function createResetToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ email, exp: Date.now() + TTL_MS })).toString('base64url')
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url')
  return `${payload}.${sig}`
}

export function verifyResetToken(token: string): string | null {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return null
    const payload = token.slice(0, dot)
    const sig = token.slice(dot + 1)
    const expected = createHmac('sha256', SECRET).update(payload).digest('base64url')
    if (!timingSafeEqual(Buffer.from(sig, 'base64url'), Buffer.from(expected, 'base64url'))) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { email: string; exp: number }
    if (Date.now() > data.exp) return null
    return data.email
  } catch {
    return null
  }
}

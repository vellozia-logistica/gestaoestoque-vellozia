import { NextResponse } from 'next/server'
import { verifyResetToken } from '@/lib/reset-token'

export async function POST(req: Request) {
  try {
    const { token } = (await req.json()) as { token: string }
    const email = verifyResetToken(token ?? '')
    if (!email) return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
    return NextResponse.json({ email })
  } catch {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }
}

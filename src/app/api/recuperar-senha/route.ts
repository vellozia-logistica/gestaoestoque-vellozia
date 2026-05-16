import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

function gerarSenha(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let senha = ''
  for (let i = 0; i < 8; i++) {
    senha += chars[Math.floor(Math.random() * chars.length)]
  }
  return senha
}

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const user = await prisma.gestaoEstoqueUser.findUnique({ where: { email } })

  // Responde sempre com sucesso para não revelar se o e-mail existe
  if (!user || !user.active) return NextResponse.json({ ok: true })

  const novaSenha = gerarSenha()
  const hash = await bcrypt.hash(novaSenha, 10)

  await prisma.gestaoEstoqueUser.update({
    where: { email },
    data: { passwordHash: hash },
  })

  try {
    const credentials = Buffer.from(
      `${process.env.MAILJET_API_KEY}:${process.env.MAILJET_SECRET_KEY}`
    ).toString('base64')

    const mailjetRes = await fetch('https://api.mailjet.com/v3.1/send', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: process.env.MAILJET_FROM, Name: 'Vellozia' },
            To: [{ Email: email }],
            Subject: 'Sua nova senha — Conciliação Siac x Vellozia',
            HTMLPart: `
              <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #f8f7fa;">
                <div style="background: #4f2e87; border-radius: 12px 12px 0 0; padding: 28px; text-align: center;">
                  <h1 style="color: white; font-size: 20px; margin: 0;">Conciliação Siac x Vellozia</h1>
                  <p style="color: #c4b5fd; font-size: 13px; margin: 6px 0 0;">Vellozia Produtos Hospitalares</p>
                </div>
                <div style="background: white; border-radius: 0 0 12px 12px; padding: 28px;">
                  <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">Olá, <strong>${user.name ?? email}</strong>.</p>
                  <p style="color: #374151; font-size: 14px; margin: 0 0 24px;">
                    Uma nova senha foi gerada para o seu acesso. Utilize-a para entrar no sistema e troque-a assim que possível.
                  </p>
                  <div style="background: #f3f0ff; border: 2px dashed #7c3aed; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                    <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Sua nova senha</p>
                    <p style="color: #4f2e87; font-size: 28px; font-weight: bold; letter-spacing: 4px; margin: 0; font-family: monospace;">${novaSenha}</p>
                  </div>
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    Se você não solicitou a recuperação de senha, ignore este e-mail.
                  </p>
                </div>
                <p style="color: #d1d5db; font-size: 11px; text-align: center; margin-top: 20px;">Vellozia 2026</p>
              </div>
            `,
          },
        ],
      }),
    })

    if (!mailjetRes.ok) {
      const body = await mailjetRes.text()
      console.error('[recuperar-senha] Erro Mailjet:', body)
      return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 })
    }

    console.log(`[recuperar-senha] Email enviado para ${email}`)
  } catch (err) {
    console.error('[recuperar-senha] Erro ao enviar email:', err)
    return NextResponse.json({ error: 'Falha ao enviar email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

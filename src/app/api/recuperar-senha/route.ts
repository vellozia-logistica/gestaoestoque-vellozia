import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createResetToken } from '@/lib/reset-token'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM ?? 'Vellozia Estoque <onboarding@resend.dev>'

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email: string }
    if (!email) return NextResponse.json({ error: 'E-mail obrigatório' }, { status: 400 })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const token = createResetToken(email.toLowerCase().trim())
    const link = `${appUrl}/recuperar-senha?token=${token}`

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Recuperação de senha — Gestão de Estoque Vellozia',
      html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f7fa;font-family:sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
        <tr>
          <td style="background:#4f2e87;padding:32px;text-align:center">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">Gestão de Estoque</h1>
            <p style="margin:4px 0 0;color:#c4b5e0;font-size:13px">Conciliação SIAC × Vellozia</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px">
            <h2 style="margin:0 0 8px;font-size:18px;color:#1f2937">Recuperação de senha</h2>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.6">
              Recebemos uma solicitação para redefinir a senha da sua conta.<br>
              Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.
            </p>
            <a href="${link}"
               style="display:block;text-align:center;background:#4f2e87;color:#fff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600">
              Redefinir minha senha
            </a>
            <p style="margin:20px 0 0;font-size:12px;color:#9ca3af;text-align:center">
              Se você não solicitou isso, ignore este e-mail.
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
            <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center">
              © ${new Date().getFullYear()} Vellozia — Gestão de Estoque
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[recuperar-senha]', err)
    return NextResponse.json({ error: 'Falha ao enviar e-mail' }, { status: 500 })
  }
}

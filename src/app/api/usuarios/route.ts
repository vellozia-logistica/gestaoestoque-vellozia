import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as { role: string }).role !== 'ADMIN') return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const users = await prisma.gestaoEstoqueUser.findMany({
    select: { id: true, email: true, name: true, active: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { email, name, password, role } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email e senha obrigatórios' }, { status: 400 })

  const existing = await prisma.gestaoEstoqueUser.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.gestaoEstoqueUser.create({
    data: { email, name: name || null, passwordHash, role: role === 'ADMIN' ? 'ADMIN' : 'USER' },
    select: { id: true, email: true, name: true, active: true, role: true, createdAt: true },
  })
  return NextResponse.json(user, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id, name, active, role, password } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (name !== undefined) data.name = name
  if (active !== undefined) data.active = active
  if (role !== undefined) data.role = role
  if (password) data.passwordHash = await bcrypt.hash(password, 10)

  const user = await prisma.gestaoEstoqueUser.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, active: true, role: true, createdAt: true },
  })
  return NextResponse.json(user)
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const session = await getServerSession(authOptions)
  const me = await prisma.gestaoEstoqueUser.findUnique({ where: { email: session!.user!.email! } })
  if (me?.id === id) return NextResponse.json({ error: 'Não é possível excluir seu próprio usuário' }, { status: 400 })

  await prisma.gestaoEstoqueUser.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}

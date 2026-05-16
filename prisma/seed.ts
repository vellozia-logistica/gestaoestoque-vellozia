import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@vellozia.com'
  const existing = await prisma.gestaoEstoqueUser.findUnique({ where: { email } })
  if (existing) {
    console.log('Usuário admin já existe.')
    return
  }

  await prisma.gestaoEstoqueUser.create({
    data: {
      email,
      name: 'Administrador',
      passwordHash: await bcrypt.hash('vellozia@2026', 10),
      role: 'ADMIN',
    },
  })
  console.log('Usuário admin criado: admin@vellozia.com / vellozia@2026')
}

main().finally(() => prisma.$disconnect())

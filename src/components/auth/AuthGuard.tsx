'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useStore } from '@/lib/store'
import { UserRole } from '@/types'

const ROUTE_ROLES: Record<string, UserRole[]> = {
  '/': ['usuario', 'desenvolvedor', 'administrador'],
  '/estoque': ['usuario', 'desenvolvedor', 'administrador'],
  '/importar/siac': ['desenvolvedor', 'administrador'],
  '/importar/vellozia': ['desenvolvedor', 'administrador'],
  '/importar/relacionamento': ['desenvolvedor', 'administrador'],
  '/importar/id-produto': ['desenvolvedor', 'administrador'],
  '/relacionamentos': ['administrador'],
  '/admin/usuarios': ['administrador'],
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { currentUser } = useStore()

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login')
      return
    }
    if (currentUser.mustChangePassword && pathname !== '/trocar-senha') {
      router.replace('/trocar-senha')
      return
    }
    const allowed = ROUTE_ROLES[pathname]
    if (allowed && !allowed.includes(currentUser.role)) {
      router.replace('/')
    }
  }, [currentUser, pathname, router])

  if (!currentUser) return null

  const allowed = ROUTE_ROLES[pathname]
  if (allowed && !allowed.includes(currentUser.role)) return null

  return <>{children}</>
}

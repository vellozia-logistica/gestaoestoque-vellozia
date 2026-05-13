'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import AuthGuard from '../auth/AuthGuard'
import { useStore } from '@/lib/store'
import { ALL_TELAS } from '@/lib/sidebarMenu'

const PUBLIC = ['/login', '/trocar-senha']

function TelaGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const currentUser = useStore(s => s.currentUser)

  useEffect(() => {
    if (!currentUser?.telas) return
    const tela = ALL_TELAS.find(t => pathname.startsWith(t.href) && t.href !== '/')
      ?? (pathname === '/' ? ALL_TELAS.find(t => t.href === '/') : undefined)
    if (tela && !currentUser.telas.includes(tela.href)) {
      router.replace('/')
    }
  }, [pathname, currentUser, router])

  return <>{children}</>
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = PUBLIC.includes(pathname)

  if (isPublic) return <>{children}</>

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto min-h-screen" style={{ backgroundColor: '#f8f7fa' }}>
          <TelaGuard>{children}</TelaGuard>
        </main>
      </div>
    </AuthGuard>
  )
}

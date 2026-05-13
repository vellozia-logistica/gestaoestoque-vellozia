'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import AuthGuard from '../auth/AuthGuard'

const PUBLIC = ['/login', '/trocar-senha']

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublic = PUBLIC.includes(pathname)

  if (isPublic) return <>{children}</>

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto min-h-screen" style={{ backgroundColor: '#f8f7fa' }}>
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}

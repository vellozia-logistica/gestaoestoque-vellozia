'use client'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLogin = pathname === '/login'

  if (isLogin) return <>{children}</>

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto min-h-screen" style={{ backgroundColor: '#f8f7fa' }}>
        {children}
      </main>
    </div>
  )
}

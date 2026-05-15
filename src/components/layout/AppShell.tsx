'use client'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto min-h-screen" style={{ backgroundColor: '#f8f7fa' }}>
        {children}
      </main>
    </div>
  )
}

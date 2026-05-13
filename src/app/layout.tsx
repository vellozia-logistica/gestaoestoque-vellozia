import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestão de Estoque - Vellozia',
  description: 'Sistema de gestão e conciliação de estoques SIAC x Vellozia',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ colorScheme: 'light' }}>
      <body className={inter.className} style={{ backgroundColor: '#f8f7fa', color: '#1a1a2e' }}>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto min-h-screen" style={{ backgroundColor: '#f8f7fa' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/layout/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestão de Estoque - Vellozia',
  description: 'Sistema de gestão e conciliação de estoques SIAC x Vellozia',
  icons: { icon: '/logo.jpg', apple: '/logo.jpg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" style={{ colorScheme: 'light' }}>
      <body className={inter.className} style={{ backgroundColor: '#f8f7fa', color: '#1a1a2e' }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}

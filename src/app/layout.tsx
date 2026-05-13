import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppShell from '@/components/layout/AppShell'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gestão de Estoque - Vellozia',
  description: 'Sistema de gestão e conciliação de estoques SIAC x Vellozia',
  metadataBase: new URL('https://gestaoestoque-vellozia-production.up.railway.app'),
  icons: { icon: '/logo.jpg', apple: '/logo.jpg' },
  openGraph: {
    title: 'Gestão de Estoque - Vellozia',
    description: 'Sistema de gestão e conciliação de estoques SIAC x Vellozia',
    url: 'https://gestaoestoque-vellozia-production.up.railway.app',
    siteName: 'Vellozia Gestão de Estoque',
    images: [{ url: '/logo.jpg', width: 200, height: 200, alt: 'Vellozia' }],
    type: 'website',
  },
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

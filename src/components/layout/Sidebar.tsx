'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  GitMerge,
  PackageSearch,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'

const menu = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Importar Arquivos',
    icon: Upload,
    children: [
      { label: 'Estoque SIAC', href: '/importar/siac' },
      { label: 'Estoque Vellozia', href: '/importar/vellozia' },
      { label: 'Relacionamento SIAC x Vellozia', href: '/importar/relacionamento' },
      { label: 'ID Produto x Grupo', href: '/importar/id-produto' },
    ],
  },
  {
    label: 'Relacionamentos',
    href: '/relacionamentos',
    icon: GitMerge,
  },
  {
    label: 'Estoque Consolidado',
    href: '/estoque',
    icon: PackageSearch,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<string[]>(['Importar Arquivos'])

  const toggle = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  return (
    <aside className="w-64 min-h-screen flex flex-col" style={{ backgroundColor: '#4f2e87' }}>
      <div className="px-6 py-5 border-b border-purple-600">
        <h1 className="text-white font-bold text-lg leading-tight">Gestão de<br />Estoque</h1>
        <p className="text-purple-300 text-xs mt-1">Vellozia</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon
          const isOpen = openMenus.includes(item.label)

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition-colors text-sm"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {isOpen && (
                  <div className="ml-7 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                          pathname === child.href
                            ? 'bg-white text-purple-800 font-medium'
                            : 'text-purple-300 hover:bg-purple-700 hover:text-white'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-white text-purple-800 font-medium'
                  : 'text-purple-200 hover:bg-purple-700 hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-6 py-4 border-t border-purple-600">
        <p className="text-purple-400 text-xs">v1.0.0</p>
      </div>
    </aside>
  )
}

'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Upload, GitMerge, PackageSearch,
  ChevronDown, ChevronRight, ChevronLeft, FileText, Tag, Clock,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'

const PURPLE = '#4f2e87'

const menu = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    iconColor: '#a78bfa',
  },
  {
    label: 'Importar Arquivos',
    icon: Upload,
    iconColor: '#60a5fa',
    children: [
      { label: 'Estoque SIAC',              href: '/importar/siac',          icon: FileText, iconColor: '#60a5fa' },
      { label: 'Estoque Vellozia',           href: '/importar/vellozia',      icon: FileText, iconColor: '#4ade80' },
      { label: 'Relacionamento SIAC × Vel.', href: '/importar/relacionamento',icon: GitMerge, iconColor: '#fb923c' },
      { label: 'ID Produto × Grupo',         href: '/importar/id-produto',    icon: Tag,      iconColor: '#c084fc' },
    ],
  },
  {
    label: 'Relacionamentos',
    href: '/relacionamentos',
    icon: GitMerge,
    iconColor: '#fb923c',
  },
  {
    label: 'Estoque Consolidado',
    href: '/estoque',
    icon: PackageSearch,
    iconColor: '#34d399',
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { sidebarCollapsed, setSidebarCollapsed } = useStore()
  const [openMenus, setOpenMenus] = useState<string[]>(['Importar Arquivos'])
  const [sessionTime, setSessionTime] = useState('')

  useEffect(() => {
    const key = 'gestao-session-start'
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, new Date().toISOString())
    }
    const start = new Date(sessionStorage.getItem(key)!)
    const fmt = start.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    setSessionTime(fmt)
  }, [])

  const toggle = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const collapsed = sidebarCollapsed

  return (
    <aside
      className="min-h-screen flex flex-col relative transition-all duration-300"
      style={{ backgroundColor: PURPLE, width: collapsed ? '64px' : '256px', minWidth: collapsed ? '64px' : '256px' }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setSidebarCollapsed(!collapsed)}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute -right-3 top-6 z-50 w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-gray-200 bg-white hover:bg-purple-50 transition-colors"
      >
        <ChevronLeft size={13} style={{ color: PURPLE, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>

      {/* Logo */}
      <div className="px-4 py-5 border-b border-purple-600 overflow-hidden">
        {collapsed ? (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto" style={{ backgroundColor: '#6d3eab' }}>
            <PackageSearch size={18} className="text-white" />
          </div>
        ) : (
          <>
            <h1 className="text-white font-bold text-lg leading-tight whitespace-nowrap">Gestão de Estoque</h1>
            <p className="text-purple-300 text-xs mt-1">Vellozia</p>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
        {menu.map((item) => {
          const Icon = item.icon
          const isOpen = openMenus.includes(item.label)

          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => { if (!collapsed) toggle(item.label) }}
                  title={collapsed ? item.label : undefined}
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition-colors text-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon size={18} style={{ color: item.iconColor, flexShrink: 0 }} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />)}
                </button>

                {!collapsed && isOpen && (
                  <div className="ml-6 mt-1 space-y-0.5">
                    {item.children.map((child) => {
                      const CIcon = child.icon
                      const active = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${
                            active ? 'bg-white font-semibold' : 'text-purple-300 hover:bg-purple-700 hover:text-white'
                          }`}
                          style={active ? { color: PURPLE } : {}}
                        >
                          <CIcon size={14} style={{ color: active ? PURPLE : child.iconColor, flexShrink: 0 }} />
                          <span className="truncate">{child.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href!}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                active ? 'bg-white font-semibold' : 'text-purple-200 hover:bg-purple-700 hover:text-white'
              }`}
              style={active ? { color: PURPLE } : {}}
            >
              <Icon size={18} style={{ color: active ? PURPLE : item.iconColor, flexShrink: 0 }} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer — session time */}
      {!collapsed && sessionTime && (
        <div className="px-4 py-3 border-t border-purple-600">
          <div className="flex items-center gap-1.5 text-purple-400 text-xs">
            <Clock size={11} />
            <span>Sessão iniciada</span>
          </div>
          <p className="text-purple-300 text-xs mt-0.5 font-medium">{sessionTime}</p>
        </div>
      )}
    </aside>
  )
}

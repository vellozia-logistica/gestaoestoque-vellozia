'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Upload, GitMerge, PackageSearch,
  ChevronDown, ChevronRight, ChevronLeft,
  FileText, Tag, Clock, Users, LogOut, AlertTriangle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import { UserRole } from '@/types'

const PURPLE = '#4f2e87'

const menu = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    iconColor: '#a78bfa',
    roles: ['usuario', 'desenvolvedor', 'administrador'] as UserRole[],
  },
  {
    label: 'Importar Arquivos',
    icon: Upload,
    iconColor: '#60a5fa',
    roles: ['desenvolvedor', 'administrador'] as UserRole[],
    children: [
      { label: 'Estoque SIAC',              href: '/importar/siac',           icon: FileText, iconColor: '#60a5fa' },
      { label: 'Estoque Vellozia',           href: '/importar/vellozia',       icon: FileText, iconColor: '#4ade80' },
      { label: 'Relacionamento SIAC × Vel.', href: '/importar/relacionamento', icon: GitMerge, iconColor: '#fb923c' },
      { label: 'ID Produto × Grupo',         href: '/importar/id-produto',     icon: Tag,      iconColor: '#c084fc' },
    ],
  },
  {
    label: 'Relacionamentos',
    href: '/relacionamentos',
    icon: GitMerge,
    iconColor: '#fb923c',
    roles: ['administrador'] as UserRole[],
  },
  {
    label: 'Estoque Consolidado',
    href: '/estoque',
    icon: PackageSearch,
    iconColor: '#34d399',
    roles: ['usuario', 'desenvolvedor', 'administrador'] as UserRole[],
  },
  {
    label: 'Gestão de Usuários',
    href: '/admin/usuarios',
    icon: Users,
    iconColor: '#f59e0b',
    roles: ['administrador'] as UserRole[],
  },
  {
    label: 'Inconsistências',
    href: '/inconsistencias',
    icon: AlertTriangle,
    iconColor: '#f97316',
    roles: ['desenvolvedor', 'administrador'] as UserRole[],
    badge: true,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, setSidebarCollapsed, currentUser, setCurrentUser, inconsistencias } = useStore()
  const inconsistenciasPendentes = inconsistencias.filter(i => !i.resolvido).length
  const [openMenus, setOpenMenus] = useState<string[]>(['Importar Arquivos'])
  const [sessionTime, setSessionTime] = useState('')

  useEffect(() => {
    const key = 'gestao-session-start'
    if (!sessionStorage.getItem(key)) sessionStorage.setItem(key, new Date().toISOString())
    const start = new Date(sessionStorage.getItem(key)!)
    setSessionTime(start.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }))
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  const toggle = (label: string) =>
    setOpenMenus(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])

  const collapsed = sidebarCollapsed
  const role = currentUser?.role ?? 'usuario'

  const visibleMenu = menu.filter(item => item.roles.includes(role))

  return (
    <aside
      className="min-h-screen flex flex-col relative transition-all duration-300 shrink-0"
      style={{ backgroundColor: PURPLE, width: collapsed ? '64px' : '256px' }}
    >
      {/* Toggle */}
      <button
        onClick={() => setSidebarCollapsed(!collapsed)}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        className="absolute -right-3 top-20 z-50 w-6 h-6 rounded-full flex items-center justify-center shadow-md border border-gray-200 bg-white hover:bg-purple-50 transition-colors"
      >
        <ChevronLeft size={13} style={{ color: PURPLE, transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
      </button>

      {/* Logo */}
      <div className="flex items-center justify-center gap-3 px-3 py-4 border-b border-purple-600 overflow-hidden">
        <Image
          src="/logo.jpg"
          alt="Vellozia"
          width={collapsed ? 36 : 44}
          height={collapsed ? 36 : 44}
          className="rounded-lg shrink-0 object-cover"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight whitespace-nowrap">Gestão de Estoque</p>
            <p className="text-purple-300 text-xs">Vellozia</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-hidden">
        {visibleMenu.map((item) => {
          const Icon = item.icon
          const isOpen = openMenus.includes(item.label)

          if ('children' in item && item.children) {
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
                  <div className="ml-6 mt-0.5 space-y-0.5">
                    {item.children.map((child) => {
                      const CIcon = child.icon
                      const active = pathname === child.href
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors ${active ? 'bg-white font-semibold' : 'text-purple-300 hover:bg-purple-700 hover:text-white'}`}
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

          const active = pathname === (item as { href: string }).href
          return (
            <Link
              key={(item as { href: string }).href}
              href={(item as { href: string }).href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-white font-semibold' : 'text-purple-200 hover:bg-purple-700 hover:text-white'}`}
              style={active ? { color: PURPLE } : {}}
            >
              <Icon size={18} style={{ color: active ? PURPLE : item.iconColor, flexShrink: 0 }} />
              {!collapsed && <span className="truncate flex-1">{item.label}</span>}
              {!collapsed && 'badge' in item && item.badge && inconsistenciasPendentes > 0 && (
                <span className="ml-auto text-xs font-bold bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                  {inconsistenciasPendentes}
                </span>
              )}
              {collapsed && 'badge' in item && item.badge && inconsistenciasPendentes > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-purple-600 px-3 py-3">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{ backgroundColor: '#6d3eab' }}>
                {currentUser?.username?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-medium truncate">{currentUser?.username}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </div>
            {sessionTime && (
              <div className="flex items-center gap-1 text-purple-400 text-xs">
                <Clock size={10} />
                <span className="truncate">{sessionTime}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-purple-300 hover:bg-purple-700 hover:text-white transition-colors text-xs"
            >
              <LogOut size={13} />
              Sair
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            title="Sair"
            className="w-full flex justify-center p-2 rounded-lg text-purple-400 hover:bg-purple-700 hover:text-white transition-colors"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  )
}

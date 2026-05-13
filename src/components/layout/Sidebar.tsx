'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, ChevronLeft, LogOut, Settings, Folder, FolderOpen, User as UserIcon } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore, DEFAULT_SIDEBAR_CONFIG } from '@/lib/store'
import { ROLE_LABELS, ROLE_COLORS } from '@/lib/auth'
import { UserRole, SidebarPasta } from '@/types'
import { MENU_ITEMS, MenuItem } from '@/lib/sidebarMenu'
import dynamic from 'next/dynamic'

const SidebarConfigModal = dynamic(() => import('./SidebarConfigModal'), { ssr: false })

const PURPLE = '#4f2e87'

type RenderEntry =
  | { tipo: 'item'; item: MenuItem }
  | { tipo: 'pasta'; pasta: SidebarPasta; itens: MenuItem[] }

function buildRenderList(
  visibleItems: MenuItem[],
  ordem: string[],
  pastas: SidebarPasta[],
  itemPasta: Record<string, string>
): RenderEntry[] {
  const entries: RenderEntry[] = []
  const added = new Set<string>()

  for (const id of ordem) {
    if (id.startsWith('pasta:')) {
      const pastaId = id.slice(6)
      const pasta = pastas.find(p => p.id === pastaId)
      if (!pasta) continue
      const itens = visibleItems.filter(i => itemPasta[i.id] === pastaId && !added.has(i.id))
      itens.forEach(i => added.add(i.id))
      entries.push({ tipo: 'pasta', pasta, itens })
    } else {
      const item = visibleItems.find(i => i.id === id)
      if (item && !added.has(item.id) && !itemPasta[item.id]) {
        entries.push({ tipo: 'item', item })
        added.add(item.id)
      }
    }
  }
  for (const item of visibleItems) {
    if (!added.has(item.id) && !itemPasta[item.id]) {
      entries.push({ tipo: 'item', item })
    }
  }
  return entries
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, setSidebarCollapsed, currentUser, setCurrentUser, inconsistencias, sidebarConfig, setSidebarConfig } = useStore()
  const pendentes = inconsistencias.filter(i => !i.resolvido).length
  const [openMenus, setOpenMenus] = useState<string[]>(['Importar Arquivos'])
  const [openPastas, setOpenPastas] = useState<string[]>(['gestao-id'])
  const [showConfig, setShowConfig] = useState(false)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    router.push('/login')
  }

  const toggle = (label: string) =>
    setOpenMenus(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])

  const togglePasta = (id: string) =>
    setOpenPastas(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

  const collapsed = sidebarCollapsed
  const role = currentUser?.role ?? 'usuario'
  const visibleItems = MENU_ITEMS.filter(i => i.roles.includes(role))

  const config = (sidebarConfig && sidebarConfig.pastas.length > 0)
    ? sidebarConfig
    : DEFAULT_SIDEBAR_CONFIG

  const renderList = buildRenderList(visibleItems, config.ordem, config.pastas, config.itemPasta)

  // Separa: pastas ficam no nav rolável; itens soltos ficam fixados na parte inferior
  const pastaEntries = renderList.filter(e => e.tipo === 'pasta') as Extract<RenderEntry, { tipo: 'pasta' }>[]
  const pinnedItems  = renderList.filter(e => e.tipo === 'item').map(e => (e as Extract<RenderEntry, { tipo: 'item' }>).item)

  const renderItem = (item: MenuItem, nested = false) => {
    const Icon = item.icon

    if (item.children) {
      const isOpen = openMenus.includes(item.label)
      return (
        <div key={item.id}>
          <button
            onClick={() => { if (!collapsed) toggle(item.label) }}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-purple-200 hover:bg-purple-700 hover:text-white transition-colors text-sm ${nested ? 'ml-2' : ''}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon size={18} style={{ color: item.iconColor, flexShrink: 0 }} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </div>
            {!collapsed && (isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />)}
          </button>
          {!collapsed && isOpen && (
            <div className="ml-6 mt-0.5 space-y-0.5">
              {item.children!.map(child => {
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

    const active = pathname === item.href
    return (
      <Link
        key={item.id}
        href={item.href!}
        title={collapsed ? item.label : undefined}
        className={`flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors relative ${active ? 'bg-white font-semibold' : 'text-purple-200 hover:bg-purple-700 hover:text-white'} ${nested ? 'ml-2' : ''}`}
        style={active ? { color: PURPLE } : {}}
      >
        <Icon size={18} style={{ color: active ? PURPLE : item.iconColor, flexShrink: 0 }} />
        {!collapsed && <span className="truncate flex-1">{item.label}</span>}
        {!collapsed && item.badge && pendentes > 0 && (
          <span className="ml-auto text-xs font-bold bg-orange-500 text-white rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
            {pendentes}
          </span>
        )}
        {collapsed && item.badge && pendentes > 0 && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
        )}
      </Link>
    )
  }

  const dataHora = now.toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <>
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

        {/* Nav rolável — somente pastas */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {pastaEntries.map(entry => {
            const { pasta, itens } = entry
            const isOpen = openPastas.includes(pasta.id)
            if (collapsed) {
              return (
                <div key={pasta.id} className="space-y-0.5">
                  {itens.map(item => renderItem(item))}
                </div>
              )
            }
            return (
              <div key={pasta.id}>
                <button
                  onClick={() => togglePasta(pasta.id)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-purple-300 hover:bg-purple-700 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider"
                >
                  {isOpen
                    ? <FolderOpen size={13} className="shrink-0" />
                    : <Folder size={13} className="shrink-0" />}
                  <span className="flex-1 text-left truncate">{pasta.label}</span>
                  {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </button>
                {isOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l border-purple-600 pl-2">
                    {itens.map(item => renderItem(item, true))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Seção fixada — itens soltos + info de sessão */}
        <div className="px-2 pb-2 space-y-0.5 border-t border-purple-700 pt-2">
          {/* Itens não agrupados (ex: Gestão de Usuários) */}
          {pinnedItems.map(item => renderItem(item))}

          {/* Info: usuário logado + data/hora */}
          {!collapsed && (
            <div className="mt-2 rounded-lg px-3 py-2 space-y-1" style={{ backgroundColor: 'rgba(0,0,0,0.18)' }}>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: '#6d3eab' }}>
                  {currentUser?.username?.[0]?.toUpperCase() ?? <UserIcon size={12} />}
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{currentUser?.username}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[role]}`}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>
              </div>
              <p className="text-purple-300 text-xs font-mono">{dataHora}</p>
            </div>
          )}

          {/* Crédito */}
          {!collapsed && (
            <p className="text-center text-white opacity-30 pt-1 leading-tight" style={{ fontSize: '9px' }}>
              Vellozia 2026 · feito por Humberto Brandão Barbosa
            </p>
          )}
        </div>

        {/* Footer — configurar menu + sair */}
        <div className="border-t border-purple-600 px-3 py-2">
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConfig(true)}
                title="Configurar menu"
                className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded-lg text-purple-300 hover:bg-purple-700 hover:text-white transition-colors text-xs"
              >
                <Settings size={13} /> Configurar menu
              </button>
              <button
                onClick={handleLogout}
                title="Sair"
                className="p-1.5 rounded-lg text-purple-400 hover:bg-purple-700 hover:text-white transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                onClick={() => setShowConfig(true)}
                title="Configurar menu"
                className="w-full flex justify-center p-2 rounded-lg text-purple-400 hover:bg-purple-700 hover:text-white transition-colors"
              >
                <Settings size={15} />
              </button>
              <button
                onClick={handleLogout}
                title="Sair"
                className="w-full flex justify-center p-2 rounded-lg text-purple-400 hover:bg-purple-700 hover:text-white transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {showConfig && (
        <SidebarConfigModal
          config={config}
          role={role}
          onSave={(novaConfig) => { setSidebarConfig(novaConfig); setShowConfig(false) }}
          onClose={() => setShowConfig(false)}
        />
      )}
    </>
  )
}

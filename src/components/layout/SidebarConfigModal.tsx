'use client'
import { useState } from 'react'
import { X, ChevronUp, ChevronDown, FolderPlus, Folder, FolderOpen, Trash2, GripVertical, RotateCcw } from 'lucide-react'
import { SidebarConfig, SidebarPasta } from '@/types'
import { MENU_ITEMS, MenuItem } from '@/lib/sidebarMenu'
import { UserRole } from '@/types'
import { DEFAULT_SIDEBAR_CONFIG } from '@/lib/store'

interface Props {
  config: SidebarConfig
  role: UserRole
  onSave: (config: SidebarConfig) => void
  onClose: () => void
}

type EntradaLista =
  | { tipo: 'item'; item: MenuItem }
  | { tipo: 'pasta'; pasta: SidebarPasta }

function buildLista(config: SidebarConfig, visibleItems: MenuItem[]): EntradaLista[] {
  const lista: EntradaLista[] = []
  const adicionados = new Set<string>()

  for (const id of config.ordem) {
    if (id.startsWith('pasta:')) {
      const pastaId = id.slice(6)
      const pasta = config.pastas.find(p => p.id === pastaId)
      if (pasta) lista.push({ tipo: 'pasta', pasta })
    } else {
      const item = visibleItems.find(i => i.id === id)
      if (item && !adicionados.has(id)) {
        lista.push({ tipo: 'item', item })
        adicionados.add(id)
      }
    }
  }

  // itens não incluídos ainda
  for (const item of visibleItems) {
    if (!adicionados.has(item.id)) lista.push({ tipo: 'item', item })
  }

  return lista
}

function buildOrdem(lista: EntradaLista[]): string[] {
  return lista.map(e =>
    e.tipo === 'pasta' ? `pasta:${e.pasta.id}` : e.item.id
  )
}

export default function SidebarConfigModal({ config, role, onSave, onClose }: Props) {
  const visibleItems = MENU_ITEMS.filter(i => i.roles.includes(role))
  const [lista, setLista] = useState<EntradaLista[]>(() => buildLista(config, visibleItems))
  const [itemPasta, setItemPasta] = useState<Record<string, string>>({ ...config.itemPasta })
  const [novaFolderLabel, setNovaFolderLabel] = useState('')
  const [editingPastaId, setEditingPastaId] = useState<string | null>(null)

  const pastas = lista.filter(e => e.tipo === 'pasta').map(e => (e as { tipo: 'pasta'; pasta: SidebarPasta }).pasta)

  const mover = (idx: number, dir: -1 | 1) => {
    const novo = [...lista]
    const destino = idx + dir
    if (destino < 0 || destino >= novo.length) return
    ;[novo[idx], novo[destino]] = [novo[destino], novo[idx]]
    setLista(novo)
  }

  const adicionarPasta = () => {
    const label = novaFolderLabel.trim()
    if (!label) return
    const pasta: SidebarPasta = { id: crypto.randomUUID(), label }
    setLista(prev => [...prev, { tipo: 'pasta', pasta }])
    setNovaFolderLabel('')
  }

  const removerPasta = (pastaId: string) => {
    setLista(prev => prev.filter(e => !(e.tipo === 'pasta' && e.pasta.id === pastaId)))
    setItemPasta(prev => {
      const novo = { ...prev }
      Object.keys(novo).forEach(k => { if (novo[k] === pastaId) delete novo[k] })
      return novo
    })
  }

  const renomearPasta = (pastaId: string, novoLabel: string) => {
    setLista(prev => prev.map(e =>
      e.tipo === 'pasta' && e.pasta.id === pastaId
        ? { tipo: 'pasta', pasta: { ...e.pasta, label: novoLabel } }
        : e
    ))
  }

  const atribuirPasta = (itemId: string, pastaId: string) => {
    setItemPasta(prev => {
      const novo = { ...prev }
      if (pastaId === '') delete novo[itemId]
      else novo[itemId] = pastaId
      return novo
    })
  }

  const handleSalvar = () => {
    const novasPastas = lista
      .filter(e => e.tipo === 'pasta')
      .map(e => (e as { tipo: 'pasta'; pasta: SidebarPasta }).pasta)

    onSave({
      ordem: buildOrdem(lista),
      pastas: novasPastas,
      itemPasta,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-md h-screen bg-white shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200" style={{ backgroundColor: '#4f2e87' }}>
          <div>
            <p className="text-white font-semibold">Configurar menu lateral</p>
            <p className="text-purple-300 text-xs">Reordene módulos e organize em pastas</p>
          </div>
          <button onClick={onClose} className="text-purple-300 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {lista.map((entrada, idx) => {
            if (entrada.tipo === 'pasta') {
              const pasta = entrada.pasta
              return (
                <div key={pasta.id} className="bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <GripVertical size={14} className="text-gray-400 shrink-0" />
                    <FolderOpen size={15} className="text-purple-500 shrink-0" />
                    {editingPastaId === pasta.id ? (
                      <input
                        autoFocus
                        value={pasta.label}
                        onChange={e => renomearPasta(pasta.id, e.target.value)}
                        onBlur={() => setEditingPastaId(null)}
                        onKeyDown={e => e.key === 'Enter' && setEditingPastaId(null)}
                        className="flex-1 text-sm font-medium text-purple-800 bg-white border border-purple-300 rounded px-2 py-0.5 focus:outline-none"
                      />
                    ) : (
                      <span
                        className="flex-1 text-sm font-semibold text-purple-800 cursor-pointer hover:underline"
                        onClick={() => setEditingPastaId(pasta.id)}
                        title="Clique para renomear"
                      >
                        {pasta.label}
                      </span>
                    )}
                    <div className="flex gap-0.5 shrink-0">
                      <button onClick={() => mover(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-purple-100 disabled:opacity-30">
                        <ChevronUp size={13} />
                      </button>
                      <button onClick={() => mover(idx, 1)} disabled={idx === lista.length - 1} className="p-1 rounded hover:bg-purple-100 disabled:opacity-30">
                        <ChevronDown size={13} />
                      </button>
                      <button onClick={() => removerPasta(pasta.id)} className="p-1 rounded hover:bg-red-100 text-red-400">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Itens desta pasta */}
                  {Object.entries(itemPasta).filter(([, v]) => v === pasta.id).map(([itemId]) => {
                    const item = visibleItems.find(i => i.id === itemId)
                    if (!item) return null
                    const Icon = item.icon
                    return (
                      <div key={itemId} className="flex items-center gap-2 mt-1 ml-6 text-xs text-purple-700">
                        <Icon size={12} style={{ color: item.iconColor }} />
                        <span className="flex-1">{item.label}</span>
                        <button
                          onClick={() => atribuirPasta(itemId, '')}
                          className="text-gray-400 hover:text-red-400"
                          title="Remover da pasta"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )
            }

            const item = entrada.item
            const Icon = item.icon
            const pastaAtual = itemPasta[item.id] ?? ''

            return (
              <div key={item.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <GripVertical size={14} className="text-gray-300 shrink-0" />
                <Icon size={15} style={{ color: item.iconColor, flexShrink: 0 }} />
                <span className="flex-1 text-sm text-gray-700 truncate">{item.label}</span>

                {/* Dropdown para atribuir pasta */}
                {pastas.length > 0 && (
                  <select
                    value={pastaAtual}
                    onChange={e => atribuirPasta(item.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded px-1.5 py-0.5 bg-white text-gray-600 focus:outline-none max-w-[110px]"
                  >
                    <option value="">Sem pasta</option>
                    {pastas.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                )}

                <div className="flex gap-0.5 shrink-0">
                  <button onClick={() => mover(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ChevronUp size={13} />
                  </button>
                  <button onClick={() => mover(idx, 1)} disabled={idx === lista.length - 1} className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    <ChevronDown size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nova pasta */}
        <div className="px-4 py-3 border-t border-gray-100">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nome da nova pasta…"
              value={novaFolderLabel}
              onChange={e => setNovaFolderLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && adicionarPasta()}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
            />
            <button
              onClick={adicionarPasta}
              disabled={!novaFolderLabel.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: '#4f2e87' }}
            >
              <FolderPlus size={14} /> Criar pasta
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="px-4 py-3 border-t border-gray-200 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={handleSalvar}
              className="flex-1 py-2 rounded-lg text-white text-sm font-medium"
              style={{ backgroundColor: '#4f2e87' }}
            >
              Salvar configuração
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
          <button
            onClick={() => {
              const defaultLista = buildLista(DEFAULT_SIDEBAR_CONFIG, visibleItems)
              setLista(defaultLista)
              setItemPasta({ ...DEFAULT_SIDEBAR_CONFIG.itemPasta })
            }}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs hover:bg-gray-50"
          >
            <RotateCcw size={12} /> Restaurar configuração padrão
          </button>
        </div>
      </div>
    </div>
  )
}

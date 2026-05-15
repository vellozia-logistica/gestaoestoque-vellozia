import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, SiacItem, VelloziaItem, IdProdutoGrupo, RelacionamentoSiacVellozia, Inconsistencia, SidebarConfig } from '@/types'

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
  ordem: ['pasta:gestao-id'],
  pastas: [{ id: 'gestao-id', label: 'GESTÃO DE ID' }],
  itemPasta: {
    '/': 'gestao-id',
    'Importar Arquivos': 'gestao-id',
    '/estoque': 'gestao-id',
    '/inconsistencias': 'gestao-id',
  },
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      siacItems: [],
      velloziaItems: [],
      idProdutoGrupo: [],
      relacionamentos: [],
      inconsistencias: [],
      sidebarCollapsed: false,
      importadoEmSiac: null,
      importadoEmVellozia: null,
      importadoEmRelacionamento: null,
      importadoEmIdProduto: null,
      sidebarConfig: DEFAULT_SIDEBAR_CONFIG,

      setSiacItems: (items: SiacItem[]) => set({ siacItems: items }),
      addSiacItem: (item: SiacItem) => set(s => ({ siacItems: [...s.siacItems, item] })),
      setVelloziaItems: (items: VelloziaItem[]) => set({ velloziaItems: items }),
      addVelloziaItem: (item: VelloziaItem) => set(s => ({ velloziaItems: [...s.velloziaItems, item] })),
      setIdProdutoGrupo: (items: IdProdutoGrupo[]) => set({ idProdutoGrupo: items }),
      setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => set({ relacionamentos: items }),
      addRelacionamento: (item: RelacionamentoSiacVellozia) => set(s => ({ relacionamentos: [...s.relacionamentos, item] })),

      addInconsistencias: (items: Inconsistencia[]) =>
        set(s => ({ inconsistencias: [...s.inconsistencias.filter(i => i.arquivo !== items[0]?.arquivo), ...items] })),
      resolveInconsistencia: (id: string) =>
        set(s => ({ inconsistencias: s.inconsistencias.map(i => i.id === id ? { ...i, resolvido: true } : i) })),
      clearInconsistencias: (arquivo?: 'siac' | 'vellozia' | 'relacionamento') =>
        set(s => ({ inconsistencias: arquivo ? s.inconsistencias.filter(i => i.arquivo !== arquivo) : [] })),
      limparInconsistenciasPendentes: () =>
        set(s => ({ inconsistencias: s.inconsistencias.filter(i => i.resolvido) })),

      setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
      setSidebarConfig: (config: SidebarConfig) => set({ sidebarConfig: config }),
      setImportadoEmSiac: (v) => set({ importadoEmSiac: v }),
      setImportadoEmVellozia: (v) => set({ importadoEmVellozia: v }),
      setImportadoEmRelacionamento: (v) => set({ importadoEmRelacionamento: v }),
      setImportadoEmIdProduto: (v) => set({ importadoEmIdProduto: v }),
    }),
    { name: 'gestao-estoque-storage' }
  )
)

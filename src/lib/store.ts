import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, SiacItem, VelloziaItem, IdProdutoGrupo, RelacionamentoSiacVellozia } from '@/types'

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      siacItems: [],
      velloziaItems: [],
      idProdutoGrupo: [],
      relacionamentos: [],
      sidebarCollapsed: false,
      setSiacItems: (items: SiacItem[]) => set({ siacItems: items }),
      setVelloziaItems: (items: VelloziaItem[]) => set({ velloziaItems: items }),
      setIdProdutoGrupo: (items: IdProdutoGrupo[]) => set({ idProdutoGrupo: items }),
      setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => set({ relacionamentos: items }),
      setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
    }),
    { name: 'gestao-estoque-storage' }
  )
)

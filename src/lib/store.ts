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
      setSiacItems: (items: SiacItem[]) => set({ siacItems: items }),
      setVelloziaItems: (items: VelloziaItem[]) => set({ velloziaItems: items }),
      setIdProdutoGrupo: (items: IdProdutoGrupo[]) => set({ idProdutoGrupo: items }),
      setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => set({ relacionamentos: items }),
    }),
    { name: 'gestao-estoque-storage' }
  )
)

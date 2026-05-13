import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, SiacItem, VelloziaItem, IdProdutoGrupo, RelacionamentoSiacVellozia, Inconsistencia, User } from '@/types'

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      siacItems: [],
      velloziaItems: [],
      idProdutoGrupo: [],
      relacionamentos: [],
      inconsistencias: [],
      sidebarCollapsed: false,
      users: [],
      currentUser: null,

      setSiacItems: (items: SiacItem[]) => set({ siacItems: items }),
      addSiacItem: (item: SiacItem) => set(s => ({ siacItems: [...s.siacItems, item] })),
      setVelloziaItems: (items: VelloziaItem[]) => set({ velloziaItems: items }),
      addVelloziaItem: (item: VelloziaItem) => set(s => ({ velloziaItems: [...s.velloziaItems, item] })),
      setIdProdutoGrupo: (items: IdProdutoGrupo[]) => set({ idProdutoGrupo: items }),
      setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => set({ relacionamentos: items }),

      addInconsistencias: (items: Inconsistencia[]) =>
        set(s => ({ inconsistencias: [...s.inconsistencias.filter(i => i.arquivo !== items[0]?.arquivo), ...items] })),
      resolveInconsistencia: (id: string) =>
        set(s => ({ inconsistencias: s.inconsistencias.map(i => i.id === id ? { ...i, resolvido: true } : i) })),
      clearInconsistencias: (arquivo?: 'siac' | 'vellozia') =>
        set(s => ({ inconsistencias: arquivo ? s.inconsistencias.filter(i => i.arquivo !== arquivo) : [] })),

      setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
      setCurrentUser: (user: User | null) => set({ currentUser: user }),
      setUsers: (users: User[]) => set({ users }),
      addUser: (user: User) => set(s => ({ users: [...s.users, user] })),
      updateUser: (id: string, updates: Partial<User>) =>
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, ...updates } : u),
          currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
        })),
      deleteUser: (id: string) => set(s => ({ users: s.users.filter(u => u.id !== id) })),
    }),
    { name: 'gestao-estoque-storage' }
  )
)

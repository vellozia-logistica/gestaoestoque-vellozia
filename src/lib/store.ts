import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, SiacItem, VelloziaItem, IdProdutoGrupo, RelacionamentoSiacVellozia, User } from '@/types'

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      siacItems: [],
      velloziaItems: [],
      idProdutoGrupo: [],
      relacionamentos: [],
      sidebarCollapsed: false,
      users: [],
      currentUser: null,

      setSiacItems: (items: SiacItem[]) => set({ siacItems: items }),
      setVelloziaItems: (items: VelloziaItem[]) => set({ velloziaItems: items }),
      setIdProdutoGrupo: (items: IdProdutoGrupo[]) => set({ idProdutoGrupo: items }),
      setRelacionamentos: (items: RelacionamentoSiacVellozia[]) => set({ relacionamentos: items }),
      setSidebarCollapsed: (v: boolean) => set({ sidebarCollapsed: v }),
      setCurrentUser: (user: User | null) => set({ currentUser: user }),
      setUsers: (users: User[]) => set({ users }),
      addUser: (user: User) => set(s => ({ users: [...s.users, user] })),
      updateUser: (id: string, updates: Partial<User>) =>
        set(s => ({
          users: s.users.map(u => u.id === id ? { ...u, ...updates } : u),
          currentUser: s.currentUser?.id === id ? { ...s.currentUser, ...updates } : s.currentUser,
        })),
      deleteUser: (id: string) =>
        set(s => ({ users: s.users.filter(u => u.id !== id) })),
    }),
    { name: 'gestao-estoque-storage' }
  )
)

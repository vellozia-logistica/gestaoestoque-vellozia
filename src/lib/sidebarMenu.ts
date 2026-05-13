import { LayoutDashboard, Upload, GitMerge, PackageSearch, FileText, Tag, Users, AlertTriangle } from 'lucide-react'
import { UserRole } from '@/types'

export interface TelaInfo {
  href: string
  label: string
  groupLabel?: string
  roles: UserRole[]
}

export interface MenuChild {
  label: string
  href: string
  icon: React.ElementType
  iconColor: string
}

export interface MenuItem {
  id: string            // href para folhas, label para grupos
  label: string
  icon: React.ElementType
  iconColor: string
  roles: UserRole[]
  href?: string
  children?: MenuChild[]
  badge?: boolean
}

// Todas as telas controláveis individualmente (hrefs planos)
export const ALL_TELAS: TelaInfo[] = []  // preenchido após MENU_ITEMS

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '/',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    iconColor: '#a78bfa',
    roles: ['usuario', 'desenvolvedor', 'administrador'],
  },
  {
    id: 'Importar Arquivos',
    label: 'Importar Arquivos',
    icon: Upload,
    iconColor: '#60a5fa',
    roles: ['desenvolvedor', 'administrador'],
    children: [
      { label: 'Estoque SIAC',              href: '/importar/siac',           icon: FileText, iconColor: '#60a5fa' },
      { label: 'Estoque Vellozia',           href: '/importar/vellozia',       icon: FileText, iconColor: '#4ade80' },
      { label: 'Relacionamento SIAC × Vel.', href: '/importar/relacionamento', icon: GitMerge, iconColor: '#fb923c' },
      { label: 'ID Produto × Grupo',         href: '/importar/id-produto',     icon: Tag,      iconColor: '#c084fc' },
    ],
  },
  {
    id: '/estoque',
    label: 'Estoque Consolidado',
    href: '/estoque',
    icon: PackageSearch,
    iconColor: '#34d399',
    roles: ['usuario', 'desenvolvedor', 'administrador'],
  },
  {
    id: '/admin/usuarios',
    label: 'Gestão de Usuários',
    href: '/admin/usuarios',
    icon: Users,
    iconColor: '#f59e0b',
    roles: ['administrador'],
  },
  {
    id: '/inconsistencias',
    label: 'Inconsistências',
    href: '/inconsistencias',
    icon: AlertTriangle,
    iconColor: '#f97316',
    roles: ['desenvolvedor', 'administrador'],
    badge: true,
  },
]

// Preenche ALL_TELAS a partir de MENU_ITEMS (executado uma vez no módulo)
MENU_ITEMS.forEach(item => {
  if (item.children) {
    item.children.forEach(c => ALL_TELAS.push({ href: c.href, label: c.label, groupLabel: item.label, roles: item.roles }))
  } else if (item.href) {
    ALL_TELAS.push({ href: item.href, label: item.label, roles: item.roles })
  }
})

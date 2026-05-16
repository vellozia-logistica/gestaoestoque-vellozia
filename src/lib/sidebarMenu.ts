import { LayoutDashboard, Upload, GitMerge, PackageSearch, FileText, Tag, AlertTriangle, Users } from 'lucide-react'

export interface MenuChild {
  label: string
  href: string
  icon: React.ElementType
  iconColor: string
}

export interface MenuItem {
  id: string
  label: string
  icon: React.ElementType
  iconColor: string
  href?: string
  children?: MenuChild[]
  badge?: boolean
  adminOnly?: boolean
}

export const ALL_TELAS: { href: string; label: string; groupLabel?: string }[] = []

export const MENU_ITEMS: MenuItem[] = [
  {
    id: '/',
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    iconColor: '#a78bfa',
  },
  {
    id: 'Importar Arquivos',
    label: 'Importar Arquivos',
    icon: Upload,
    iconColor: '#60a5fa',
    children: [
      { label: 'Estoque SIAC',               href: '/importar/siac',           icon: FileText, iconColor: '#60a5fa' },
      { label: 'Estoque Vellozia',            href: '/importar/vellozia',       icon: FileText, iconColor: '#4ade80' },
      { label: 'Relacionamento SIAC × Vel.',  href: '/importar/relacionamento', icon: GitMerge, iconColor: '#fb923c' },
      { label: 'ID Produto × Grupo',          href: '/importar/id-produto',     icon: Tag,      iconColor: '#c084fc' },
    ],
  },
  {
    id: '/estoque',
    label: 'Estoque Consolidado',
    href: '/estoque',
    icon: PackageSearch,
    iconColor: '#34d399',
  },
  {
    id: '/inconsistencias',
    label: 'Inconsistências',
    href: '/inconsistencias',
    icon: AlertTriangle,
    iconColor: '#f97316',
    badge: true,
  },
  {
    id: '/usuarios',
    label: 'Usuários',
    href: '/usuarios',
    icon: Users,
    iconColor: '#a78bfa',
    adminOnly: true,
  },
]

MENU_ITEMS.forEach(item => {
  if (item.children) {
    item.children.forEach(c => ALL_TELAS.push({ href: c.href, label: c.label, groupLabel: item.label }))
  } else if (item.href) {
    ALL_TELAS.push({ href: item.href, label: item.label })
  }
})

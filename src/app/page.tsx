'use client'
import Link from 'next/link'
import { Upload, GitMerge, PackageSearch, FileText, CheckCircle2, Circle } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function Dashboard() {
  const { siacItems, velloziaItems, idProdutoGrupo, relacionamentos } = useStore()

  const cards = [
    {
      title: 'Estoque SIAC',
      desc: 'Goiânia',
      count: siacItems.length,
      unit: 'registros',
      href: '/importar/siac',
      icon: FileText,
      accent: '#2563eb',
      bg: '#eff6ff',
      border: '#bfdbfe',
    },
    {
      title: 'Estoque Vellozia',
      desc: 'Todas as filiais',
      count: velloziaItems.length,
      unit: 'registros',
      href: '/importar/vellozia',
      icon: FileText,
      accent: '#16a34a',
      bg: '#f0fdf4',
      border: '#bbf7d0',
    },
    {
      title: 'Relacionamentos',
      desc: 'ID Produto · Grupo · SIAC',
      count: idProdutoGrupo.length + relacionamentos.length,
      unit: 'mapeamentos',
      href: '/relacionamentos',
      icon: GitMerge,
      accent: '#ea580c',
      bg: '#fff7ed',
      border: '#fed7aa',
    },
    {
      title: 'Estoque Consolidado',
      desc: 'Visão unificada + divergências',
      count: null,
      unit: '',
      href: '/estoque',
      icon: PackageSearch,
      accent: '#4f2e87',
      bg: '#faf5ff',
      border: '#e9d5ff',
    },
  ]

  const status = [
    { label: 'Estoque SIAC (Goiânia)', ok: siacItems.length > 0, href: '/importar/siac' },
    { label: 'Estoque Vellozia (filiais)', ok: velloziaItems.length > 0, href: '/importar/vellozia' },
    { label: 'ID Produto × Grupo Produto', ok: idProdutoGrupo.length > 0, href: '/importar/id-produto' },
    { label: 'Relacionamento SIAC × Vellozia', ok: relacionamentos.length > 0, href: '/importar/relacionamento' },
  ]

  const allLoaded = status.every(s => s.ok)
  const loadedCount = status.filter(s => s.ok).length

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: '#1a1a2e' }}>Dashboard</h1>
        <p className="text-gray-500 mt-1">Gestão e conciliação de estoques SIAC × Vellozia</p>
      </div>

      {/* Banner de pendência */}
      {!allLoaded && (
        <div className="mb-6 p-4 rounded-xl border flex items-start gap-3"
          style={{ backgroundColor: '#fffbeb', borderColor: '#fde68a' }}>
          <Upload size={18} className="mt-0.5 shrink-0" style={{ color: '#d97706' }} />
          <div>
            <p className="font-medium text-sm" style={{ color: '#92400e' }}>
              {loadedCount} de 4 arquivos importados
            </p>
            <p className="text-sm mt-0.5" style={{ color: '#b45309' }}>
              Importe todos os arquivos para habilitar o estoque consolidado.
            </p>
            <Link href="/importar/siac" className="text-sm font-medium underline mt-1 inline-block" style={{ color: '#92400e' }}>
              Ir para importação →
            </Link>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-xl p-5 border transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ backgroundColor: card.bg, borderColor: card.border }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: card.accent + '18' }}>
                  <Icon size={20} style={{ color: card.accent }} />
                </div>
              </div>
              <p className="font-semibold text-gray-800">{card.title}</p>
              <p className="text-xs text-gray-500 mt-0.5 mb-3">{card.desc}</p>
              {card.count !== null ? (
                <p className="text-2xl font-bold" style={{ color: card.accent }}>
                  {card.count.toLocaleString('pt-BR')}
                  <span className="text-sm font-normal text-gray-400 ml-1">{card.unit}</span>
                </p>
              ) : (
                <p className="text-sm font-semibold" style={{ color: card.accent }}>
                  {allLoaded ? 'Ver estoque →' : 'Aguardando importação'}
                </p>
              )}
            </Link>
          )
        })}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Status dos Arquivos</h2>
          <ul className="space-y-3">
            {status.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="flex items-center gap-3 group">
                  {item.ok
                    ? <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                    : <Circle size={18} className="text-gray-300 shrink-0" />
                  }
                  <span className={`text-sm flex-1 ${item.ok ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.label}
                  </span>
                  {item.ok
                    ? <span className="text-xs font-medium text-green-600">Importado</span>
                    : <span className="text-xs text-gray-400 group-hover:underline">Importar →</span>
                  }
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Progresso</span>
              <span>{loadedCount}/4</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${(loadedCount / 4) * 100}%`, backgroundColor: '#4f2e87' }}
              />
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Ações Rápidas</h2>
          <div className="space-y-1">
            {[
              { href: '/importar/siac', label: 'Importar Estoque SIAC', icon: Upload },
              { href: '/importar/vellozia', label: 'Importar Estoque Vellozia', icon: Upload },
              { href: '/importar/id-produto', label: 'Importar ID Produto × Grupo', icon: Upload },
              { href: '/importar/relacionamento', label: 'Importar Relacionamento', icon: Upload },
              { href: '/estoque', label: 'Ver Estoque Consolidado', icon: PackageSearch },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-purple-50 transition-colors text-sm text-gray-600 hover:text-purple-700 group"
              >
                <Icon size={15} className="text-gray-400 group-hover:text-purple-500 shrink-0" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

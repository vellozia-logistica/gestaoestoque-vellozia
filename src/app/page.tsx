'use client'
import Link from 'next/link'
import { Upload, GitMerge, PackageSearch, FileText } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function Dashboard() {
  const { siacItems, velloziaItems, idProdutoGrupo, relacionamentos } = useStore()

  const cards = [
    {
      title: 'Estoque SIAC',
      desc: 'Relatório de estoque de Goiânia',
      count: siacItems.length,
      unit: 'registros',
      href: '/importar/siac',
      icon: FileText,
      color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
      title: 'Estoque Vellozia',
      desc: 'Relatório de todas as filiais',
      count: velloziaItems.length,
      unit: 'registros',
      href: '/importar/vellozia',
      icon: FileText,
      color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
      title: 'Relacionamentos',
      desc: 'ID Produto × Grupo × SIAC',
      count: idProdutoGrupo.length + relacionamentos.length,
      unit: 'mapeamentos',
      href: '/relacionamentos',
      icon: GitMerge,
      color: 'bg-orange-50 text-orange-600 border-orange-200',
    },
    {
      title: 'Estoque Consolidado',
      desc: 'Visão unificada de todas as filiais',
      count: null,
      unit: '',
      href: '/estoque',
      icon: PackageSearch,
      color: 'bg-purple-50 text-purple-600 border-purple-200',
    },
  ]

  const allLoaded = siacItems.length > 0 && velloziaItems.length > 0 && idProdutoGrupo.length > 0 && relacionamentos.length > 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Gestão e conciliação de estoques SIAC × Vellozia</p>
      </div>

      {!allLoaded && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <Upload className="text-yellow-500 mt-0.5 shrink-0" size={18} />
          <div>
            <p className="text-yellow-800 font-medium text-sm">Arquivos pendentes de importação</p>
            <p className="text-yellow-700 text-sm mt-0.5">
              Importe os 4 arquivos CSV para habilitar o estoque consolidado.
            </p>
            <Link href="/importar/siac" className="text-yellow-800 underline text-sm font-medium mt-1 inline-block">
              Ir para importação →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.href}
              href={card.href}
              className={`border rounded-xl p-5 hover:shadow-md transition-shadow ${card.color}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800">{card.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{card.desc}</p>
                </div>
                <Icon size={20} />
              </div>
              <div className="mt-4">
                {card.count !== null ? (
                  <p className="text-2xl font-bold text-gray-800">
                    {card.count.toLocaleString('pt-BR')}
                    <span className="text-sm font-normal text-gray-500 ml-1">{card.unit}</span>
                  </p>
                ) : (
                  <p className="text-sm font-medium" style={{ color: '#4f2e87' }}>
                    {allLoaded ? 'Ver estoque →' : 'Aguardando importação'}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Status dos Arquivos</h2>
          <ul className="space-y-2 text-sm">
            {[
              { label: 'Estoque SIAC (Goiânia)', ok: siacItems.length > 0 },
              { label: 'Estoque Vellozia (filiais)', ok: velloziaItems.length > 0 },
              { label: 'ID Produto × Grupo Produto', ok: idProdutoGrupo.length > 0 },
              { label: 'Relacionamento SIAC × Vellozia', ok: relacionamentos.length > 0 },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={item.ok ? 'text-gray-700' : 'text-gray-400'}>{item.label}</span>
                {item.ok && <span className="ml-auto text-green-600 text-xs">✓ Importado</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-700 mb-3">Ações Rápidas</h2>
          <div className="space-y-2">
            <Link href="/importar/siac" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
              <Upload size={16} className="text-purple-500" />
              Importar Estoque SIAC
            </Link>
            <Link href="/importar/vellozia" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
              <Upload size={16} className="text-purple-500" />
              Importar Estoque Vellozia
            </Link>
            <Link href="/estoque" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-sm text-gray-600">
              <PackageSearch size={16} className="text-purple-500" />
              Ver Estoque Consolidado
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

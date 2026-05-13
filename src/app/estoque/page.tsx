'use client'
import { useStore } from '@/lib/store'
import { buildEstoqueConsolidado, getFiliais } from '@/lib/estoque'
import { useState, useMemo } from 'react'
import { Search, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function EstoqueConsolidado() {
  const { siacItems, velloziaItems, idProdutoGrupo, relacionamentos } = useStore()
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'divergentes'>('todos')

  const allLoaded = siacItems.length > 0 && velloziaItems.length > 0 && idProdutoGrupo.length > 0 && relacionamentos.length > 0

  const estoque = useMemo(
    () => (allLoaded ? buildEstoqueConsolidado(siacItems, velloziaItems, idProdutoGrupo, relacionamentos) : []),
    [siacItems, velloziaItems, idProdutoGrupo, relacionamentos, allLoaded]
  )

  const filiais = useMemo(() => getFiliais(velloziaItems), [velloziaItems])

  const divergentes = estoque.filter(e => e.divergencia).length

  const filtered = useMemo(() => {
    let list = filtro === 'divergentes' ? estoque.filter(e => e.divergencia) : estoque
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        e =>
          e.descricao.toLowerCase().includes(q) ||
          String(e.idSiac).includes(q) ||
          String(e.grupoProduto).includes(q) ||
          e.lote.toLowerCase().includes(q)
      )
    }
    return list
  }, [estoque, filtro, search])

  if (!allLoaded) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Estoque Consolidado</h1>
          <p className="text-gray-500 mt-1">Todos os estoques Vellozia + Goiânia (SIAC)</p>
        </div>
        <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-yellow-500 mt-0.5 shrink-0" size={18} />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-2">Importe todos os 4 arquivos para visualizar o estoque consolidado:</p>
            <ul className="space-y-1">
              {[
                { label: 'Estoque SIAC (Goiânia)', ok: siacItems.length > 0, href: '/importar/siac' },
                { label: 'Estoque Vellozia (filiais)', ok: velloziaItems.length > 0, href: '/importar/vellozia' },
                { label: 'ID Produto × Grupo Produto', ok: idProdutoGrupo.length > 0, href: '/importar/id-produto' },
                { label: 'Relacionamento SIAC × Vellozia', ok: relacionamentos.length > 0, href: '/importar/relacionamento' },
              ].map(item => (
                <li key={item.href} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.ok ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {item.ok ? (
                    <span className="text-green-700">{item.label}</span>
                  ) : (
                    <Link href={item.href} className="underline text-yellow-800">{item.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estoque Consolidado</h1>
        <p className="text-gray-500 mt-1">Todos os estoques Vellozia + Goiânia (SIAC) · {estoque.length} registros</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        {divergentes > 0 ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle size={15} />
            <span><strong>{divergentes}</strong> divergências encontradas</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <CheckCircle2 size={15} />
            <span>Nenhuma divergência</span>
          </div>
        )}

        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-4 py-2 ${filtro === 'todos' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Todos ({estoque.length})
          </button>
          <button
            onClick={() => setFiltro('divergentes')}
            className={`px-4 py-2 border-l border-gray-200 ${filtro === 'divergentes' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Divergentes ({divergentes})
          </button>
        </div>

        <div className="relative ml-auto w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto, lote, código…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
              <th className="px-4 py-3 text-left font-medium">Produto</th>
              <th className="px-4 py-3 text-left font-medium">Lote</th>
              <th className="px-4 py-3 text-left font-medium">Vencimento</th>
              <th className="px-4 py-3 text-right font-medium">Goiânia (SIAC)</th>
              {filiais.map(f => (
                <th key={f} className="px-4 py-3 text-right font-medium">{f}</th>
              ))}
              <th className="px-4 py-3 text-right font-medium">Total Vellozia</th>
              <th className="px-4 py-3 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const goianiaVellozia = item.filiais['Goiânia'] ?? item.filiais['GOIANIA'] ?? item.filiais['Goiania'] ?? 0
              return (
                <tr key={i} className={`${item.divergencia ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-2">
                    <div className="font-medium text-gray-800 truncate max-w-xs">{item.descricao}</div>
                    <div className="text-xs text-gray-400 font-mono">
                      Grupo {item.grupoProduto} · SIAC {item.idSiac}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-600 font-mono text-xs">{item.lote}</td>
                  <td className="px-4 py-2 text-gray-600">{item.vencimento}</td>
                  <td className="px-4 py-2 text-right font-medium text-blue-700">
                    {item.estoqueGoiania.toLocaleString('pt-BR')}
                  </td>
                  {filiais.map(f => (
                    <td key={f} className="px-4 py-2 text-right text-gray-700">
                      {(item.filiais[f] ?? 0).toLocaleString('pt-BR')}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-right font-medium text-gray-800">
                    {item.totalVellozia.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {item.divergencia ? (
                      <span title={`SIAC: ${item.estoqueGoiania} · Vellozia Goiânia: ${goianiaVellozia}`}>
                        <AlertTriangle size={16} className="text-red-500 inline" />
                      </span>
                    ) : (
                      <CheckCircle2 size={16} className="text-green-500 inline" />
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12">
            {search ? `Nenhum resultado para "${search}"` : 'Nenhum registro'}
          </p>
        )}
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-gray-400 mt-2 text-right">
          {filtered.length} de {estoque.length} registros
        </p>
      )}
    </div>
  )
}

'use client'
import { useStore } from '@/lib/store'
import { buildEstoqueConsolidado, getFiliais } from '@/lib/estoque'
import { downloadExcel, downloadJSON } from '@/lib/excel'
import { useState, useMemo } from 'react'
import { Search, AlertCircle, AlertTriangle, CheckCircle2, FileDown, FileJson } from 'lucide-react'
import Link from 'next/link'

export default function EstoqueConsolidado() {
  const { siacItems, velloziaItems, idProdutoGrupo, relacionamentos } = useStore()
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState<'todos' | 'divergentes'>('todos')
  const [filialExport, setFilialExport] = useState<string>('todas')

  const allLoaded = siacItems.length > 0 && velloziaItems.length > 0 && idProdutoGrupo.length > 0 && relacionamentos.length > 0

  const estoque = useMemo(
    () => (allLoaded ? buildEstoqueConsolidado(siacItems, velloziaItems, idProdutoGrupo, relacionamentos) : []),
    [siacItems, velloziaItems, idProdutoGrupo, relacionamentos, allLoaded]
  )

  const filiais = useMemo(() => getFiliais(velloziaItems), [velloziaItems])

  // Goiânia separada das demais filiais para colunas dedicadas
  const goianiaKey = filiais.find(f => f.toLowerCase().includes('goi')) ?? ''
  const outrasFiliais = filiais.filter(f => !f.toLowerCase().includes('goi'))

  // Filiais exibidas na tabela e no export (respeitam o seletor)
  const displayFiliais = filialExport === 'todas'
    ? outrasFiliais
    : outrasFiliais.filter(f => f === filialExport)

  const divergentes = estoque.filter(e => e.divergencia).length

  const filtered = useMemo(() => {
    let list = filtro === 'divergentes' ? estoque.filter(e => e.divergencia) : estoque
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        e.descricao.toLowerCase().includes(q) ||
        String(e.idSiac).includes(q) ||
        String(e.grupoProduto).includes(q) ||
        e.lote.toLowerCase().includes(q)
      )
    }
    return list
  }, [estoque, filtro, search])

  const exportData = useMemo(() => {
    if (filialExport === 'todas') return filtered
    return filtered.map(e => ({
      ...e,
      filiais: { [filialExport]: e.filiais[filialExport] ?? 0 },
      totalVellozia: e.filiais[filialExport] ?? 0,
    }))
  }, [filtered, filialExport])

  const handleExportExcel = () => {
    const headers = [
      'Produto', 'Grupo', 'ID SIAC', 'Lote', 'Vencimento',
      'Goiânia (SIAC)', 'Goiânia (Vellozia)', 'Diferença',
      ...displayFiliais,
      'Total Vellozia', 'Divergência',
    ]
    const rows = exportData.map(e => {
      const gv = goianiaKey ? (e.filiais[goianiaKey] ?? 0) : 0
      return [
        e.descricao, e.grupoProduto, e.idSiac, e.lote, e.vencimento,
        e.estoqueGoiania, gv, e.estoqueGoiania - gv,
        ...displayFiliais.map(f => e.filiais[f] ?? 0),
        e.totalVellozia, e.divergencia ? 'Sim' : 'Não',
      ]
    })
    const label = filialExport === 'todas' ? 'todas_filiais' : filialExport.toLowerCase().replace(/\s+/g, '_')
    downloadExcel([headers, ...rows], `estoque_consolidado_${label}.xlsx`, 'Estoque Consolidado')
  }

  const handleExportJSON = () => {
    const label = filialExport === 'todas' ? 'todas_filiais' : filialExport.toLowerCase().replace(/\s+/g, '_')
    downloadJSON(exportData, `estoque_consolidado_${label}.json`)
  }

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
                  {item.ok
                    ? <span className="text-green-700">{item.label}</span>
                    : <Link href={item.href} className="underline text-yellow-800">{item.label}</Link>}
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
        <p className="text-gray-500 mt-1">{estoque.length} registros · todas as filiais + Goiânia (SIAC)</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Status badge */}
        {divergentes > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle size={14} />
            <span><strong>{divergentes}</strong> divergências</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            <CheckCircle2 size={14} />
            <span>Sem divergências</span>
          </div>
        )}

        {/* Filtro todos / divergentes */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
          <button
            onClick={() => setFiltro('todos')}
            className={`px-3 py-1.5 ${filtro === 'todos' ? 'text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            style={filtro === 'todos' ? { backgroundColor: '#4f2e87' } : {}}
          >
            Todos ({estoque.length})
          </button>
          <button
            onClick={() => setFiltro('divergentes')}
            className={`px-3 py-1.5 border-l border-gray-200 ${filtro === 'divergentes' ? 'bg-red-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
          >
            Divergentes ({divergentes})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produto, lote…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 w-56"
          />
        </div>

        {/* Export controls */}
        <div className="ml-auto flex items-center gap-2">
          <select
            value={filialExport}
            onChange={e => setFilialExport(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white text-gray-700"
          >
            <option value="todas">Todas as filiais (visualizar todas)</option>
            {filiais.map(f => <option key={f} value={f}>{f}</option>)}
          </select>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#16a34a' }}
            title="Exportar para Excel"
          >
            <FileDown size={15} />
            Excel
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#2563eb' }}
            title="Exportar para JSON"
          >
            <FileJson size={15} />
            JSON
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
              <th className="px-3 py-2.5 text-left font-medium">Produto</th>
              <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">Lote</th>
              <th className="px-2 py-2.5 text-left font-medium whitespace-nowrap">Vencimento</th>
              <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">Goi. SIAC</th>
              <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">Goi. Vellozia</th>
              <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">Diferença</th>
              {displayFiliais.map(f => (
                <th key={f} className="px-2 py-2.5 text-right font-medium whitespace-nowrap">{f}</th>
              ))}
              <th className="px-2 py-2.5 text-right font-medium whitespace-nowrap">Total Vell.</th>
              <th className="px-2 py-2.5 text-center font-medium">OK</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => {
              const goianiaVellozia = goianiaKey ? (item.filiais[goianiaKey] ?? 0) : 0
              const diferenca = item.estoqueGoiania - goianiaVellozia
              return (
                <tr key={i} className={item.divergencia ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 py-1.5 max-w-[180px]">
                    <div className="font-medium text-gray-800 truncate">{item.descricao}</div>
                    <div className="text-gray-400 font-mono" style={{ fontSize: '10px' }}>G{item.grupoProduto}·S{item.idSiac}</div>
                  </td>
                  <td className="px-2 py-1.5 text-gray-600 font-mono whitespace-nowrap">{item.lote}</td>
                  <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">{item.vencimento}</td>
                  <td className="px-2 py-1.5 text-right font-medium text-blue-700 whitespace-nowrap">
                    {item.estoqueGoiania.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium text-green-700 whitespace-nowrap">
                    {goianiaVellozia.toLocaleString('pt-BR')}
                  </td>
                  <td className={`px-2 py-1.5 text-right font-bold whitespace-nowrap ${diferenca === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {diferenca > 0 ? '+' : ''}{diferenca.toLocaleString('pt-BR')}
                  </td>
                  {displayFiliais.map(f => (
                    <td key={f} className="px-2 py-1.5 text-right text-gray-700 whitespace-nowrap">
                      {(item.filiais[f] ?? 0).toLocaleString('pt-BR')}
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right font-medium text-gray-800 whitespace-nowrap">
                    {item.totalVellozia.toLocaleString('pt-BR')}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {item.divergencia ? (
                      <AlertTriangle size={13} className="text-red-500 inline" />
                    ) : (
                      <CheckCircle2 size={13} className="text-green-500 inline" />
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
          Exibindo {filtered.length} de {estoque.length} registros
          {filialExport !== 'todas' && ` · exportação filtrada: ${filialExport}`}
        </p>
      )}
    </div>
  )
}

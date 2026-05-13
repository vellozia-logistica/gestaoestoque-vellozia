'use client'
import { useStore } from '@/lib/store'
import { useState } from 'react'
import { Search, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function Relacionamentos() {
  const { idProdutoGrupo, relacionamentos } = useStore()
  const [search, setSearch] = useState('')

  const allLoaded = idProdutoGrupo.length > 0 && relacionamentos.length > 0

  const relMap = new Map(relacionamentos.map(r => [r.grupoProduto, r]))

  const grupos = [...new Map(idProdutoGrupo.map(i => [i.grupoProdutoId, i.grupoProdutoId])).keys()]
    .map(grupoProdutoId => {
      const produtos = idProdutoGrupo.filter(i => i.grupoProdutoId === grupoProdutoId)
      const rel = relMap.get(grupoProdutoId)
      return { grupoProdutoId, produtos, rel }
    })
    .filter(g => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        String(g.grupoProdutoId).includes(q) ||
        String(g.rel?.idSiac ?? '').includes(q) ||
        (g.rel?.descricaoVellozia ?? '').toLowerCase().includes(q) ||
        g.produtos.some(p => p.descricaoProduto.toLowerCase().includes(q))
      )
    })

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Relacionamentos</h1>
        <p className="text-gray-500 mt-1">Visão completa: ID Produto → Grupo Produto → ID SIAC</p>
      </div>

      {!allLoaded && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-yellow-500 mt-0.5 shrink-0" size={18} />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Dados pendentes</p>
            <p className="mt-0.5">
              {idProdutoGrupo.length === 0 && (
                <Link href="/importar/id-produto" className="underline">Importe o arquivo ID Produto × Grupo Produto</Link>
              )}
              {idProdutoGrupo.length === 0 && relacionamentos.length === 0 && ' e '}
              {relacionamentos.length === 0 && (
                <Link href="/importar/relacionamento" className="underline">Importe o Relacionamento SIAC × Vellozia</Link>
              )}
              .
            </p>
          </div>
        </div>
      )}

      {allLoaded && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por descrição, grupo, ID SIAC…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <span className="text-sm text-gray-500">{grupos.length} grupos</span>
          </div>

          <div className="space-y-3">
            {grupos.map(g => (
              <div key={g.grupoProdutoId} className="border border-gray-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center gap-4 px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Grupo Produto</span>
                    <span className="ml-2 font-mono font-semibold text-gray-800">{g.grupoProdutoId}</span>
                  </div>
                  <span className="text-gray-300">→</span>
                  <div>
                    <span className="text-xs text-gray-400 uppercase tracking-wide">ID SIAC</span>
                    {g.rel ? (
                      <span className="ml-2 font-mono font-semibold text-blue-700">{g.rel.idSiac}</span>
                    ) : (
                      <span className="ml-2 text-red-400 text-xs">sem mapeamento</span>
                    )}
                  </div>
                  {g.rel && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-sm text-gray-700 font-medium">{g.rel.descricaoVellozia}</span>
                    </>
                  )}
                  <span className="ml-auto text-xs text-gray-400">{g.produtos.length} IDs</span>
                </div>
                <div className="px-4 py-2 flex flex-wrap gap-2">
                  {g.produtos.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-100">
                      <span className="font-mono">{p.id}</span>
                      <span className="text-purple-400">·</span>
                      <span>{p.descricaoProduto}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {grupos.length === 0 && (
              <p className="text-center text-gray-400 py-12">Nenhum resultado para &ldquo;{search}&rdquo;</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

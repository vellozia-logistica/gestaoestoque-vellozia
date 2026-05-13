'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { parseRelacionamentoCSV } from '@/lib/parsers/relacionamento'
import { RelacionamentoSiacVellozia } from '@/types'
import { Plus, Pencil, Trash2, Check, X, Search, RotateCcw, Upload, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'
import Link from 'next/link'

const EMPTY: RelacionamentoSiacVellozia = { grupoProduto: 0, idSiac: 0, descricaoVellozia: '' }

export default function GerenciarRelacionamento() {
  const { relacionamentos, setRelacionamentos, addInconsistencias, clearInconsistencias } = useStore()
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [importBanner, setImportBanner] = useState<{ ok: number; erros: number } | null>(null)
  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState<RelacionamentoSiacVellozia>(EMPTY)
  const [addMode, setAddMode] = useState(false)
  const [newRow, setNewRow] = useState<RelacionamentoSiacVellozia>(EMPTY)

  const filtered = useMemo(() => {
    if (!search) return relacionamentos
    const q = search.toLowerCase()
    return relacionamentos.filter(r =>
      String(r.grupoProduto).includes(q) ||
      String(r.idSiac).includes(q) ||
      r.descricaoVellozia.toLowerCase().includes(q)
    )
  }, [relacionamentos, search])

  const handleParse = (content: string) => {
    const { items, inconsistencias } = parseRelacionamentoCSV(content)
    setRelacionamentos(items)
    if (inconsistencias.length > 0) addInconsistencias(inconsistencias)
    setImportBanner({ ok: items.length, erros: inconsistencias.length })
    setShowUpload(false)
  }

  const handleSaveEdit = () => {
    if (!editData.grupoProduto || !editData.idSiac) return
    setRelacionamentos(relacionamentos.map(r => r.grupoProduto === editId ? editData : r))
    setEditId(null)
  }

  const handleDelete = (grupoProduto: number) => {
    if (!confirm('Excluir este relacionamento?')) return
    setRelacionamentos(relacionamentos.filter(r => r.grupoProduto !== grupoProduto))
  }

  const handleAdd = () => {
    if (!newRow.grupoProduto || !newRow.idSiac) return
    setRelacionamentos([...relacionamentos, newRow])
    setNewRow(EMPTY)
    setAddMode(false)
  }

  const handleReset = () => {
    if (!confirm('Apagar todos os relacionamentos e inconsistências pendentes? Esta ação não pode ser desfeita.')) return
    setRelacionamentos([])
    clearInconsistencias('relacionamento')
    setImportBanner(null)
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Relacionamento SIAC × Vellozia</h1>
          <p className="text-gray-500 mt-1">Mapeamento Grupo Produto ↔ ID SIAC — {relacionamentos.length} registros</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setAddMode(!addMode)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#4f2e87' }}>
            <Plus size={15} /> Novo
          </button>
          <button onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50">
            <Upload size={15} />
            {showUpload ? 'Ocultar upload' : 'Importar CSV'}
            {showUpload ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50">
            <RotateCcw size={14} /> Resetar
          </button>
        </div>
      </div>

      {showUpload && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <FileUpload
            label="Relacionamento SIAC × Vellozia"
            description="CSV separado por ; com colunas: GRUPO PRODUTO, ID SIAC, DESCRIÇÃO VELLOZIA"
            accept=".csv"
            onParse={handleParse}
            template={{
              filename: 'modelo_relacionamento_siac_vellozia.xlsx',
              sheetName: 'Relacionamento',
              rows: [
                ['GRUPO PRODUTO', 'ID SIAC', 'DESCRIÇÃO VELLOZIA'],
                [1001, 500, 'BOTULIM 50UI CAIXA'],
                [1002, 501, 'TOXINA BOTULINICA 100UI'],
              ],
            }}
          />
        </div>
      )}

      {importBanner && importBanner.erros > 0 && (
        <div className="mb-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <AlertTriangle size={17} className="shrink-0 mt-0.5 text-amber-500" />
          <div>
            <p className="font-medium">{importBanner.ok} registro(s) importado(s) · {importBanner.erros} inconsistência(s) encontrada(s)</p>
            <p className="mt-0.5">As linhas com campo em branco foram enviadas para tratamento manual.</p>
            <Link href="/inconsistencias" className="mt-1 inline-block text-purple-700 underline font-medium">
              Ir para Inconsistências →
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar grupo, ID SIAC, descrição…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>
        {search && <span className="text-xs text-gray-400">{filtered.length} resultado(s)</span>}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
              <th className="px-4 py-3 text-left font-medium">Grupo Produto</th>
              <th className="px-4 py-3 text-left font-medium">ID SIAC</th>
              <th className="px-4 py-3 text-left font-medium">Descrição Vellozia</th>
              <th className="px-4 py-3 text-center font-medium w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {addMode && (
              <tr className="bg-purple-50">
                <td className="px-3 py-2">
                  <input type="number" placeholder="Grupo" value={newRow.grupoProduto || ''}
                    onChange={e => setNewRow(r => ({ ...r, grupoProduto: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" placeholder="ID SIAC" value={newRow.idSiac || ''}
                    onChange={e => setNewRow(r => ({ ...r, idSiac: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" placeholder="Descrição Vellozia" value={newRow.descricaoVellozia}
                    onChange={e => setNewRow(r => ({ ...r, descricaoVellozia: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-1">
                    <button onClick={handleAdd} className="p-1.5 rounded text-green-600 hover:bg-green-50"><Check size={15} /></button>
                    <button onClick={() => setAddMode(false)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><X size={15} /></button>
                  </div>
                </td>
              </tr>
            )}
            {filtered.map((r, i) => (
              <tr key={r.grupoProduto} className={editId === r.grupoProduto ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {editId === r.grupoProduto ? (
                  <>
                    <td className="px-3 py-2">
                      <input type="number" value={editData.grupoProduto}
                        onChange={e => setEditData(d => ({ ...d, grupoProduto: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={editData.idSiac}
                        onChange={e => setEditData(d => ({ ...d, idSiac: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={editData.descricaoVellozia}
                        onChange={e => setEditData(d => ({ ...d, descricaoVellozia: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={handleSaveEdit} className="p-1.5 rounded text-green-600 hover:bg-green-50"><Check size={15} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded text-gray-400 hover:bg-gray-100"><X size={15} /></button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.grupoProduto}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-blue-700">{r.idSiac}</td>
                    <td className="px-4 py-2.5 text-gray-700">{r.descricaoVellozia}</td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setEditId(r.grupoProduto); setEditData({ ...r }) }}
                          className="p-1.5 rounded text-blue-500 hover:bg-blue-50"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(r.grupoProduto)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-12">
                {relacionamentos.length === 0 ? 'Nenhum relacionamento. Importe um arquivo ou adicione manualmente.' : 'Nenhum resultado para "' + search + '"'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

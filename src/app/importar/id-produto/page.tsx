'use client'
import { useState, useMemo } from 'react'
import { useStore } from '@/lib/store'
import { parseIdProdutoGrupoCSV } from '@/lib/parsers/relacionamento'
import { IdProdutoGrupo } from '@/types'
import { Plus, Pencil, Trash2, Check, X, Search, RotateCcw, Upload, ChevronDown, ChevronUp } from 'lucide-react'
import FileUpload from '@/components/ui/FileUpload'

const EMPTY: IdProdutoGrupo = { id: 0, descricaoProduto: '', grupoProdutoId: 0 }

export default function GerenciarIdProduto() {
  const { idProdutoGrupo, setIdProdutoGrupo } = useStore()
  const [search, setSearch] = useState('')
  const [filterGrupo, setFilterGrupo] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editData, setEditData] = useState<IdProdutoGrupo>(EMPTY)
  const [addMode, setAddMode] = useState(false)
  const [newRow, setNewRow] = useState<IdProdutoGrupo>(EMPTY)

  const grupos = [...new Set(idProdutoGrupo.map(i => i.grupoProdutoId))].sort((a, b) => a - b)

  const filtered = useMemo(() => {
    return idProdutoGrupo.filter(r => {
      const q = search.toLowerCase()
      const matchSearch = !search || String(r.id).includes(q) || r.descricaoProduto.toLowerCase().includes(q) || String(r.grupoProdutoId).includes(q)
      const matchGrupo = !filterGrupo || r.grupoProdutoId === parseInt(filterGrupo)
      return matchSearch && matchGrupo
    })
  }, [idProdutoGrupo, search, filterGrupo])

  const handleParse = (content: string) => {
    const items = parseIdProdutoGrupoCSV(content)
    setIdProdutoGrupo(items)
    setShowUpload(false)
  }

  const handleSaveEdit = () => {
    if (!editData.id || !editData.grupoProdutoId) return
    setIdProdutoGrupo(idProdutoGrupo.map(r => r.id === editId ? editData : r))
    setEditId(null)
  }

  const handleDelete = (id: number) => {
    if (!confirm('Excluir este mapeamento?')) return
    setIdProdutoGrupo(idProdutoGrupo.filter(r => r.id !== id))
  }

  const handleAdd = () => {
    if (!newRow.id || !newRow.grupoProdutoId) return
    setIdProdutoGrupo([...idProdutoGrupo, newRow])
    setNewRow(EMPTY)
    setAddMode(false)
  }

  const handleReset = () => {
    if (!confirm('Apagar todos os mapeamentos ID Produto × Grupo? Esta ação não pode ser desfeita.')) return
    setIdProdutoGrupo([])
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ID Produto × Grupo Produto</h1>
          <p className="text-gray-500 mt-1">{idProdutoGrupo.length} mapeamentos · {grupos.length} grupos distintos</p>
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
            label="ID Produto × Grupo Produto"
            description="CSV separado por ; com colunas: id, descricao_produto, grupo_produto_id"
            accept=".csv"
            onParse={handleParse}
            template={{
              filename: 'modelo_id_produto_grupo_produto.xlsx',
              sheetName: 'ID Produto x Grupo',
              rows: [
                ['id', 'descricao_produto', 'grupo_produto_id'],
                [1118, 'Abbive - Botox 200u - unidade', 1001],
                [1157, 'Aeskins - Profhilo 2%', 1002],
                [726, 'Agulha Hipodérmica 24G c/100 - Medix', 1003],
              ],
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar ID, descrição ou grupo…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>
        <select value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-300">
          <option value="">Todos os grupos</option>
          {grupos.map(g => <option key={g} value={g}>Grupo {g}</option>)}
        </select>
        <span className="text-xs text-gray-400">{filtered.length} resultado(s)</span>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
              <th className="px-4 py-3 text-left font-medium">ID Produto</th>
              <th className="px-4 py-3 text-left font-medium">Descrição</th>
              <th className="px-4 py-3 text-left font-medium">Grupo Produto</th>
              <th className="px-4 py-3 text-center font-medium w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {addMode && (
              <tr className="bg-purple-50">
                <td className="px-3 py-2">
                  <input type="number" placeholder="ID" value={newRow.id || ''}
                    onChange={e => setNewRow(r => ({ ...r, id: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                </td>
                <td className="px-3 py-2">
                  <input type="text" placeholder="Descrição" value={newRow.descricaoProduto}
                    onChange={e => setNewRow(r => ({ ...r, descricaoProduto: e.target.value }))}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" placeholder="Grupo" value={newRow.grupoProdutoId || ''}
                    onChange={e => setNewRow(r => ({ ...r, grupoProdutoId: parseInt(e.target.value) || 0 }))}
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
              <tr key={r.id} className={editId === r.id ? 'bg-blue-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {editId === r.id ? (
                  <>
                    <td className="px-3 py-2">
                      <input type="number" value={editData.id}
                        onChange={e => setEditData(d => ({ ...d, id: parseInt(e.target.value) || 0 }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="text" value={editData.descricaoProduto}
                        onChange={e => setEditData(d => ({ ...d, descricaoProduto: e.target.value }))}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" value={editData.grupoProdutoId}
                        onChange={e => setEditData(d => ({ ...d, grupoProdutoId: parseInt(e.target.value) || 0 }))}
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
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{r.id}</td>
                    <td className="px-4 py-2.5 text-gray-700">{r.descricaoProduto}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-purple-100 text-purple-700">{r.grupoProdutoId}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => { setEditId(r.id); setEditData({ ...r }) }}
                          className="p-1.5 rounded text-blue-500 hover:bg-blue-50"><Pencil size={13} /></button>
                        <button onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded text-red-400 hover:bg-red-50"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="text-center text-gray-400 py-12">
                {idProdutoGrupo.length === 0 ? 'Nenhum mapeamento. Importe um arquivo ou adicione manualmente.' : 'Nenhum resultado.'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

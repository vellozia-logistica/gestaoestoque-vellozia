'use client'
import { useStore } from '@/lib/store'
import { useState } from 'react'
import { CheckCircle2, Trash2, AlertTriangle, Pencil, X, Check } from 'lucide-react'
import Link from 'next/link'
import { SiacItem, VelloziaItem } from '@/types'

const ARQUIVO_LABEL: Record<string, string> = { siac: 'SIAC', vellozia: 'Vellozia' }
const ARQUIVO_COLOR: Record<string, string> = {
  siac: 'bg-blue-100 text-blue-700',
  vellozia: 'bg-green-100 text-green-700',
}

function SiacForm({ contexto, onSave, onCancel }: {
  contexto: Record<string, string | number>
  onSave: (item: SiacItem) => void
  onCancel: () => void
}) {
  const [f, setF] = useState<SiacItem>({
    codigo: String(contexto['codigo'] ?? ''),
    descricao: String(contexto['descricao'] ?? ''),
    unidade: String(contexto['unidade'] ?? ''),
    laboratorio: String(contexto['laboratorio'] ?? ''),
    lote: String(contexto['lote'] ?? ''),
    vencimento: String(contexto['vencimento'] ?? ''),
    estoque: Number(contexto['estoque'] ?? 0),
  })
  const valid = f.codigo && f.lote && f.vencimento && f.estoque >= 0

  return (
    <div className="mt-3 border border-blue-200 rounded-xl bg-blue-50 p-4">
      <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">Preencher dados SIAC</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {[
          { label: 'Código', key: 'codigo' },
          { label: 'Descrição', key: 'descricao' },
          { label: 'Unidade', key: 'unidade' },
          { label: 'Laboratório', key: 'laboratorio' },
          { label: 'Lote', key: 'lote' },
          { label: 'Vencimento (DD/MM/AAAA)', key: 'vencimento' },
        ].map(({ label, key }) => (
          <div key={key}>
            <label className="block text-xs text-gray-600 mb-1">{label}</label>
            <input
              type="text"
              value={(f as unknown as Record<string, string>)[key] ?? ''}
              onChange={e => setF(prev => ({ ...prev, [key]: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Estoque</label>
          <input
            type="number"
            value={f.estoque}
            onChange={e => setF(prev => ({ ...prev, estoque: parseFloat(e.target.value) || 0 }))}
            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => valid && onSave(f)}
          disabled={!valid}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: '#4f2e87' }}
        >
          <Check size={14} /> Salvar e resolver
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

function VelloziaForm({ contexto, onSave, onCancel }: {
  contexto: Record<string, string | number>
  onSave: (item: VelloziaItem) => void
  onCancel: () => void
}) {
  const [f, setF] = useState<VelloziaItem>({
    empresa: String(contexto['empresa'] ?? ''),
    produto: String(contexto['produto'] ?? ''),
    idProduto: Number(contexto['idProduto'] ?? 0),
    lote: String(contexto['lote'] ?? ''),
    dataValidade: String(contexto['dataValidade'] ?? ''),
    dataFabricacao: String(contexto['dataFabricacao'] ?? ''),
    diasVencimento: Number(contexto['diasVencimento'] ?? 0),
    qtdeEstoque: Number(contexto['qtdeEstoque'] ?? 0),
  })
  const valid = f.empresa && f.idProduto > 0 && f.lote

  return (
    <div className="mt-3 border border-green-200 rounded-xl bg-green-50 p-4">
      <p className="text-xs font-semibold text-green-700 mb-3 uppercase tracking-wide">Preencher dados Vellozia</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {[
          { label: 'Empresa / Filial', key: 'empresa', type: 'text' },
          { label: 'Produto', key: 'produto', type: 'text' },
          { label: 'ID Produto', key: 'idProduto', type: 'number' },
          { label: 'Lote', key: 'lote', type: 'text' },
          { label: 'Data de Validade (DD/MM/AAAA)', key: 'dataValidade', type: 'text' },
          { label: 'Data de Fabricação (DD/MM/AAAA)', key: 'dataFabricacao', type: 'text' },
          { label: 'Dias até vencimento', key: 'diasVencimento', type: 'number' },
          { label: 'Qtde Estoque', key: 'qtdeEstoque', type: 'number' },
        ].map(({ label, key, type }) => (
          <div key={key}>
            <label className="block text-xs text-gray-600 mb-1">{label}</label>
            <input
              type={type}
              value={(f as unknown as Record<string, string | number>)[key] ?? ''}
              onChange={e => setF(prev => ({
                ...prev,
                [key]: type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value,
              }))}
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => valid && onSave(f)}
          disabled={!valid}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: '#4f2e87' }}
        >
          <Check size={14} /> Salvar e resolver
        </button>
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50">
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

export default function InconsistenciasPage() {
  const { inconsistencias, resolveInconsistencia, clearInconsistencias, addSiacItem, addVelloziaItem } = useStore()
  const [editing, setEditing] = useState<string | null>(null)

  const pendentes = inconsistencias.filter(i => !i.resolvido)
  const resolvidas = inconsistencias.filter(i => i.resolvido)

  const handleSaveSiac = (id: string, item: SiacItem) => {
    addSiacItem(item)
    resolveInconsistencia(id)
    setEditing(null)
  }

  const handleSaveVellozia = (id: string, item: VelloziaItem) => {
    addVelloziaItem(item)
    resolveInconsistencia(id)
    setEditing(null)
  }

  if (inconsistencias.length === 0) {
    return (
      <div className="p-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Inconsistências</h1>
          <p className="text-gray-500 mt-1">Linhas que não puderam ser importadas automaticamente</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckCircle2 size={48} className="text-green-400 mb-4" />
          <p className="text-gray-600 font-medium">Nenhuma inconsistência encontrada</p>
          <p className="text-gray-400 text-sm mt-1">Todos os dados foram importados com sucesso.</p>
          <div className="flex gap-4 mt-6">
            <Link href="/importar/siac" className="text-sm text-purple-600 underline">Importar SIAC</Link>
            <Link href="/importar/vellozia" className="text-sm text-purple-600 underline">Importar Vellozia</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inconsistências</h1>
          <p className="text-gray-500 mt-1">{pendentes.length} pendente(s) · {resolvidas.length} resolvida(s)</p>
        </div>
        {resolvidas.length > 0 && (
          <button onClick={() => clearInconsistencias()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50">
            <Trash2 size={14} /> Limpar resolvidas
          </button>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Como corrigir</p>
          <p className="mt-1">Clique em <strong>Corrigir</strong> em cada linha para ver a linha original completa e preencher os dados manualmente. O registro corrigido será adicionado ao estoque e a inconsistência marcada como resolvida.</p>
        </div>
      </div>

      {/* Pendentes */}
      {pendentes.length > 0 && (
        <div className="mb-8 space-y-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500" />
            Pendentes ({pendentes.length})
          </h2>

          {pendentes.map(item => (
            <div key={item.id} className="bg-white border border-amber-200 rounded-xl overflow-hidden shadow-sm">
              {/* Linha do arquivo — sempre visível */}
              <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ARQUIVO_COLOR[item.arquivo]}`}>
                      {ARQUIVO_LABEL[item.arquivo]}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">Linha {item.linhaNumero}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setEditing(editing === item.id ? null : item.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border transition-colors"
                      style={editing === item.id
                        ? { borderColor: '#c4b5fd', color: '#4f2e87', backgroundColor: '#faf5ff' }
                        : { borderColor: '#d1d5db', color: '#374151' }}
                    >
                      {editing === item.id ? <X size={12} /> : <Pencil size={12} />}
                      {editing === item.id ? 'Fechar' : 'Corrigir'}
                    </button>
                    <button
                      onClick={() => resolveInconsistencia(item.id)}
                      title="Marcar como resolvida sem corrigir"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-green-600 border border-green-200 hover:bg-green-50"
                    >
                      <CheckCircle2 size={12} /> Ignorar
                    </button>
                  </div>
                </div>

                {/* Linha bruta completa */}
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Linha original:</p>
                  <pre className="text-xs bg-white border border-amber-200 rounded-lg px-3 py-2 overflow-x-auto text-gray-700 whitespace-pre-wrap break-all font-mono">
                    {item.conteudo}
                  </pre>
                </div>

                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle size={11} />
                  {item.motivo}
                </p>
              </div>

              {/* Formulário de correção — expande ao clicar Corrigir */}
              {editing === item.id && (
                <div className="px-4 pb-4">
                  {item.arquivo === 'siac' ? (
                    <SiacForm
                      contexto={item.contexto || {}}
                      onSave={siacItem => handleSaveSiac(item.id, siacItem)}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <VelloziaForm
                      contexto={item.contexto || {}}
                      onSave={velItem => handleSaveVellozia(item.id, velItem)}
                      onCancel={() => setEditing(null)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Resolvidas */}
      {resolvidas.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-500" />
            Resolvidas ({resolvidas.length})
          </h2>
          <div className="space-y-2">
            {resolvidas.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-gray-100 rounded-xl opacity-50 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${ARQUIVO_COLOR[item.arquivo]}`}>
                  {ARQUIVO_LABEL[item.arquivo]}
                </span>
                <span className="font-mono text-xs text-gray-400 shrink-0">L.{item.linhaNumero}</span>
                <code className="text-xs text-gray-400 truncate flex-1">{item.conteudo}</code>
                <CheckCircle2 size={14} className="text-green-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

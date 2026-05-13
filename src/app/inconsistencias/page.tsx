'use client'
import { useStore } from '@/lib/store'
import { useState } from 'react'
import { CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import Link from 'next/link'
import { SiacItem, VelloziaItem, RelacionamentoSiacVellozia, ContextoLinha } from '@/types'

const ARQUIVO_LABEL: Record<string, string> = { siac: 'SIAC', vellozia: 'Vellozia', relacionamento: 'Relacionamento' }
const ARQUIVO_COLOR: Record<string, string> = {
  siac: 'bg-blue-100 text-blue-700',
  vellozia: 'bg-green-100 text-green-700',
  relacionamento: 'bg-orange-100 text-orange-700',
}

function ContextoViewer({ linhas }: { linhas: ContextoLinha[] }) {
  return (
    <div className="rounded-xl border border-gray-700 overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
          Contexto do arquivo
        </span>
        <span className="text-xs text-red-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-red-600 inline-block" />
          linha com erro destacada
        </span>
      </div>
      <div className="overflow-x-auto bg-gray-900">
        <pre className="text-xs font-mono p-4 leading-6">
          {linhas.map((l) => (
            <div
              key={l.numero}
              className={l.ehErro
                ? 'bg-red-900/60 text-red-300 rounded px-1 -mx-1 ring-1 ring-red-500/50'
                : 'text-gray-400'
              }
            >
              <span className="select-none text-gray-600 mr-4 inline-block w-5 text-right">
                {l.numero}
              </span>
              <span>{l.conteudo || ' '}</span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}

function SiacForm({ formData, onSave, onCancel }: {
  formData: Record<string, string | number>
  onSave: (item: SiacItem) => void
  onCancel: () => void
}) {
  const [f, setF] = useState<SiacItem>({
    codigo: String(formData['codigo'] ?? ''),
    descricao: String(formData['descricao'] ?? ''),
    unidade: String(formData['unidade'] ?? ''),
    laboratorio: String(formData['laboratorio'] ?? ''),
    lote: String(formData['lote'] ?? ''),
    vencimento: String(formData['vencimento'] ?? ''),
    estoque: Number(formData['estoque'] ?? 0),
  })
  const valid = f.codigo && f.lote && f.vencimento && f.estoque >= 0

  return (
    <div className="mt-5 border border-blue-200 rounded-xl bg-blue-50 p-5">
      <p className="text-xs font-semibold text-blue-700 mb-4 uppercase tracking-wide">Preencher dados SIAC</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs text-gray-600 mb-1">Estoque</label>
          <input
            type="number"
            value={f.estoque}
            onChange={e => setF(prev => ({ ...prev, estoque: parseFloat(e.target.value) || 0 }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button
          onClick={() => valid && onSave(f)}
          disabled={!valid}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: '#4f2e87' }}
        >
          <Check size={14} /> Salvar e avançar
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

function VelloziaForm({ formData, onSave, onCancel }: {
  formData: Record<string, string | number>
  onSave: (item: VelloziaItem) => void
  onCancel: () => void
}) {
  const [f, setF] = useState<VelloziaItem>({
    empresa: String(formData['empresa'] ?? ''),
    produto: String(formData['produto'] ?? ''),
    idProduto: Number(formData['idProduto'] ?? 0),
    lote: String(formData['lote'] ?? ''),
    dataValidade: String(formData['dataValidade'] ?? ''),
    dataFabricacao: String(formData['dataFabricacao'] ?? ''),
    diasVencimento: Number(formData['diasVencimento'] ?? 0),
    qtdeEstoque: Number(formData['qtdeEstoque'] ?? 0),
  })
  const valid = f.empresa && f.idProduto > 0 && f.lote

  return (
    <div className="mt-5 border border-green-200 rounded-xl bg-green-50 p-5">
      <p className="text-xs font-semibold text-green-700 mb-4 uppercase tracking-wide">Preencher dados Vellozia</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 bg-white"
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-5">
        <button
          onClick={() => valid && onSave(f)}
          disabled={!valid}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: '#4f2e87' }}
        >
          <Check size={14} /> Salvar e avançar
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

function RelacionamentoForm({ formData, onSave, onCancel }: {
  formData: Record<string, string | number>
  onSave: (item: RelacionamentoSiacVellozia) => void
  onCancel: () => void
}) {
  const [f, setF] = useState<RelacionamentoSiacVellozia>({
    grupoProduto: Number(formData['grupoProduto'] ?? 0),
    idSiac: Number(formData['idSiac'] ?? 0),
    descricaoVellozia: String(formData['descricaoVellozia'] ?? ''),
  })
  const valid = f.grupoProduto > 0 && f.idSiac > 0

  return (
    <div className="mt-5 border border-orange-200 rounded-xl bg-orange-50 p-5">
      <p className="text-xs font-semibold text-orange-700 mb-4 uppercase tracking-wide">Preencher dados do Relacionamento</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Grupo Produto</label>
          <input
            type="number"
            value={f.grupoProduto || ''}
            onChange={e => setF(prev => ({ ...prev, grupoProduto: parseInt(e.target.value) || 0 }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">ID SIAC</label>
          <input
            type="number"
            value={f.idSiac || ''}
            onChange={e => setF(prev => ({ ...prev, idSiac: parseInt(e.target.value) || 0 }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Descrição Vellozia</label>
          <input
            type="text"
            value={f.descricaoVellozia}
            onChange={e => setF(prev => ({ ...prev, descricaoVellozia: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white"
          />
        </div>
      </div>
      <div className="flex gap-2 mt-5">
        <button
          onClick={() => valid && onSave(f)}
          disabled={!valid}
          className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40"
          style={{ backgroundColor: '#4f2e87' }}
        >
          <Check size={14} /> Salvar e avançar
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
        >
          <X size={14} /> Cancelar
        </button>
      </div>
    </div>
  )
}

export default function InconsistenciasPage() {
  const { inconsistencias, resolveInconsistencia, clearInconsistencias, addSiacItem, addVelloziaItem, addRelacionamento } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [index, setIndex] = useState(0)

  const pendentes = inconsistencias.filter(i => !i.resolvido)
  const resolvidas = inconsistencias.filter(i => i.resolvido)

  const safeIndex = Math.min(index, Math.max(0, pendentes.length - 1))
  const current = pendentes[safeIndex]

  const handleSaveSiac = (item: SiacItem) => {
    addSiacItem(item)
    resolveInconsistencia(current.id)
    setEditingId(null)
  }

  const handleSaveVellozia = (item: VelloziaItem) => {
    addVelloziaItem(item)
    resolveInconsistencia(current.id)
    setEditingId(null)
  }

  const handleSaveRelacionamento = (item: RelacionamentoSiacVellozia) => {
    addRelacionamento(item)
    resolveInconsistencia(current.id)
    setEditingId(null)
  }

  const goNext = () => {
    setIndex(i => Math.min(i + 1, pendentes.length - 1))
    setEditingId(null)
  }
  const goPrev = () => {
    setIndex(i => Math.max(i - 1, 0))
    setEditingId(null)
  }

  if (inconsistencias.length === 0) {
    return (
      <div className="p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Inconsistências</h1>
        <p className="text-gray-500 mb-8">Linhas que não puderam ser importadas automaticamente</p>
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
    <div className="p-6 w-full max-w-6xl">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inconsistências</h1>
          <p className="text-gray-500 mt-1">{pendentes.length} pendente(s) · {resolvidas.length} resolvida(s)</p>
        </div>
      </div>

      {/* Aviso */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium">Tratamento obrigatório</p>
          <p className="mt-1">
            Corrija cada inconsistência para incluir o registro no estoque consolidado.
            A linha com erro aparece destacada em vermelho no contexto do arquivo.
          </p>
        </div>
      </div>

      {pendentes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-green-50 rounded-2xl border border-green-200">
          <CheckCircle2 size={48} className="text-green-400 mb-4" />
          <p className="text-gray-700 font-semibold text-lg">Todas as inconsistências foram corrigidas!</p>
          <p className="text-gray-400 text-sm mt-2">{resolvidas.length} registro(s) resolvido(s)</p>
          <button
            onClick={() => { clearInconsistencias(); setIndex(0) }}
            className="mt-6 px-5 py-2 rounded-lg border border-gray-300 text-gray-600 text-sm hover:bg-gray-50"
          >
            Limpar histórico
          </button>
        </div>
      ) : (
        <>
          {/* Navegação wizard */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-700">
                {safeIndex + 1} de {pendentes.length}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ARQUIVO_COLOR[current.arquivo]}`}>
                {ARQUIVO_LABEL[current.arquivo]}
              </span>
              <span className="text-xs text-gray-400 font-mono">Linha {current.linhaNumero}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                disabled={safeIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              <button
                onClick={goNext}
                disabled={safeIndex === pendentes.length - 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próximo <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Card da inconsistência */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Motivo do erro */}
            <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2">
              <AlertTriangle size={15} className="text-red-500 shrink-0" />
              <span className="text-sm text-red-700 font-medium">{current.motivo}</span>
            </div>

            <div className="p-5 space-y-5">
              {/* Contexto com destaque */}
              {current.linhasContexto && current.linhasContexto.length > 0 ? (
                <ContextoViewer linhas={current.linhasContexto} />
              ) : (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Linha original:</p>
                  <pre className="text-xs bg-gray-900 text-gray-300 border border-gray-700 rounded-xl px-4 py-3 overflow-x-auto font-mono whitespace-pre-wrap break-all">
                    {current.conteudo}
                  </pre>
                </div>
              )}

              {/* Formulário de correção */}
              {editingId === current.id ? (
                current.arquivo === 'siac' ? (
                  <SiacForm
                    formData={current.formData || {}}
                    onSave={handleSaveSiac}
                    onCancel={() => setEditingId(null)}
                  />
                ) : current.arquivo === 'vellozia' ? (
                  <VelloziaForm
                    formData={current.formData || {}}
                    onSave={handleSaveVellozia}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <RelacionamentoForm
                    formData={current.formData || {}}
                    onSave={handleSaveRelacionamento}
                    onCancel={() => setEditingId(null)}
                  />
                )
              ) : (
                <button
                  onClick={() => setEditingId(current.id)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-medium"
                  style={{ backgroundColor: '#4f2e87' }}
                >
                  Corrigir esta inconsistência
                </button>
              )}
            </div>
          </div>

          {/* Bolinhas de progresso */}
          {pendentes.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-5">
              {pendentes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIndex(i); setEditingId(null) }}
                  className={`h-2 rounded-full transition-all ${
                    i === safeIndex
                      ? 'bg-purple-600 w-5'
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Resolvidas */}
      {resolvidas.length > 0 && pendentes.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-500" />
            Já corrigidas ({resolvidas.length})
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

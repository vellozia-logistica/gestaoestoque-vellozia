'use client'
import { useStore } from '@/lib/store'
import { CheckCircle2, Trash2, AlertTriangle, FileText } from 'lucide-react'
import Link from 'next/link'

const ARQUIVO_LABEL: Record<string, string> = { siac: 'SIAC', vellozia: 'Vellozia' }
const ARQUIVO_COLOR: Record<string, string> = {
  siac: 'bg-blue-100 text-blue-700',
  vellozia: 'bg-green-100 text-green-700',
}

export default function InconsistenciasPage() {
  const { inconsistencias, resolveInconsistencia, clearInconsistencias } = useStore()

  const pendentes = inconsistencias.filter(i => !i.resolvido)
  const resolvidas = inconsistencias.filter(i => i.resolvido)

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
          <div className="flex gap-3 mt-6">
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
          <p className="text-gray-500 mt-1">
            {pendentes.length} pendente(s) · {resolvidas.length} resolvida(s)
          </p>
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
          <p className="font-medium">O que fazer com as inconsistências?</p>
          <p className="mt-1">Verifique cada linha abaixo. Você pode corrigir os dados diretamente nos gerenciadores
            (<Link href="/importar/relacionamento" className="underline">Relacionamento</Link> ou{' '}
            <Link href="/importar/id-produto" className="underline">ID Produto</Link>),
            re-exportar o arquivo corrigido e importar novamente, ou marcar a linha como resolvida
            se ela não for necessária.</p>
        </div>
      </div>

      {pendentes.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-500" />
            Pendentes ({pendentes.length})
          </h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Arquivo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Linha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Conteúdo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Motivo</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendentes.map(item => (
                  <tr key={item.id} className="hover:bg-amber-50/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ARQUIVO_COLOR[item.arquivo]}`}>
                        {ARQUIVO_LABEL[item.arquivo]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.linhaNumero}</td>
                    <td className="px-4 py-3 max-w-xs">
                      <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded block truncate" title={item.conteudo}>
                        {item.conteudo}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-xs text-red-600">{item.motivo}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => resolveInconsistencia(item.id)}
                        title="Marcar como resolvida"
                        className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                        <CheckCircle2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {resolvidas.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-500" />
            Resolvidas ({resolvidas.length})
          </h2>
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden opacity-60">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {resolvidas.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2.5 w-24">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ARQUIVO_COLOR[item.arquivo]}`}>
                        {ARQUIVO_LABEL[item.arquivo]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-400 w-16">{item.linhaNumero}</td>
                    <td className="px-4 py-2.5">
                      <code className="text-xs text-gray-400 truncate block max-w-xs">{item.conteudo}</code>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400 line-through">{item.motivo}</td>
                    <td className="px-4 py-2.5 text-center">
                      <FileText size={14} className="text-green-400 inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

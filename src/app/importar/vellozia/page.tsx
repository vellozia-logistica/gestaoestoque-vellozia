'use client'
import FileUpload from '@/components/ui/FileUpload'
import { useStore } from '@/lib/store'
import { parseVelloziaCSV } from '@/lib/parsers/vellozia'
import { FileText, AlertCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function ImportarVellozia() {
  const { setVelloziaItems, velloziaItems, addInconsistencias, clearInconsistencias, inconsistencias } = useStore()

  const pendentes = inconsistencias.filter(i => i.arquivo === 'vellozia' && !i.resolvido).length

  const handleParse = (content: string) => {
    const { items, inconsistencias: found } = parseVelloziaCSV(content)
    setVelloziaItems(items)
    clearInconsistencias('vellozia')
    if (found.length > 0) addInconsistencias(found)
  }

  const filiais = [...new Set(velloziaItems.map(i => i.empresa))].sort()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Importar Estoque Vellozia</h1>
        <p className="text-gray-500 mt-1">Relatório de estoque de todas as filiais do sistema Vellozia</p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-green-800">
          <p className="font-medium">Formato esperado</p>
          <p className="mt-1">CSV com colunas: <code className="bg-green-100 px-1 rounded">Empresa, Produto (idProduto = N), Lote, Data de Validade, Data de Fabricação, Dias até o vencimento, Qtde Estoque</code></p>
        </div>
      </div>

      {pendentes > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex gap-3">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <div className="text-sm text-amber-800 flex-1">
            <p className="font-medium">{pendentes} linha(s) com inconsistência detectadas na última importação</p>
            <p className="mt-1">Os demais registros foram importados. Revise antes de continuar.</p>
          </div>
          <Link href="/inconsistencias" className="shrink-0 text-xs font-semibold text-amber-700 underline self-center">
            Ver inconsistências →
          </Link>
        </div>
      )}

      <FileUpload
        label="Estoque Vellozia (todas as filiais)"
        description="Relatório de estoque exportado do sistema Vellozia"
        accept=".csv"
        onParse={handleParse}
        template={{
          filename: 'modelo_estoque_vellozia.xlsx',
          sheetName: 'Estoque Vellozia',
          rows: [
            ['Empresa', 'Produto', 'Lote', 'Data de Validade', 'Data de Fabricação', 'Dias até o vencimento', 'Qtde Estoque'],
            ['Uberlândia', 'Allergan - Botox 200u- unidade (idProduto = 1118)', 'D0701C3', '31/01/2028', '11/02/2025', 628, 3],
            ['Uberlândia', 'Aeskins - Profhilo 2% - unidade (idProduto = 1157)', 'D03424', '31/03/2027', '31/03/2024', 322, 16],
            ['Tocantins', 'Allergan - Botox 200u- unidade (idProduto = 1118)', 'D0701C3', '31/01/2028', '11/02/2025', 628, 5],
          ],
        }}
      />

      {velloziaItems.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {filiais.map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">{f}</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-purple-600" />
            <h2 className="font-semibold text-gray-700">{velloziaItems.length} registros importados</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
                  <th className="px-4 py-3 text-left font-medium">Filial</th>
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-left font-medium">ID</th>
                  <th className="px-4 py-3 text-left font-medium">Lote</th>
                  <th className="px-4 py-3 text-left font-medium">Validade</th>
                  <th className="px-4 py-3 text-right font-medium">Qtde</th>
                </tr>
              </thead>
              <tbody>
                {velloziaItems.slice(0, 50).map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700">{item.empresa}</span>
                    </td>
                    <td className="px-4 py-2 text-gray-700 max-w-xs truncate">{item.produto}</td>
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{item.idProduto}</td>
                    <td className="px-4 py-2 text-gray-600">{item.lote}</td>
                    <td className="px-4 py-2 text-gray-600">{item.dataValidade}</td>
                    <td className="px-4 py-2 text-right font-medium">{item.qtdeEstoque.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {velloziaItems.length > 50 && (
              <p className="text-xs text-gray-400 text-center py-2">Mostrando 50 de {velloziaItems.length} registros</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

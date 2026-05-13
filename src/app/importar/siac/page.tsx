'use client'
import FileUpload from '@/components/ui/FileUpload'
import { useStore } from '@/lib/store'
import { parseSiacCSV } from '@/lib/parsers/siac'
import { FileText, AlertCircle } from 'lucide-react'

export default function ImportarSiac() {
  const { setSiacItems, siacItems } = useStore()

  const handleParse = (content: string) => {
    const items = parseSiacCSV(content)
    setSiacItems(items)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Importar Estoque SIAC</h1>
        <p className="text-gray-500 mt-1">Relatório de estoque da filial Goiânia (sistema SIAC)</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Formato esperado</p>
          <p className="mt-1">Relatório de Produtos por Lote exportado do SIAC. Arquivo texto (.csv ou .txt) com layout fixo contendo código, descrição, lote, vencimento e estoque.</p>
        </div>
      </div>

      <FileUpload
        label="Estoque SIAC (Goiânia)"
        description="Relatório de Produtos por Lote do SIAC"
        accept=".csv,.txt"
        onParse={handleParse}
      />

      {siacItems.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <FileText size={16} className="text-purple-600" />
            <h2 className="font-semibold text-gray-700">Prévia — {siacItems.length} registros importados</h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
                  <th className="px-4 py-3 text-left font-medium">Código</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium">Lote</th>
                  <th className="px-4 py-3 text-left font-medium">Vencimento</th>
                  <th className="px-4 py-3 text-right font-medium">Estoque</th>
                </tr>
              </thead>
              <tbody>
                {siacItems.slice(0, 50).map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-mono text-xs">{item.codigo}</td>
                    <td className="px-4 py-2 text-gray-700">{item.descricao}</td>
                    <td className="px-4 py-2 text-gray-600">{item.lote}</td>
                    <td className="px-4 py-2 text-gray-600">{item.vencimento}</td>
                    <td className="px-4 py-2 text-right font-medium">{item.estoque.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {siacItems.length > 50 && (
              <p className="text-xs text-gray-400 text-center py-2">
                Mostrando 50 de {siacItems.length} registros
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

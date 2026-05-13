'use client'
import FileUpload from '@/components/ui/FileUpload'
import { useStore } from '@/lib/store'
import { parseRelacionamentoCSV } from '@/lib/parsers/relacionamento'
import { AlertCircle } from 'lucide-react'

export default function ImportarRelacionamento() {
  const { setRelacionamentos, relacionamentos } = useStore()

  const handleParse = (content: string) => {
    const items = parseRelacionamentoCSV(content)
    setRelacionamentos(items)
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Relacionamento SIAC × Vellozia</h1>
        <p className="text-gray-500 mt-1">Mapeamento de Grupo Produto ↔ ID SIAC (um para um)</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-orange-800">
          <p className="font-medium">Formato esperado</p>
          <p className="mt-1">CSV separado por ponto e vírgula com colunas: GRUPO PRODUTO, ID SIAC, DESCRIÇÃO VELLOZIA.</p>
        </div>
      </div>

      <FileUpload
        label="Relacionamento SIAC × Vellozia"
        description="Arquivo RELACIONAMENTO SIAC X VELLOZIA.csv"
        accept=".csv"
        onParse={handleParse}
        template={{
          filename: 'modelo_relacionamento_siac_vellozia.xlsx',
          sheetName: 'Relacionamento',
          rows: [
            ['GRUPO PRODUTO', 'ID SIAC', 'DESCRIÇÃO VELLOZIA'],
            [1001, 500, 'BOTULIM 50UI CAIXA'],
            [1002, 501, 'TOXINA BOTULINICA 100UI'],
            [1003, 502, 'PREENCHEDOR ACIDO HIALURONICO 1ML'],
          ],
        }}
      />

      {relacionamentos.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-gray-700 mb-3">{relacionamentos.length} relacionamentos importados</h2>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
                  <th className="px-4 py-3 text-left font-medium">Grupo Produto</th>
                  <th className="px-4 py-3 text-left font-medium">ID SIAC</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição Vellozia</th>
                </tr>
              </thead>
              <tbody>
                {relacionamentos.slice(0, 50).map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-mono text-xs">{item.grupoProduto}</td>
                    <td className="px-4 py-2 font-mono text-xs">{item.idSiac}</td>
                    <td className="px-4 py-2 text-gray-700">{item.descricaoVellozia}</td>
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

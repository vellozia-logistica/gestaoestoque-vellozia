'use client'
import FileUpload from '@/components/ui/FileUpload'
import { useStore } from '@/lib/store'
import { parseIdProdutoGrupoCSV } from '@/lib/parsers/relacionamento'
import { FileText, AlertCircle } from 'lucide-react'

export default function ImportarIdProduto() {
  const { setIdProdutoGrupo, idProdutoGrupo } = useStore()

  const handleParse = (content: string) => {
    const items = parseIdProdutoGrupoCSV(content)
    setIdProdutoGrupo(items)
  }

  const grupos = [...new Set(idProdutoGrupo.map(i => i.grupoProdutoId))].length

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ID Produto × Grupo Produto</h1>
        <p className="text-gray-500 mt-1">Mapeamento de ID Produto Vellozia para Grupo Produto</p>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex gap-3">
        <AlertCircle className="text-purple-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-purple-800">
          <p className="font-medium">Formato esperado</p>
          <p className="mt-1">CSV separado por ponto e vírgula com colunas: id, descricao_produto, grupo_produto_id.</p>
        </div>
      </div>

      <FileUpload
        label="ID Produto × Grupo Produto"
        description="Arquivo id produto x grupo produto.csv"
        accept=".csv"
        onParse={handleParse}
        template={{
          filename: 'modelo_id_produto_grupo_produto.csv',
          content:
            'id;descricao_produto;grupo_produto_id\r\n' +
            '123;BOTULIM 50UI - CAIXA;1001\r\n' +
            '124;BOTULIM 50UI - FRASCO;1001\r\n' +
            '125;TOXINA BOTULINICA 100UI - CAIXA;1002\r\n' +
            '126;TOXINA BOTULINICA 100UI - UNIDADE;1002\r\n',
        }}
      />

      {idProdutoGrupo.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-purple-600" />
              <span className="font-semibold text-gray-700">{idProdutoGrupo.length} produtos importados</span>
            </div>
            <span className="text-gray-400">·</span>
            <span className="text-gray-600 text-sm">{grupos} grupos distintos</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: '#4f2e87' }} className="text-white">
                  <th className="px-4 py-3 text-left font-medium">ID Produto</th>
                  <th className="px-4 py-3 text-left font-medium">Descrição</th>
                  <th className="px-4 py-3 text-left font-medium">Grupo Produto</th>
                </tr>
              </thead>
              <tbody>
                {idProdutoGrupo.slice(0, 50).map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{item.id}</td>
                    <td className="px-4 py-2 text-gray-700">{item.descricaoProduto}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 font-mono">
                        {item.grupoProdutoId}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {idProdutoGrupo.length > 50 && (
              <p className="text-xs text-gray-400 text-center py-2">
                Mostrando 50 de {idProdutoGrupo.length} registros
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

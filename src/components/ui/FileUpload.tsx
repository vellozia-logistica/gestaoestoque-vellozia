'use client'
import { useCallback, useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Download } from 'lucide-react'
import { downloadExcel } from '@/lib/excel'

interface TemplateSheet {
  rows: (string | number)[][]
  sheetName?: string
  filename: string
}

interface FileUploadProps {
  label: string
  description: string
  accept?: string
  onParse: (content: string, fileName: string) => void | Promise<void>
  template?: TemplateSheet
}

export default function FileUpload({ label, description, accept = '.csv,.txt', onParse, template }: FileUploadProps) {
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [fileName, setFileName] = useState('')
  const [dragging, setDragging] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    try {
      const buffer = await file.arrayBuffer()
      let content: string
      try {
        // tenta UTF-8 estrito; falha se houver bytes inválidos (ex: Windows-1252)
        content = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
      } catch {
        content = new TextDecoder('windows-1252').decode(buffer)
      }
      await onParse(content, file.name)
      setFileName(file.name)
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }, [onParse])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDownloadTemplate = () => {
    if (!template) return
    downloadExcel(template.rows, template.filename, template.sheetName ?? 'Modelo')
  }

  return (
    <div className="space-y-2">
      {template && (
        <div className="flex justify-end">
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:bg-purple-50"
            style={{ borderColor: '#c4b5fd', color: '#4f2e87' }}
          >
            <Download size={14} />
            Baixar modelo Excel
          </button>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragging
            ? 'border-purple-500 bg-purple-50'
            : status === 'success'
            ? 'border-green-400 bg-green-50'
            : status === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
        }`}
      >
        <input
          type="file"
          accept={accept}
          onChange={onChange}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-3">
          {status === 'success' ? (
            <CheckCircle className="text-green-500" size={40} />
          ) : status === 'error' ? (
            <AlertCircle className="text-red-500" size={40} />
          ) : (
            <Upload className="text-purple-400" size={40} />
          )}
          <div>
            <p className="font-semibold text-gray-700">{label}</p>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
            {fileName && <p className="text-xs text-purple-600 mt-2 font-medium">✓ {fileName}</p>}
          </div>
          <span className="text-xs text-gray-400">
            {status === 'success' ? 'Clique para substituir' : 'Arraste ou clique para selecionar'}
          </span>
        </div>
      </div>
    </div>
  )
}

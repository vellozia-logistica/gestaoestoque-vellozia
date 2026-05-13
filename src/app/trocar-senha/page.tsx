'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { hashPassword } from '@/lib/auth'

export default function TrocarSenhaPage() {
  const router = useRouter()
  const { currentUser, updateUser } = useStore()
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [showNova, setShowNova] = useState(false)
  const [showConfirma, setShowConfirma] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!currentUser) {
    if (typeof window !== 'undefined') router.replace('/login')
    return null
  }

  const rules = [
    { label: 'Mínimo 8 caracteres', ok: nova.length >= 8 },
    { label: 'Letra maiúscula', ok: /[A-Z]/.test(nova) },
    { label: 'Número ou símbolo', ok: /[0-9!@#$%^&*]/.test(nova) },
    { label: 'Senhas coincidem', ok: nova === confirma && confirma.length > 0 },
  ]
  const valid = rules.every(r => r.ok)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    setError('')
    try {
      const hash = await hashPassword(nova)
      updateUser(currentUser.id, { passwordHash: hash, mustChangePassword: false })
      router.replace('/')
    } catch {
      setError('Erro ao salvar senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#f8f7fa' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.jpg" alt="Vellozia" width={80} height={80} className="rounded-xl shadow" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-800 mb-1">Crie sua senha</h1>
          <p className="text-sm text-gray-500 mb-6">
            Primeiro acesso detectado. Defina uma senha pessoal para continuar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showNova ? 'text' : 'password'}
                  value={nova}
                  onChange={e => setNova(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button type="button" onClick={() => setShowNova(!showNova)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNova ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showConfirma ? 'text' : 'password'}
                  value={confirma}
                  onChange={e => setConfirma(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button type="button" onClick={() => setShowConfirma(!showConfirma)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showConfirma ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Password rules */}
            <ul className="space-y-1.5 py-2">
              {rules.map(r => (
                <li key={r.label} className={`flex items-center gap-2 text-xs ${r.ok ? 'text-green-600' : 'text-gray-400'}`}>
                  <CheckCircle2 size={13} className={r.ok ? 'text-green-500' : 'text-gray-300'} />
                  {r.label}
                </li>
              ))}
            </ul>

            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={!valid || loading}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: '#4f2e87' }}
            >
              {loading ? 'Salvando…' : 'Definir senha e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

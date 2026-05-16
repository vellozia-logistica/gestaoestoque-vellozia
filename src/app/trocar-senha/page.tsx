'use client'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'
import { Eye, EyeOff, KeyRound } from 'lucide-react'

const PURPLE = '#4f2e87'

export default function TrocarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showNova, setShowNova] = useState(false)
  const [showConfirmar, setShowConfirmar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (novaSenha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    if (novaSenha !== confirmar) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const res = await fetch('/api/trocar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novaSenha }),
    })

    if (res.ok) {
      await signOut({ callbackUrl: '/login' })
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erro ao trocar senha.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f7fa' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="px-8 py-8 flex flex-col items-center" style={{ backgroundColor: PURPLE }}>
            <Image src="/logo.jpg" alt="Vellozia" width={64} height={64} className="rounded-xl mb-3 object-cover" />
            <h1 className="text-white font-bold text-xl leading-tight">Trocar Senha</h1>
            <p className="text-purple-300 text-sm">Defina sua nova senha de acesso</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              Sua senha foi redefinida pelo administrador. Crie uma nova senha para continuar.
            </p>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nova senha</label>
              <div className="relative">
                <input
                  type={showNova ? 'text' : 'password'}
                  value={novaSenha}
                  onChange={e => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowNova(!showNova)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNova ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirmar ? 'text' : 'password'}
                  value={confirmar}
                  onChange={e => setConfirmar(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowConfirmar(!showConfirmar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmar ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
              style={{ backgroundColor: PURPLE }}>
              <KeyRound size={16} />
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs pb-4">
            Vellozia 2026 · Conciliação Siac x Vellozia
          </p>
        </div>
      </div>
    </div>
  )
}

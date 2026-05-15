'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { hashPassword } from '@/lib/auth'

function RecuperarSenhaForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { users, updateUser } = useStore()

  const [status, setStatus] = useState<'loading' | 'ready' | 'invalid' | 'done'>('loading')
  const [email, setEmail] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [showNova, setShowNova] = useState(false)
  const [showConfirma, setShowConfirma] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) { setStatus('invalid'); return }

    fetch('/api/verificar-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.email) { setEmail(data.email); setStatus('ready') }
        else setStatus('invalid')
      })
      .catch(() => setStatus('invalid'))
  }, [params])

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
    setSaving(true)
    setError('')
    try {
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
      if (!user) { setError('Usuário não encontrado neste dispositivo.'); return }
      const hash = await hashPassword(nova)
      updateUser(user.id, { passwordHash: hash, mustChangePassword: false })
      setStatus('done')
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#f8f7fa' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/logo.jpg" alt="Vellozia" width={80} height={80} className="rounded-xl shadow" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-8 text-gray-500">
              <Loader2 size={32} className="animate-spin text-purple-500" />
              <p className="text-sm">Verificando link…</p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={28} className="text-red-500" />
              </div>
              <h1 className="text-lg font-bold text-gray-800 text-center">Link inválido ou expirado</h1>
              <p className="text-sm text-gray-500 text-center">
                Este link de recuperação não é mais válido. Solicite um novo na página de login.
              </p>
              <button
                onClick={() => router.replace('/login')}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90"
                style={{ backgroundColor: '#4f2e87' }}
              >
                Voltar ao login
              </button>
            </div>
          )}

          {status === 'done' && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-green-500" />
              </div>
              <h1 className="text-lg font-bold text-gray-800 text-center">Senha redefinida!</h1>
              <p className="text-sm text-gray-500 text-center">
                Sua nova senha foi salva com sucesso. Faça login para continuar.
              </p>
              <button
                onClick={() => router.replace('/login')}
                className="w-full py-2.5 rounded-lg text-white font-semibold text-sm hover:opacity-90"
                style={{ backgroundColor: '#4f2e87' }}
              >
                Ir para o login
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <h1 className="text-xl font-bold text-gray-800 mb-1">Nova senha</h1>
              <p className="text-sm text-gray-500 mb-6">
                Defina uma nova senha para <span className="font-medium text-gray-700">{email}</span>
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
                  disabled={!valid || saving}
                  className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
                  style={{ backgroundColor: '#4f2e87' }}
                >
                  {saving ? 'Salvando…' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecuperarSenhaPage() {
  return (
    <Suspense>
      <RecuperarSenhaForm />
    </Suspense>
  )
}

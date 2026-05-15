'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail, User, X, CheckCircle, AlertCircle, Loader2, Send } from 'lucide-react'
import { useStore } from '@/lib/store'
import { verifyPassword, DEFAULT_HASH_MARKER, DEFAULT_PASSWORD, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS } from '@/lib/auth'

const DEFAULT_ADMIN = {
  id: 'admin-default',
  email: 'admin@vellozia.com',
  username: 'admin',
  passwordHash: DEFAULT_HASH_MARKER,
  role: 'administrador' as const,
  mustChangePassword: true,
  createdAt: new Date().toISOString(),
}

type ModalView = 'select' | 'senha-local' | 'senha-email' | 'email-usuario'

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  const masked = '*'.repeat(Math.max(local.length - 2, 3))
  return `${visible}${masked}@${domain}`
}

export default function LoginPage() {
  const router = useRouter()
  const { users, setUsers, setCurrentUser, currentUser, updateUser } = useStore()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [view, setView] = useState<ModalView>('select')

  // Esqueci senha — local reset
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [localStatus, setLocalStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Esqueci senha — por e-mail
  const [emailSendAddr, setEmailSendAddr] = useState('')
  const [emailSendStatus, setEmailSendStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Esqueci meu e-mail
  const [usernameQuery, setUsernameQuery] = useState('')
  const [foundEmail, setFoundEmail] = useState<string | null>(null)
  const [showFullEmail, setShowFullEmail] = useState(false)
  const [emailQueryError, setEmailQueryError] = useState('')

  useEffect(() => {
    if (users.length === 0) setUsers([DEFAULT_ADMIN])
  }, [users, setUsers])

  useEffect(() => {
    if (currentUser) {
      if (currentUser.mustChangePassword) router.replace('/trocar-senha')
      else router.replace('/')
    }
  }, [currentUser, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = users.find(u => u.email === login || u.username === login)
      if (!user) { setError('Usuário não encontrado.'); return }
      const ok = await verifyPassword(password, user.passwordHash)
      if (!ok) { setError('Senha incorreta.'); return }
      setCurrentUser(user)
      if (user.mustChangePassword) router.replace('/trocar-senha')
      else router.replace('/')
    } finally {
      setLoading(false)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setView('select')
    setRecoveryEmail('')
    setLocalStatus('idle')
    setEmailSendAddr('')
    setEmailSendStatus('idle')
    setUsernameQuery('')
    setFoundEmail(null)
    setShowFullEmail(false)
    setEmailQueryError('')
  }

  const handleLocalReset = (e: React.FormEvent) => {
    e.preventDefault()
    const user = users.find(u => u.email.toLowerCase() === recoveryEmail.trim().toLowerCase())
    if (!user) { setLocalStatus('error'); return }
    updateUser(user.id, { passwordHash: DEFAULT_HASH_MARKER, mustChangePassword: true })
    setLocalStatus('success')
  }

  const handleEmailSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const addr = emailSendAddr.trim().toLowerCase()
    const user = users.find(u => u.email.toLowerCase() === addr)
    if (!user) {
      setEmailSendStatus('sent') // não revelar se e-mail existe
      return
    }
    setEmailSendStatus('sending')
    try {
      const res = await fetch('/api/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addr }),
      })
      setEmailSendStatus(res.ok ? 'sent' : 'error')
    } catch {
      setEmailSendStatus('error')
    }
  }

  const handleEmailQuery = (e: React.FormEvent) => {
    e.preventDefault()
    setEmailQueryError('')
    setFoundEmail(null)
    setShowFullEmail(false)
    const user = users.find(u => u.username.toLowerCase() === usernameQuery.trim().toLowerCase())
    if (!user) { setEmailQueryError('Usuário não encontrado.'); return }
    setFoundEmail(user.email)
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8f7fa' }}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 p-12" style={{ backgroundColor: '#4f2e87' }}>
        <Image src="/logo.jpg" alt="Vellozia" width={180} height={180} className="rounded-2xl shadow-2xl mb-8" />
        <h1 className="text-white text-3xl font-bold text-center">Gestão de Estoque</h1>
        <p className="text-purple-200 mt-2 text-center">Conciliação SIAC × Vellozia</p>

        <div className="mt-12 w-full max-w-sm space-y-4">
          {(['usuario', 'desenvolvedor', 'administrador'] as const).map(role => (
            <div key={role} className="rounded-xl p-4" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
              <p className="text-purple-200 text-xs">{ROLE_DESCRIPTIONS[role]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <Image src="/logo.jpg" alt="Vellozia" width={120} height={120} className="rounded-2xl shadow-lg" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Entrar</h2>
          <p className="text-gray-500 text-sm mb-8">Acesse com seu e-mail ou nome de usuário</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail ou usuário</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={login}
                  onChange={e => setLogin(e.target.value)}
                  required
                  placeholder="admin@vellozia.com"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: '#4f2e87' }}
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => { setShowModal(true); setView('select') }}
                className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors"
              >
                Esqueci minha senha / e-mail
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 relative">
            <button onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>

            {/* ── Tela de seleção ── */}
            {view === 'select' && (
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-1">O que você esqueceu?</h3>
                <p className="text-gray-500 text-sm mb-6">Selecione uma opção para continuar.</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setView('senha-local')}
                    className="w-full text-left border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Lock size={17} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Esqueci minha senha</p>
                        <p className="text-xs text-gray-500 mt-0.5">Redefinir aqui ou receber link por e-mail</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setView('email-usuario')}
                    className="w-full text-left border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <Mail size={17} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Esqueci meu e-mail</p>
                        <p className="text-xs text-gray-500 mt-0.5">Encontrar e-mail pelo nome de usuário</p>
                      </div>
                    </div>
                  </button>
                </div>
              </>
            )}

            {/* ── Esqueci senha — opções ── */}
            {view === 'senha-local' && (
              <>
                <button onClick={() => setView('select')}
                  className="text-xs text-purple-600 hover:underline mb-4 block">← Voltar</button>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Esqueci minha senha</h3>
                <p className="text-gray-500 text-sm mb-6">Escolha como deseja recuperar o acesso.</p>

                <div className="space-y-3">
                  <button
                    onClick={() => setView('senha-local')}
                    className="hidden"
                  />
                  {/* Opção 1: Redefinir aqui */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Redefinir para senha padrão</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Informe seu e-mail. A senha será redefinida para{' '}
                      <span className="font-mono font-semibold text-gray-700">{DEFAULT_PASSWORD}</span>{' '}
                      e você poderá criar uma nova ao entrar.
                    </p>

                    {localStatus === 'success' ? (
                      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">Senha redefinida!</p>
                          <p className="text-xs text-green-700 mt-0.5">
                            Use a senha padrão <span className="font-mono font-bold">{DEFAULT_PASSWORD}</span> para entrar.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleLocalReset} className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={recoveryEmail}
                            onChange={e => { setRecoveryEmail(e.target.value); setLocalStatus('idle') }}
                            required
                            placeholder="seu@email.com"
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                          />
                        </div>
                        <button type="submit"
                          className="px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 whitespace-nowrap"
                          style={{ backgroundColor: '#4f2e87' }}>
                          Redefinir
                        </button>
                      </form>
                    )}
                    {localStatus === 'error' && (
                      <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                        <AlertCircle size={12} /> E-mail não encontrado.
                      </p>
                    )}
                  </div>

                  {/* Opção 2: Receber por e-mail */}
                  <div className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Receber link por e-mail</p>
                    <p className="text-xs text-gray-500 mb-3">
                      Enviaremos um link seguro para você criar uma nova senha. Expira em 1 hora.
                    </p>

                    {emailSendStatus === 'sent' ? (
                      <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                        <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-green-800">E-mail enviado!</p>
                          <p className="text-xs text-green-700 mt-0.5">Verifique sua caixa de entrada.</p>
                        </div>
                      </div>
                    ) : emailSendStatus === 'error' ? (
                      <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertCircle size={14} className="text-red-500 shrink-0" />
                        <p className="text-xs text-red-600">Erro ao enviar. Tente redefinir aqui acima.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleEmailSend} className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={emailSendAddr}
                            onChange={e => setEmailSendAddr(e.target.value)}
                            required
                            placeholder="seu@email.com"
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                          />
                        </div>
                        <button type="submit"
                          disabled={emailSendStatus === 'sending'}
                          className="px-3 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 flex items-center gap-1.5"
                          style={{ backgroundColor: '#4f2e87' }}>
                          {emailSendStatus === 'sending'
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Send size={14} />}
                          {emailSendStatus === 'sending' ? 'Enviando…' : 'Enviar'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ── Esqueci meu e-mail ── */}
            {view === 'email-usuario' && (
              <>
                <button onClick={() => setView('select')}
                  className="text-xs text-purple-600 hover:underline mb-4 block">← Voltar</button>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Esqueci meu e-mail</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Informe seu nome de usuário e vamos mostrar o e-mail associado.
                </p>

                <form onSubmit={handleEmailQuery} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome de usuário</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={usernameQuery}
                        onChange={e => { setUsernameQuery(e.target.value); setFoundEmail(null); setEmailQueryError('') }}
                        required
                        placeholder="ex: joao.silva"
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
                      />
                    </div>
                  </div>

                  {emailQueryError && (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <AlertCircle size={14} className="text-red-500 shrink-0" />
                      <p className="text-sm text-red-600">{emailQueryError}</p>
                    </div>
                  )}

                  {foundEmail && (
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
                      <p className="text-xs text-purple-600 font-medium uppercase tracking-wide">E-mail encontrado</p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold text-gray-800">
                          {showFullEmail ? foundEmail : maskEmail(foundEmail)}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowFullEmail(!showFullEmail)}
                          className="text-xs text-purple-600 hover:underline"
                        >
                          {showFullEmail ? 'Ocultar' : 'Mostrar'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setView('senha-local'); setRecoveryEmail(foundEmail); setLocalStatus('idle') }}
                        className="text-xs text-purple-700 hover:underline"
                      >
                        Recuperar senha com este e-mail →
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#4f2e87' }}
                  >
                    Buscar e-mail
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

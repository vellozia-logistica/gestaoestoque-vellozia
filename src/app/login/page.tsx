'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, LogIn, Mail, ArrowLeft } from 'lucide-react'

const PURPLE = '#4f2e87'

type Tela = 'login' | 'recuperar' | 'enviado'

export default function LoginPage() {
  const router = useRouter()
  const [tela, setTela] = useState<Tela>('login')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [emailRecuperar, setEmailRecuperar] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', { email, password, redirect: false })
    if (res?.error) {
      setError('Email ou senha inválidos.')
      setLoading(false)
    } else {
      router.push('/')
    }
  }

  async function handleRecuperar(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setError('')
    const res = await fetch('/api/recuperar-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailRecuperar }),
      signal: AbortSignal.timeout(15000),
    })
    setEnviando(false)
    if (res.ok) {
      setTela('enviado')
    } else {
      setError('Não foi possível enviar o email. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f7fa' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Cabeçalho */}
          <div className="px-8 py-8 flex flex-col items-center" style={{ backgroundColor: PURPLE }}>
            <Image src="/logo.jpg" alt="Vellozia" width={64} height={64} className="rounded-xl mb-3 object-cover" />
            <h1 className="text-white font-bold text-xl leading-tight">Conciliação Siac x Vellozia</h1>
            <p className="text-purple-300 text-sm">Vellozia Produtos Hospitalares</p>
          </div>

          {/* Tela de login */}
          {tela === 'login' && (
            <form onSubmit={handleLogin} className="px-8 py-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Senha</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: PURPLE }}>
                <LogIn size={16} />
                {loading ? 'Entrando...' : 'Entrar'}
              </button>

              <button type="button" onClick={() => { setEmailRecuperar(email); setTela('recuperar') }}
                className="w-full text-center text-xs text-purple-600 hover:underline pt-1">
                Esqueci minha senha
              </button>
            </form>
          )}

          {/* Tela de recuperação */}
          {tela === 'recuperar' && (
            <form onSubmit={handleRecuperar} className="px-8 py-6 space-y-4">
              <button type="button" onClick={() => setTela('login')}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-1">
                <ArrowLeft size={13} /> Voltar ao login
              </button>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1">Recuperar senha</p>
                <p className="text-xs text-gray-400 mb-4">
                  Informe seu email e enviaremos uma nova senha de 8 dígitos. Verifique sua caixa de entrada.
                </p>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input
                  type="email"
                  value={emailRecuperar}
                  onChange={e => setEmailRecuperar(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                />
              </div>

              <button type="submit" disabled={enviando}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold disabled:opacity-60"
                style={{ backgroundColor: PURPLE }}>
                <Mail size={16} />
                {enviando ? 'Enviando...' : 'Enviar nova senha'}
              </button>
            </form>
          )}

          {/* Confirmação de envio */}
          {tela === 'enviado' && (
            <div className="px-8 py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: '#f3f0ff' }}>
                <Mail size={26} style={{ color: PURPLE }} />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Verifique seu email</p>
                <p className="text-xs text-gray-500 mt-1">
                  Se o email <strong>{emailRecuperar}</strong> estiver cadastrado, você receberá uma nova senha em instantes.
                </p>
              </div>
              <button onClick={() => setTela('login')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold"
                style={{ backgroundColor: PURPLE }}>
                <ArrowLeft size={15} /> Voltar ao login
              </button>
            </div>
          )}

          <p className="text-center text-gray-400 text-xs pb-4">
            Vellozia 2026 · Conciliação Siac x Vellozia
          </p>
        </div>
      </div>
    </div>
  )
}

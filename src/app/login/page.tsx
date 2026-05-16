'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, LogIn } from 'lucide-react'

const PURPLE = '#4f2e87'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f7fa' }}>
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-8 flex flex-col items-center" style={{ backgroundColor: PURPLE }}>
            <Image src="/logo.jpg" alt="Vellozia" width={64} height={64} className="rounded-xl mb-3 object-cover" />
            <h1 className="text-white font-bold text-xl leading-tight">Conciliação Siac x Vellozia</h1>
            <p className="text-purple-300 text-sm">Vellozia Produtos Hospitalares</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': PURPLE } as React.CSSProperties}
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
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ backgroundColor: PURPLE }}
            >
              <LogIn size={16} />
              {loading ? 'Entrando...' : 'Entrar'}
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

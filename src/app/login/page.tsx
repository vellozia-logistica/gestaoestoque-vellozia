'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useStore } from '@/lib/store'
import { verifyPassword, DEFAULT_HASH_MARKER, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS } from '@/lib/auth'

const DEFAULT_ADMIN = {
  id: 'admin-default',
  email: 'admin@vellozia.com',
  username: 'admin',
  passwordHash: DEFAULT_HASH_MARKER,
  role: 'administrador' as const,
  mustChangePassword: true,
  createdAt: new Date().toISOString(),
}

export default function LoginPage() {
  const router = useRouter()
  const { users, setUsers, setCurrentUser, currentUser } = useStore()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Seed default admin if no users exist
  useEffect(() => {
    if (users.length === 0) setUsers([DEFAULT_ADMIN])
  }, [users, setUsers])

  // Already logged in
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
          </form>

        </div>
      </div>
    </div>
  )
}

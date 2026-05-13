'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { User, UserRole } from '@/types'
import { hashPassword, DEFAULT_HASH_MARKER, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS } from '@/lib/auth'
import { Plus, Trash2, KeyRound, Shield, X, Info, RotateCcw } from 'lucide-react'

const EMPTY_FORM = { email: '', username: '', role: 'usuario' as UserRole }

export default function GestaoUsuarios() {
  const { users, currentUser, addUser, updateUser, deleteUser, setUsers, setCurrentUser } = useStore()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const newUser: User = {
        id: crypto.randomUUID(),
        email: form.email,
        username: form.username,
        passwordHash: DEFAULT_HASH_MARKER,
        role: form.role,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      }
      addUser(newUser)
      setForm(EMPTY_FORM)
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async (id: string) => {
    setResetId(id)
    try {
      updateUser(id, { passwordHash: DEFAULT_HASH_MARKER, mustChangePassword: true })
    } finally {
      setResetId(null)
    }
  }

  const handleResetAll = () => {
    if (!confirm('Isso vai apagar TODOS os usuários e deslogar. O sistema voltará ao estado inicial com o admin padrão. Continuar?')) return
    setUsers([])
    setCurrentUser(null)
    router.push('/login')
  }

  const handleDelete = (id: string) => {
    if (id === currentUser?.id) return
    const admins = users.filter(u => u.role === 'administrador')
    const target = users.find(u => u.id === id)
    if (target?.role === 'administrador' && admins.length === 1) {
      alert('Não é possível remover o único administrador.')
      return
    }
    if (confirm('Excluir este usuário?')) deleteUser(id)
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h1>
          <p className="text-gray-500 mt-1">{users.length} usuário(s) cadastrado(s)</p>
        </div>
        <div className="flex gap-2">
          {currentUser?.role === 'administrador' && (
            <button
              onClick={handleResetAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50"
            >
              <RotateCcw size={14} /> Resetar tudo
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#4f2e87' }}
          >
            {showForm ? <X size={15} /> : <Plus size={15} />}
            {showForm ? 'Cancelar' : 'Novo usuário'}
          </button>
        </div>
      </div>

      {/* Níveis de acesso — info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {(['usuario', 'desenvolvedor', 'administrador'] as UserRole[]).map(role => (
          <div key={role} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={15} className="text-gray-400" />
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[role]}`}>
                {ROLE_LABELS[role]}
              </span>
            </div>
            <p className="text-xs text-gray-500">{ROLE_DESCRIPTIONS[role]}</p>
          </div>
        ))}
      </div>

      {/* Create user form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Novo usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="usuario@vellozia.com"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nome de usuário</label>
              <input
                type="text"
                required
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                placeholder="joao.silva"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nível de acesso</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              >
                <option value="usuario">Usuário</option>
                <option value="desenvolvedor">Desenvolvedor</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            <Info size={13} />
            O usuário receberá a senha padrão <code className="font-mono">vellozia@2026</code> e será obrigado a trocá-la no primeiro acesso.
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg text-white text-sm font-medium"
            style={{ backgroundColor: '#4f2e87' }}
          >
            {saving ? 'Criando…' : 'Criar usuário'}
          </button>
        </form>
      )}

      {/* Users table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuário</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nível</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map(user => (
              <tr key={user.id} className={user.id === currentUser?.id ? 'bg-purple-50' : 'hover:bg-gray-50'}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">{user.username}</div>
                  {user.id === currentUser?.id && (
                    <span className="text-xs text-purple-500">Você</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={user.role}
                    onChange={e => updateUser(user.id, { role: e.target.value as UserRole })}
                    disabled={user.id === currentUser?.id}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-300 bg-white disabled:opacity-50"
                  >
                    <option value="usuario">Usuário</option>
                    <option value="desenvolvedor">Desenvolvedor</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  {user.mustChangePassword ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Aguarda 1º acesso</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Ativo</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleResetPassword(user.id)}
                      disabled={resetId === user.id}
                      title="Redefinir senha para padrão"
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    >
                      <KeyRound size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === currentUser?.id}
                      title="Excluir usuário"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors disabled:opacity-30"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

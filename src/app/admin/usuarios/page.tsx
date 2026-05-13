'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/lib/store'
import { User, UserRole } from '@/types'
import { DEFAULT_HASH_MARKER, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_COLORS } from '@/lib/auth'
import { Plus, Trash2, KeyRound, Shield, X, Info, RotateCcw, Users, AlertTriangle, CheckCircle2 } from 'lucide-react'

const EMPTY_FORM = { email: '', username: '', role: 'usuario' as UserRole }

interface BulkRow { email: string; username: string; role: UserRole; ok: boolean; erro?: string }

function parseBulkCSV(raw: string, existingEmails: Set<string>): BulkRow[] {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'))
  return lines.map(line => {
    const sep = line.includes(';') ? ';' : ','
    const [emailRaw, usernameRaw, roleRaw] = line.split(sep).map(s => s.trim())
    const email = emailRaw ?? ''
    const username = usernameRaw ?? ''
    const roleNorm = (roleRaw ?? 'usuario').toLowerCase()
    const roleMap: Record<string, UserRole> = {
      usuario: 'usuario', user: 'usuario',
      desenvolvedor: 'desenvolvedor', dev: 'desenvolvedor',
      administrador: 'administrador', admin: 'administrador',
    }
    const role: UserRole = roleMap[roleNorm] ?? 'usuario'
    if (!email || !username) return { email, username, role, ok: false, erro: 'E-mail e nome obrigatórios' }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { email, username, role, ok: false, erro: 'E-mail inválido' }
    if (existingEmails.has(email)) return { email, username, role, ok: false, erro: 'E-mail já cadastrado' }
    return { email, username, role, ok: true }
  })
}

export default function GestaoUsuarios() {
  const { users, currentUser, addUser, updateUser, deleteUser, setUsers, setCurrentUser } = useStore()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [showBulk, setShowBulk] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([])

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

  const handleBulkParse = (text: string) => {
    setBulkText(text)
    if (!text.trim()) { setBulkRows([]); return }
    const existingEmails = new Set(users.map(u => u.email))
    setBulkRows(parseBulkCSV(text, existingEmails))
  }

  const handleBulkImport = () => {
    const valid = bulkRows.filter(r => r.ok)
    if (valid.length === 0) return
    valid.forEach(r => {
      addUser({
        id: crypto.randomUUID(),
        email: r.email,
        username: r.username,
        passwordHash: DEFAULT_HASH_MARKER,
        role: r.role,
        mustChangePassword: true,
        createdAt: new Date().toISOString(),
      })
    })
    setShowBulk(false)
    setBulkText('')
    setBulkRows([])
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
        <div className="flex gap-2 flex-wrap">
          {currentUser?.role === 'administrador' && (
            <button
              onClick={handleResetAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50"
            >
              <RotateCcw size={14} /> Resetar tudo
            </button>
          )}
          <button
            onClick={() => { setShowBulk(!showBulk); setShowForm(false) }}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
          >
            <Users size={15} /> Adicionar em massa
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setShowBulk(false) }}
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

      {/* Bulk import panel */}
      {showBulk && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-1">Adicionar usuários em massa</h2>
          <p className="text-xs text-gray-500 mb-3">
            Cole uma linha por usuário no formato: <code className="bg-gray-100 px-1 rounded">email, nome_usuario, papel</code>
            {' '}— papel pode ser <code className="bg-gray-100 px-1 rounded">usuario</code>, <code className="bg-gray-100 px-1 rounded">desenvolvedor</code> ou <code className="bg-gray-100 px-1 rounded">administrador</code>.
            Separador vírgula ou ponto-e-vírgula. Linhas com # são ignoradas.
          </p>
          <textarea
            rows={6}
            value={bulkText}
            onChange={e => handleBulkParse(e.target.value)}
            placeholder={`# Exemplo:\njoao@vellozia.com, joao.silva, usuario\nmaria@vellozia.com, maria.souza, administrador\npedro@vellozia.com, pedro.lima, desenvolvedor`}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />

          {bulkRows.length > 0 && (
            <div className="mt-4">
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">E-mail</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Usuário</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Papel</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bulkRows.map((r, i) => (
                      <tr key={i} className={r.ok ? 'bg-white' : 'bg-red-50'}>
                        <td className="px-3 py-2 font-mono text-gray-700">{r.email || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-2 text-gray-700">{r.username || <span className="text-gray-300">—</span>}</td>
                        <td className="px-3 py-2">
                          <span className={`px-1.5 py-0.5 rounded-full font-medium ${ROLE_COLORS[r.role]}`}>{ROLE_LABELS[r.role]}</span>
                        </td>
                        <td className="px-3 py-2">
                          {r.ok
                            ? <span className="flex items-center gap-1 text-green-600"><CheckCircle2 size={12} /> OK</span>
                            : <span className="flex items-center gap-1 text-red-500"><AlertTriangle size={12} /> {r.erro}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={handleBulkImport}
                  disabled={bulkRows.filter(r => r.ok).length === 0}
                  className="flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium disabled:opacity-40"
                  style={{ backgroundColor: '#4f2e87' }}
                >
                  <Users size={14} />
                  Importar {bulkRows.filter(r => r.ok).length} usuário(s)
                </button>
                {bulkRows.some(r => !r.ok) && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle size={12} /> {bulkRows.filter(r => !r.ok).length} linha(s) com erro serão ignoradas
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
            <Info size={13} />
            Todos os usuários importados receberão a senha padrão e serão obrigados a trocá-la no primeiro acesso.
          </div>
        </div>
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

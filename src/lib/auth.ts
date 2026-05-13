export const DEFAULT_PASSWORD = 'vellozia@2026'
export const DEFAULT_HASH_MARKER = '__DEFAULT__'

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + ':vellozia-2026')
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash === DEFAULT_HASH_MARKER) return password === DEFAULT_PASSWORD
  const computed = await hashPassword(password)
  return computed === hash
}

export const ROLE_LABELS: Record<string, string> = {
  usuario: 'Usuário',
  desenvolvedor: 'Desenvolvedor',
  administrador: 'Administrador',
}

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  usuario: 'Acesso somente leitura ao Estoque Consolidado.',
  desenvolvedor: 'Baixa modelos Excel e faz upload de arquivos CSV. Não acessa relacionamentos.',
  administrador: 'Acesso completo: upload, relacionamentos e gestão de usuários.',
}

export const ROLE_COLORS: Record<string, string> = {
  usuario: 'bg-blue-100 text-blue-700',
  desenvolvedor: 'bg-amber-100 text-amber-700',
  administrador: 'bg-purple-100 text-purple-700',
}

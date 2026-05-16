import { DefaultSession, DefaultJWT } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: { role: string; mustChangePassword: boolean } & DefaultSession['user']
  }
  interface User {
    role: string
    mustChangePassword: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: string
    mustChangePassword: boolean
  }
}

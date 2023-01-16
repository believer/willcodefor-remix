import bcrypt from 'bcryptjs'
import { createCookieSessionStorage, redirect } from '@remix-run/node'

const sessionSecret = process.env.SESSION_SECRET

if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: 'willcodefor_session',
    secure: process.env.NODE_ENV === 'production',
    secrets: [sessionSecret],
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function login(password: string) {
  const adminPass = process.env.ADMIN_PASSWORD
  const isCorrectPassword = await bcrypt.compare(password, adminPass)

  if (!isCorrectPassword) {
    return null
  }

  return true
}

export async function register(password: string) {
  const password_hash = await bcrypt.hash(password, 10)

  console.log(password_hash)
}

export async function createUserSession() {
  const session = await storage.getSession()
  session.set('user', 'admin')

  return redirect('/admin/posts', {
    headers: {
      'Set-Cookie': await storage.commitSession(session),
    },
  })
}

export function getUserSession(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

export async function requireUser(request: Request) {
  const session = await getUserSession(request)
  const userId = session.get('user')

  if (!userId) {
    throw redirect(`/admin`)
  }

  return Number(userId)
}

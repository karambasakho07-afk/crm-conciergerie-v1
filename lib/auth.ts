import { cookies } from 'next/headers'

export function requireSession() {
  const cookie = cookies().get('admin_session')?.value
  return Boolean(cookie)
}

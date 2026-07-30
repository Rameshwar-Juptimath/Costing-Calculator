import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'

export async function getServerUser() {
  const token = (await cookies()).get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || 'secret'))
    return payload
  } catch {
    return null
  }
}

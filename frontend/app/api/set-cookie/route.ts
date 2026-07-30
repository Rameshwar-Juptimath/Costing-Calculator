import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { token } = await req.json()
  ;(await cookies()).set('token', token, { httpOnly: true, path: '/' })
  return NextResponse.json({ success: true })
}

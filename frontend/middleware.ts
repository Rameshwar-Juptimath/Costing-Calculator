import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_ROUTES = ['/dashboard', '/estimate']

export async function middleware(req: NextRequest) {
  const isProtected = PROTECTED_ROUTES.some(r => req.nextUrl.pathname === r || req.nextUrl.pathname.startsWith(r + '/'))
  if (!isProtected) return NextResponse.next()
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || '5bc546819e54e30f554eb6d279bb8c5a6a4e7ca8190fdf6439c51d3719c21f0e')
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = { matcher: ['/dashboard', '/dashboard/:path*', '/estimate', '/estimate/:path*'] }

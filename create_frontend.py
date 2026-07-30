import os

base_dir = r"d:\Work\My_Work\freelance_projects\Costing_calculator\frontend"

files = {
    "package.json": """{
  "name": "costing-engine-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18",
    "react-dom": "^18",
    "@react-three/fiber": "^8",
    "@react-three/drei": "^9",
    "three": "^0.166",
    "zustand": "^4",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "zod": "^3",
    "jose": "^5",
    "framer-motion": "^11",
    "clsx": "^2",
    "lucide-react": "^0.400.0",
    "sharp": "^0.33",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/three": "^0.166",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10",
    "postcss": "^8",
    "@playwright/test": "^1.45"
  }
}""",
    "next.config.mjs": """/** @type {import('next').NextConfig} */
const config = {
  output: 'standalone',
  transpilePackages: ['three'],
  images: { domains: [] },
};
export default config;""",
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}""",
    "tailwind.config.ts": """import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'] },
      colors: {
        slate: { 950: '#0f172a' }
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(135deg, #3b82f6, #6366f1)',
      }
    }
  },
  plugins: [],
}
export default config""",
    "postcss.config.js": """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}""",
    "middleware.ts": """import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PROTECTED_ROUTES = ['/dashboard', '/estimate']

export async function middleware(req: NextRequest) {
  const isProtected = PROTECTED_ROUTES.some(r => req.nextUrl.pathname.startsWith(r))
  if (!isProtected) return NextResponse.next()
  const token = req.cookies.get('token')?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret')
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = { matcher: ['/dashboard/:path*', '/estimate/:path*'] }""",
    "app/globals.css": """@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

:root { --bg-primary: #0f172a; --bg-card: #1e293b; }
body { background-color: var(--bg-primary); color: #f1f5f9; font-family: 'Inter', sans-serif; }

/* Custom scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #1e293b; }
::-webkit-scrollbar-thumb { background: #475569; border-radius: 3px; }

/* Glassmorphism utility */
.glass { backdrop-filter: blur(16px); background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(148, 163, 184, 0.1); }""",
    "app/layout.tsx": """import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CostCalc — Manufacturing Cost Engine',
  description: 'Precision manufacturing cost estimation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">{children}</body>
    </html>
  )
}""",
    "app/page.tsx": """import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const token = (await cookies()).get('token')?.value
  if (token) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}""",
    "app/(auth)/layout.tsx": """export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 to-slate-950 p-4">
      {children}
    </div>
  )
}""",
    "app/(auth)/login/page.tsx": """'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const setToken = useCostingStore(s => s.setToken)
  const setUser = useCostingStore(s => s.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        throw new Error('Invalid email or password')
      }
      const data = await res.json()
      
      // Store token in state
      setToken(data.access_token)
      
      // Set token cookie
      await fetch('/api/set-cookie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: data.access_token })
      })
      
      // Fetch me
      const meRes = await fetch('http://localhost:8000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      })
      if (meRes.ok) {
        const meData = await meRes.json()
        setUser(meData, meData.features)
      }
      
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md p-8 glass" glass>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-accent mb-2">CostCalc</h1>
        <p className="text-slate-400">Precision manufacturing cost estimation</p>
      </div>
      {error && <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Email" 
          type="email" 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          required 
          data-testid="email-input"
        />
        <Input 
          label="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          required 
          data-testid="password-input"
        />
        <Button 
          type="submit" 
          className="w-full mt-6" 
          loading={loading}
          data-testid="login-button"
        >
          Sign In
        </Button>
      </form>
    </Card>
  )
}""",
    "app/api/set-cookie/route.ts": """import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { token } = await req.json()
  ;(await cookies()).set('token', token, { httpOnly: true, path: '/' })
  return NextResponse.json({ success: true })
}""",
    "app/api/logout/route.ts": """import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  ;(await cookies()).delete('token')
  return NextResponse.json({ success: true })
}""",
    "app/(dashboard)/layout.tsx": """'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCostingStore } from '@/store/costingStore'
import { Button } from '@/components/ui/Button'
import { LayoutDashboard, FilePlus2, History, LogOut } from 'lucide-react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const token = useCostingStore(s => s.token)
  const user = useCostingStore(s => s.user)
  const setUser = useCostingStore(s => s.setUser)
  const logoutStore = useCostingStore(s => s.logout)

  useEffect(() => {
    if (token && !user) {
      fetch('http://localhost:8000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => setUser(data, data.features))
      .catch(console.error)
    }
  }, [token, user, setUser])

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' })
    logoutStore()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex bg-slate-950">
      <aside className="w-64 glass border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-accent">CostCalc</h1>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/estimate" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/estimate' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <FilePlus2 className="w-5 h-5" />
            <span>New Estimate</span>
          </Link>
          <Link href="/dashboard/history" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/dashboard/history' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
            <History className="w-5 h-5" />
            <span>History</span>
          </Link>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass border-b border-slate-800 px-8 flex items-center justify-end">
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-medium text-white">{user?.email}</div>
              <div className="text-xs text-slate-400">{user?.tenant_name}</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white transition-colors" data-testid="logout-button">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}""",
    "app/(dashboard)/page.tsx": """'use client'
import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { FilePlus2, IndianRupee, Layers } from 'lucide-react'

export default function DashboardPage() {
  const user = useCostingStore(s => s.user)
  const router = useRouter()

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.tenant_name || 'User'}</h1>
          <p className="text-slate-400">Here's an overview of your manufacturing estimates.</p>
        </div>
        <Button onClick={() => router.push('/estimate')} className="flex items-center space-x-2">
          <FilePlus2 className="w-4 h-4" />
          <span>New Estimate</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Estimates</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <IndianRupee className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Latest Cost (INR)</p>
              <p className="text-2xl font-bold text-white">₹0.00</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Current Tier</p>
              <Badge variant={user?.tier === 'Pro' ? 'pro' : 'basic'} data-testid="tier-badge">
                {user?.tier || 'Basic'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
      
      <Card title="Recent Estimates" className="p-6">
        <div className="text-center py-12 text-slate-400">
          <p>No estimates found.</p>
          <Button variant="ghost" className="mt-4" onClick={() => router.push('/estimate')}>
            Create your first estimate
          </Button>
        </div>
      </Card>
    </div>
  )
}""",
    "app/(dashboard)/estimate/page.tsx": """'use client'
import { CADViewer } from '@/components/viewer/CADViewer'
import { WizardShell } from '@/components/wizard/WizardShell'
import { useCostingStore } from '@/store/costingStore'

export default function EstimatePage() {
  const meshUrl = useCostingStore(s => s.meshUrl)
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">New Estimate</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          {/* Uploader would go here. For now just viewer */}
          <CADViewer meshUrl={meshUrl} />
        </div>
        <div className="lg:col-span-2">
          <WizardShell />
        </div>
      </div>
    </div>
  )
}""",
    "components/ui/Button.tsx": """import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', loading, className = '', children, disabled, ...props }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  }
  
  const variantClasses = {
    primary: 'bg-gradient-accent text-white shadow-blue-500/20 hover:shadow-blue-500/40 shadow-lg hover:scale-[1.02]',
    secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
    ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-slate-800',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
  }
  
  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  )
}""",
    "components/ui/Input.tsx": """import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <input
        ref={ref}
        className={`w-full bg-slate-900 border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'} text-slate-100 rounded-lg px-4 py-2 outline-none focus:ring-1 transition-all ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})
Input.displayName = 'Input'""",
    "components/ui/Card.tsx": """import React from 'react'

interface CardProps {
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
  glass?: boolean
}

export function Card({ title, children, className = '', glass = false }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-700/50 ${glass ? 'glass' : 'bg-slate-800'} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
      )}
      <div className={title ? '' : 'h-full'}>
        {children}
      </div>
    </div>
  )
}""",
    "components/ui/Modal.tsx": """import React from 'react'

interface ModalProps {
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-lg p-1 animate-in fade-in zoom-in duration-200">
        <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
          {children}
        </div>
      </div>
    </div>
  )
}""",
    "components/ui/Badge.tsx": """import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'basic' | 'pro' | 'success'
}

export function Badge({ children, variant = 'basic', ...props }: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) {
  const variants = {
    basic: 'bg-slate-700 text-slate-100',
    pro: 'bg-gradient-accent text-white shadow-sm shadow-blue-500/20',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`} {...props}>
      {children}
    </span>
  )
}""",
    "components/ui/CurrencyInput.tsx": """import React, { forwardRef } from 'react'

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-400 sm:text-sm">₹</span>
        </div>
        <input
          ref={ref}
          type="text"
          className={`w-full bg-slate-900 border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'} text-slate-100 rounded-lg pl-8 pr-4 py-2 outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})
CurrencyInput.displayName = 'CurrencyInput'""",
    "components/viewer/CADViewer.tsx": """'use client'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('./Scene'), { ssr: false })

function EmptyViewerPlaceholder() {
  return (
    <div className="w-full h-80 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700/50 text-slate-500">
      No model loaded
    </div>
  )
}

export function CADViewer({ meshUrl }: { meshUrl: string | null }) {
  if (!meshUrl) return <EmptyViewerPlaceholder />
  return (
    <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
      <Scene meshUrl={meshUrl} />
    </div>
  )
}""",
    "components/viewer/Scene.tsx": """'use client'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Grid } from '@react-three/drei'
import { Suspense } from 'react'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export default function Scene({ meshUrl }: { meshUrl: string }) {
  return (
    <Canvas camera={{ position: [30, 30, 30], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Model url={meshUrl} />
      </Suspense>
      <OrbitControls enablePan enableZoom enableRotate />
      <Environment preset="city" />
      <Grid args={[100, 100]} cellColor="#334155" sectionColor="#475569" />
    </Canvas>
  )
}""",
    "components/FeatureGate.tsx": """'use client'
import { useCostingStore } from '@/store/costingStore'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'
import { LockIcon, StarIcon } from 'lucide-react'
import { UserFeatures } from '@/store/costingStore'

interface FeatureGateProps {
  feature: keyof UserFeatures
  children: React.ReactNode
}

export function FeatureGate({ feature, children }: FeatureGateProps) {
  const features = useCostingStore(s => s.features)
  const [showModal, setShowModal] = useState(false)
  
  if (!features || features[feature]) return <>{children}</>
  
  return (
    <div className="relative">
      {/* Blurred/locked overlay */}
      <div className="pointer-events-none opacity-30 blur-sm select-none">
        {children}
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={() => setShowModal(true)}
        data-testid="upsell-modal-trigger"
      >
        <div className="glass rounded-xl p-6 text-center shadow-lg transition-transform hover:scale-105">
          <LockIcon className="mx-auto w-8 h-8 text-slate-300" />
          <p className="text-slate-200 font-semibold mt-2">Pro Feature</p>
          <p className="text-slate-400 text-sm">Click to learn more</p>
        </div>
      </div>
      {showModal && <UpsellModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function UpsellModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="text-center p-8" data-testid="upsell-modal">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <StarIcon className="w-8 h-8 text-white" fill="currentColor" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
        <p className="text-slate-400 mb-6">
          Unlock Overhead Cost analysis, Tax calculations, and Profit Margin
          estimation to get a complete picture of your manufacturing costs.
        </p>
        <div className="space-y-3 text-left mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          {[
            'Overhead Cost breakdown (7 categories)',
            'GST / Tax calculation',
            'Profit margin analysis',
            'Full cost report export',
          ].map(f => (
            <div key={f} className="flex items-center text-slate-300 text-sm">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {f}
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-sm">Contact your administrator to upgrade your plan.</p>
        <button onClick={onClose} className="mt-6 text-slate-400 hover:text-white text-sm transition-colors">Close</button>
      </div>
    </Modal>
  )
}""",
    "components/wizard/WizardShell.tsx": """'use client'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FullCostSchema } from '@/lib/schemas'
import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Step1DirectCost } from './Step1DirectCost'
import { Step2Overhead } from './Step2Overhead'
import { Step3Commercials } from './Step3Commercials'
import { FeatureGate } from '../FeatureGate'
import { ResultsPanel } from '../ResultsPanel'
import { useState } from 'react'

export function WizardShell() {
  const { currentStep, setStep, token, estimateId, costResult, setCostResult } = useCostingStore()
  const [loading, setLoading] = useState(false)
  const methods = useForm({
    resolver: zodResolver(FullCostSchema),
    shouldUnregister: false,
    defaultValues: {
      raw_material: '0.00', tooling: '0.00', manufacturing: '0.00', labour: '0.00', inspection: '0.00', logistics: '0.00',
      factory_rent: '0.00', machinery_asset: '0.00', electricity: '0.00', telecom: '0.00', admin: '0.00', fixed_salary: '0.00', expenses: '0.00',
      tax_rate: '0.0', profit_margin_rate: '0.0'
    }
  })

  const onSubmit = async (data: any) => {
    if (currentStep < 3) {
      setStep((currentStep + 1) as 2|3)
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch('http://localhost:8000/api/v1/cost/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          estimate_id: estimateId || '00000000-0000-0000-0000-000000000000', // Mock UUID if none
          currency: 'INR',
          direct_cost: {
            raw_material: Number(data.raw_material),
            tooling: Number(data.tooling),
            manufacturing: Number(data.manufacturing),
            labour: Number(data.labour),
            inspection: Number(data.inspection),
            logistics: Number(data.logistics)
          },
          overhead_cost: {
            factory_rent: Number(data.factory_rent),
            machinery_asset: Number(data.machinery_asset),
            electricity: Number(data.electricity),
            telecom: Number(data.telecom),
            admin: Number(data.admin),
            fixed_salary: Number(data.fixed_salary),
            expenses: Number(data.expenses)
          },
          commercials: {
            tax_rate: Number(data.tax_rate),
            profit_margin_rate: Number(data.profit_margin_rate)
          }
        })
      })
      if (!res.ok) throw new Error('Calculation failed')
      const result = await res.json()
      setCostResult(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (costResult) {
    return <ResultsPanel />
  }

  const steps = [
    { num: 1, label: 'Direct' },
    { num: 2, label: 'Overhead' },
    { num: 3, label: 'Commercials' }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-accent rounded-full z-0 transition-all duration-300" style={{ width: `${(currentStep - 1) * 50}%` }}></div>
        {steps.map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= s.num ? 'bg-gradient-accent text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              {s.num}
            </div>
            <div className="absolute top-12 whitespace-nowrap text-xs font-medium text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {currentStep === 1 && <Step1DirectCost />}
            {currentStep === 2 && (
              <FeatureGate feature="can_access_overhead_cost">
                <div data-testid="overhead-form"><Step2Overhead /></div>
              </FeatureGate>
            )}
            {currentStep === 3 && (
              <FeatureGate feature="can_access_tax">
                <Step3Commercials />
              </FeatureGate>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep((currentStep - 1) as 1|2)}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                data-testid="step-next-btn"
              >
                {currentStep === 3 ? 'Calculate Total' : 'Next Step'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Card>
  )
}""",
    "components/wizard/Step1DirectCost.tsx": """import { useFormContext } from 'react-hook-form'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

export function Step1DirectCost() {
  const { register, watch, formState: { errors } } = useFormContext()
  const values = watch(['raw_material', 'tooling', 'manufacturing', 'labour', 'inspection', 'logistics'])
  const subtotal = values.reduce((acc, val) => acc + (Number(val) || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-white">Direct Costs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput label="Raw Material" {...register('raw_material')} error={errors.raw_material?.message as string} />
        <CurrencyInput label="Tooling" {...register('tooling')} error={errors.tooling?.message as string} />
        <CurrencyInput label="Manufacturing" {...register('manufacturing')} error={errors.manufacturing?.message as string} />
        <CurrencyInput label="Labour" {...register('labour')} error={errors.labour?.message as string} />
        <CurrencyInput label="Inspection" {...register('inspection')} error={errors.inspection?.message as string} />
        <CurrencyInput label="Logistics" {...register('logistics')} error={errors.logistics?.message as string} />
      </div>
      <div className="p-4 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800">
        <span className="text-slate-400 font-medium">Direct Subtotal</span>
        <span className="text-xl font-bold text-white">₹{subtotal.toFixed(2)}</span>
      </div>
    </div>
  )
}""",
    "components/wizard/Step2Overhead.tsx": """import { useFormContext } from 'react-hook-form'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

export function Step2Overhead() {
  const { register, watch, formState: { errors } } = useFormContext()
  const values = watch(['factory_rent', 'machinery_asset', 'electricity', 'telecom', 'admin', 'fixed_salary', 'expenses'])
  const subtotal = values.reduce((acc, val) => acc + (Number(val) || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-white">Overhead Costs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput label="Factory Rent" {...register('factory_rent')} error={errors.factory_rent?.message as string} />
        <CurrencyInput label="Machinery & Assets" {...register('machinery_asset')} error={errors.machinery_asset?.message as string} />
        <CurrencyInput label="Electricity Bills" {...register('electricity')} error={errors.electricity?.message as string} />
        <CurrencyInput label="Internet / Telecom" {...register('telecom')} error={errors.telecom?.message as string} />
        <CurrencyInput label="Admin & Stationery" {...register('admin')} error={errors.admin?.message as string} />
        <CurrencyInput label="Fixed Salary" {...register('fixed_salary')} error={errors.fixed_salary?.message as string} />
        <CurrencyInput label="Other Expenses" {...register('expenses')} error={errors.expenses?.message as string} />
      </div>
      <div className="p-4 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800">
        <span className="text-slate-400 font-medium">Overhead Subtotal</span>
        <span className="text-xl font-bold text-white">₹{subtotal.toFixed(2)}</span>
      </div>
    </div>
  )
}""",
    "components/wizard/Step3Commercials.tsx": """import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'

export function Step3Commercials() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-white">Commercials & Margins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="GST / Tax Rate (%)" {...register('tax_rate')} error={errors.tax_rate?.message as string} placeholder="18.0" />
        <Input label="Profit Margin (%)" {...register('profit_margin_rate')} error={errors.profit_margin_rate?.message as string} placeholder="15.0" />
      </div>
    </div>
  )
}""",
    "components/ResultsPanel.tsx": """import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export function ResultsPanel() {
  const costResult = useCostingStore(s => s.costResult)
  const setCostResult = useCostingStore(s => s.setCostResult)
  const setStep = useCostingStore(s => s.setStep)

  if (!costResult) return null

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-white">Estimate Result</h2>
        <Button variant="ghost" size="sm" onClick={() => { setCostResult(null); setStep(1); }}>
          Start Over
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-accent p-8 text-center text-white">
          <p className="text-blue-100 font-medium mb-1">Grand Total</p>
          <div className="text-4xl font-extrabold">₹{costResult.totals.grand_total.toFixed(2)}</div>
          <div className="mt-2 text-sm text-blue-200">Includes {costResult.totals.tax_amount > 0 ? 'Tax and ' : ''}Profit Margin</div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Direct Cost Breakdown</h3>
            <div className="space-y-2 text-sm">
              {Object.entries(costResult.breakdown.direct_cost).filter(([k]) => k !== 'subtotal').map(([k, v]) => (
                <div key={k} className="flex justify-between text-slate-300">
                  <span className="capitalize">{k.replace('_', ' ')}</span>
                  <span>₹{Number(v).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-white font-medium pt-2 border-t border-slate-700/50">
                <span>Subtotal</span>
                <span>₹{costResult.totals.direct_subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {costResult.breakdown.overhead_cost && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Overhead Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Factory Rent</span><span>₹{costResult.breakdown.overhead_cost.factory_rent.toFixed(2)}</span>
                </div>
                {/* Omitted rest for brevity in preview, just show subtotal */}
                <div className="flex justify-between text-slate-300">
                  <span>Other Overheads</span>
                  <span>₹{(costResult.totals.overhead_subtotal - costResult.breakdown.overhead_cost.factory_rent).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-medium pt-2 border-t border-slate-700/50">
                  <span>Subtotal</span>
                  <span>₹{costResult.totals.overhead_subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {costResult.breakdown.commercials && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Commercials</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Tax ({costResult.breakdown.commercials.tax_rate}%)</span>
                  <span>₹{costResult.totals.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Margin ({costResult.breakdown.commercials.profit_margin_rate}%)</span>
                  <span>₹{costResult.totals.margin_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}""",
    "store/costingStore.ts": """import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserFeatures {
  can_access_direct_cost: boolean
  can_access_overhead_cost: boolean
  can_access_tax: boolean
  can_access_profit_margin: boolean
}

export interface AuthUser {
  id: string
  email: string
  role: string
  tenant_id: string
  tenant_name: string
  tier: 'Basic' | 'Pro'
}

interface CostingStore {
  user: AuthUser | null
  features: UserFeatures | null
  token: string | null
  estimateId: string | null
  geometry: any | null
  meshUrl: string | null
  costResult: any | null
  currentStep: 1 | 2 | 3
  setUser: (user: AuthUser, features: UserFeatures) => void
  setToken: (token: string) => void
  setEstimate: (id: string, geometry: any, meshUrl: string | null) => void
  setCostResult: (result: any) => void
  setStep: (step: 1 | 2 | 3) => void
  logout: () => void
}

export const useCostingStore = create<CostingStore>()(persist(
  (set) => ({
    user: null, features: null, token: null,
    estimateId: null, geometry: null, meshUrl: null,
    costResult: null, currentStep: 1,
    setUser: (user, features) => set({ user, features }),
    setToken: (token) => set({ token }),
    setEstimate: (estimateId, geometry, meshUrl) => set({ estimateId, geometry, meshUrl }),
    setCostResult: (costResult) => set({ costResult }),
    setStep: (currentStep) => set({ currentStep }),
    logout: () => set({ user: null, features: null, token: null, estimateId: null, geometry: null, meshUrl: null, costResult: null, currentStep: 1 }),
  }),
  { name: 'costing-store' }
))""",
    "lib/api.ts": """const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function apiClient<T>(path: string, options?: RequestInit, token?: string): Promise<T> {
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options?.headers || {}) }
  if (token) (headers as any)['Authorization'] = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}""",
    "lib/auth.ts": """import { cookies } from 'next/headers'
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
}""",
    "lib/schemas.ts": """import { z } from 'zod'
const DecimalStr = z.string().regex(/^\\d+(\\.\\d{0,2})?$/, 'Must be a valid amount')

export const DirectCostSchema = z.object({
  raw_material: DecimalStr,
  tooling: DecimalStr,
  manufacturing: DecimalStr,
  labour: DecimalStr,
  inspection: DecimalStr,
  logistics: DecimalStr,
})

export const OverheadCostSchema = z.object({
  factory_rent: DecimalStr,
  machinery_asset: DecimalStr,
  electricity: DecimalStr,
  telecom: DecimalStr,
  admin: DecimalStr,
  fixed_salary: DecimalStr,
  expenses: DecimalStr,
})

export const CommercialsSchema = z.object({
  tax_rate: z.string().regex(/^\\d+(\\.\\d)?$/).transform(Number),
  profit_margin_rate: z.string().regex(/^\\d+(\\.\\d)?$/).transform(Number),
})

export const FullCostSchema = DirectCostSchema.merge(OverheadCostSchema).merge(CommercialsSchema)""",
    "e2e/playwright.config.ts": """import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './',
  use: { baseURL: 'http://localhost:3000', headless: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: true },
})""",
    "e2e/rbac.spec.ts": """import { test, expect } from '@playwright/test'

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/dashboard')
}

test.describe('RBAC — Basic Tier', () => {
  test.beforeEach(async ({ page }) => {
    // Requires backend to return Basic tier
    await loginAs(page, 'admin@example.com', 'Admin@123!')
  })

  test('Step 2 (Overhead) shows upsell modal, not form inputs', async ({ page }) => {
    await page.goto('/estimate')
    await page.click('[data-testid="step-next-btn"]')
    await expect(page.locator('[data-testid="upsell-modal-trigger"]')).toBeVisible()
    await expect(page.locator('[data-testid="overhead-form"]')).not.toBeVisible()
  })

  test('Clicking locked overlay opens upsell modal', async ({ page }) => {
    await page.goto('/estimate')
    await page.click('[data-testid="step-next-btn"]')
    await page.click('[data-testid="upsell-modal-trigger"]')
    await expect(page.locator('[data-testid="upsell-modal"]')).toBeVisible()
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible()
  })

  test('Dashboard shows Basic tier badge', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="tier-badge"]')).toContainText('Basic')
  })
})

test('Logout redirects to login page', async ({ page }) => {
  await loginAs(page, 'admin@example.com', 'Admin@123!')
  await page.click('[data-testid="logout-button"]')
  await expect(page).toHaveURL('/login')
})

test('Protected route without token redirects to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/login')
})"""
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files created successfully.")

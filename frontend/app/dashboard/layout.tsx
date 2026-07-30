'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCostingStore } from '@/store/costingStore'
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      fetch(`${apiUrl}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch profile')
        return res.json()
      })
      .then(data => setUser(data, data.features))
      .catch(console.error)
    }
  }, [token, user, setUser])

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (e) {
      console.error(e)
    }
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
          <Link href="/estimate" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/estimate' || pathname === '/dashboard/estimate' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
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
}

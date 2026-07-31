'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCostingStore } from '@/store/costingStore'
import { PlusCircle, History, Settings, Sparkles, LogOut, Shield } from 'lucide-react'

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

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard' || pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 selection:bg-indigo-100 font-sans">
      {/* SideNavBar (240px fixed width per design system) */}
      <aside className="w-[240px] min-w-[240px] bg-slate-900 text-white flex flex-col h-screen sticky top-0 border-r border-slate-800 z-50">
        <div className="p-5 border-b border-slate-800">
          <h1 className="text-xl font-bold text-indigo-400 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>CostEngine Pro</span>
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-1">
            Precision Costing System
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
              isLinkActive('/dashboard') && !isLinkActive('/dashboard/history') && !isLinkActive('/dashboard/settings') && !isLinkActive('/dashboard/upgrade')
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Estimator Workspace</span>
          </Link>

          <Link
            href="/dashboard/history"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
              isLinkActive('/dashboard/history')
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Quotes Archive</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
              isLinkActive('/dashboard/settings')
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Company Settings</span>
          </Link>

          {user?.tier?.toLowerCase() !== 'pro' && (
            <Link
              href="/dashboard/upgrade"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                isLinkActive('/dashboard/upgrade')
                  ? 'bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Upgrade to Pro</span>
            </Link>
          )}
        </nav>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.email || 'Guest User'}</p>
            <p className="text-[10px] text-indigo-400 truncate font-mono">{user?.tenant_name || 'Demo Tenant'} ({user?.tier || 'Basic'})</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Log Out"
            data-testid="logout-button"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {children}
      </main>
    </div>
  )
}


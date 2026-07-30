'use client'
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
}

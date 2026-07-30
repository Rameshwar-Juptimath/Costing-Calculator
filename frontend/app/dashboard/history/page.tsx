'use client'

import { useEffect, useState } from 'react'
import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, FileText } from 'lucide-react'

interface EstimateItem {
  id: string
  filename: string
  file_type: string
  grand_total: number | null
  currency: string
  tier_applied: string | null
  created_at: string
}

export default function HistoryPage() {
  const token = useCostingStore(s => s.token)
  const [estimates, setEstimates] = useState<EstimateItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    fetch(`${apiUrl}/api/v1/cost/estimates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.items) setEstimates(data.items)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Estimate History</h1>
          <p className="text-slate-400">View and manage your previous manufacturing cost calculations.</p>
        </div>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading estimates...</div>
        ) : estimates.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p>No estimates calculated yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Filename</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Total Cost</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {estimates.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-4 font-medium text-white flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>{item.filename}</span>
                    </td>
                    <td className="px-4 py-4 uppercase font-mono text-xs">{item.file_type}</td>
                    <td className="px-4 py-4">
                      <Badge variant={item.tier_applied === 'Pro' ? 'pro' : 'basic'}>
                        {item.tier_applied || 'Basic'}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-semibold text-white">
                      {item.grand_total ? `₹${Number(item.grand_total).toLocaleString('en-IN')}` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

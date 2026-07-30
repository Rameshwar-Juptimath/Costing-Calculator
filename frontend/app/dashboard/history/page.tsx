'use client'
import React, { useState, useEffect } from 'react'
import { useCostingStore } from '@/store/costingStore'
import { PDFExportModal, PDFExportData } from '@/components/pdf-export-modal'
import { Search, Filter, FileText, TrendingUp, IndianRupee, Layers, CheckCircle2, ChevronRight } from 'lucide-react'
import { formatINR } from '@/lib/currency'

interface QuoteRow {
  id: string
  ref: string
  date: string
  projectName: string
  material: string
  price: number
  status: 'Draft' | 'Finalized' | 'Sent'
  manager: string
}

const INITIAL_QUOTES: QuoteRow[] = [
  {
    id: '1',
    ref: 'CE-4402',
    date: 'Oct 24, 2024',
    projectName: 'Project Alpha - Chassis V2',
    material: 'Aluminium 6061-T6',
    price: 452200,
    status: 'Finalized',
    manager: 'Michael Scott',
  },
  {
    id: '2',
    ref: 'CE-4401',
    date: 'Oct 22, 2024',
    projectName: 'Brake Caliper Assembly',
    material: 'Stainless Steel 316',
    price: 185400,
    status: 'Sent',
    manager: 'Jim Halpert',
  },
  {
    id: '3',
    ref: 'CE-4399',
    date: 'Oct 19, 2024',
    projectName: 'Drone Frame Arm Support',
    material: 'Carbon Fiber / AL 7075',
    price: 89000,
    status: 'Draft',
    manager: 'Dwight Schrute',
  },
  {
    id: '4',
    ref: 'CE-4395',
    date: 'Oct 15, 2024',
    projectName: 'Turbine Housing Core',
    material: 'Titanium Grade 5',
    price: 1240000,
    status: 'Finalized',
    manager: 'Michael Scott',
  },
  {
    id: '5',
    ref: 'CE-4388',
    date: 'Oct 10, 2024',
    projectName: 'Hydraulic Manifold Block',
    material: 'Aluminium 6061-T6',
    price: 310500,
    status: 'Sent',
    manager: 'Jim Halpert',
  },
]

export default function PastQuotesArchivePage() {
  const [quotes, setQuotes] = useState<QuoteRow[]>(INITIAL_QUOTES)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [selectedManager, setSelectedManager] = useState<string>('All')
  const [selectedPDFData, setSelectedPDFData] = useState<PDFExportData | null>(null)

  useEffect(() => {
    // Fetch backend estimates if available
    const token = useCostingStore.getState().token
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    if (token) {
      fetch(`${apiUrl}/api/v1/cost/estimates`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data && data.items && data.items.length > 0) {
            const mapped: QuoteRow[] = data.items.map((item: any, idx: number) => ({
              id: item.id,
              ref: `CE-${4400 + idx}`,
              date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
              projectName: item.filename || 'Custom Component',
              material: 'Aluminium 6061-T6',
              price: item.grand_total ? Number(item.grand_total) : 452200,
              status: item.tier_applied === 'Pro' ? 'Finalized' : 'Draft',
              manager: 'Lead Estimator',
            }))
            setQuotes(mapped)
          }
        })
        .catch(console.error)
    }
  }, [])

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch =
      q.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.material.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || q.status === selectedStatus
    const matchesManager = selectedManager === 'All' || q.manager === selectedManager
    return matchesSearch && matchesStatus && matchesManager
  })

  const openPDFExport = (quote: QuoteRow) => {
    setSelectedPDFData({
      quoteRef: quote.ref,
      date: quote.date,
      projectName: quote.projectName,
      material: quote.material,
      directCost: quote.price * 0.65,
      overheadCost: quote.price * 0.20,
      taxAmount: quote.price * 0.18,
      marginAmount: quote.price * 0.15,
      totalPrice: quote.price,
      volume: '1,240 mm³',
      surfaceArea: '850 mm²',
      boundingBox: '120 × 80 × 45 mm',
    })
  }

  return (
    <div className="flex-1 p-8 space-y-6 bg-slate-50 min-h-screen">
      {/* Page Title & Summary Metrics Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Past Quotes Archive</h1>
          <p className="text-sm text-slate-500 mt-1">
            Centralized repository for all historical precision cost estimates.
          </p>
        </div>

        {/* Top-level Metric Stat Cards */}
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 p-4 min-w-[170px] rounded-lg shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Quotes This Month
            </p>
            <p className="font-mono text-2xl font-bold text-slate-900">{filteredQuotes.length + 119}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% vs last month
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-4 min-w-[170px] rounded-lg shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Avg. Quote Value
            </p>
            <p className="font-mono text-xl font-bold text-slate-900">{formatINR(452200)}</p>
            <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-[65%]" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar Controls */}
      <div className="bg-white border border-slate-200 p-3 rounded-lg flex flex-wrap items-center gap-4 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">Search</span>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ref, Project, Material..."
              className="pl-8 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-indigo-600 outline-none w-48 font-mono"
            />
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">Status</span>
          <div className="flex gap-1">
            {['All', 'Draft', 'Finalized', 'Sent'].map(status => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  selectedStatus === status
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="w-px h-6 bg-slate-200" />

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500 uppercase tracking-wider">Manager</span>
          <select
            value={selectedManager}
            onChange={e => setSelectedManager(e.target.value)}
            className="bg-white border border-slate-300 text-xs px-2.5 py-1 rounded focus:ring-1 focus:ring-indigo-600 outline-none"
          >
            <option value="All">All Managers</option>
            <option value="Michael Scott">Michael Scott</option>
            <option value="Jim Halpert">Jim Halpert</option>
            <option value="Dwight Schrute">Dwight Schrute</option>
          </select>
        </div>
      </div>

      {/* High-Density Bordered Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">Quote Ref</th>
                <th className="px-4 py-3">Date Created</th>
                <th className="px-4 py-3">Project Name</th>
                <th className="px-4 py-3">Primary Material</th>
                <th className="px-4 py-3 text-right">Price (INR)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((quote, idx) => (
                <tr
                  key={quote.id}
                  className={`hover:bg-indigo-50/40 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <td className="px-4 py-3 font-mono font-semibold text-indigo-600">
                    {quote.ref}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{quote.date}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {quote.projectName}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono">{quote.material}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    {formatINR(quote.price)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        quote.status === 'Finalized'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : quote.status === 'Sent'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {quote.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => openPDFExport(quote)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-200 rounded font-semibold text-xs transition-all flex items-center gap-1 mx-auto"
                      data-testid={`export-pdf-${quote.ref}`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Export PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Export Modal */}
      {selectedPDFData && (
        <PDFExportModal
          data={selectedPDFData}
          onClose={() => setSelectedPDFData(null)}
        />
      )}
    </div>
  )
}

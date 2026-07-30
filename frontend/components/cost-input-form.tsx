'use client'
import React from 'react'
import Link from 'next/link'
import { AlertTriangle, Box, Wrench, Factory, Users, ShieldCheck, Truck } from 'lucide-react'

export interface PrimaryCostInputs {
  raw_material: number
  tooling: number
  manufacturing: number
  labour: number
  inspection: number
  logistics: number
}

interface CostInputFormProps {
  values: PrimaryCostInputs
  onChange: (field: keyof PrimaryCostInputs, val: number) => void
  showOverheadWarning?: boolean
}

export function CostInputForm({ values, onChange, showOverheadWarning = false }: CostInputFormProps) {
  const handleInputChange = (field: keyof PrimaryCostInputs, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0
    onChange(field, val)
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-slate-900">
      {/* Warning Banner if Overheads not configured */}
      {showOverheadWarning && (
        <div className="p-3.5 bg-amber-50 border-l-4 border-amber-500 flex gap-3 animate-fade text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-900 leading-tight">
              <span className="font-semibold">Notice:</span> Company overheads are not configured. Go to Settings to configure overheads and commercials.
            </p>
            <Link href="/dashboard/settings" className="text-amber-700 font-semibold underline mt-1 inline-block hover:text-amber-800">
              Configure Now &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Main Dense Input Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex justify-between items-end border-b border-slate-200 pb-2.5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">Primary Cost Inputs</h2>
            <p className="text-xs text-slate-500">Direct component manufacturing parameters</p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
            Ref: CE-4402
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Raw Material Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Raw Material</span>
              <span className="text-[10px] text-slate-400 font-normal">AL 6061-T6 Stock</span>
            </label>
            <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-2">₹</span>
              <input
                type="number"
                value={values.raw_material || ''}
                onChange={e => handleInputChange('raw_material', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-sm font-semibold text-slate-900 p-0 bg-transparent"
                placeholder="0.00"
                data-testid="input-raw-material"
              />
              <Box className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Tooling Cost */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Tooling</span>
              <span className="text-[10px] text-slate-400 font-normal">CNC Endmills & Inserts</span>
            </label>
            <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-2">₹</span>
              <input
                type="number"
                value={values.tooling || ''}
                onChange={e => handleInputChange('tooling', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-sm font-semibold text-slate-900 p-0 bg-transparent"
                placeholder="0.00"
                data-testid="input-tooling"
              />
              <Wrench className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Manufacturing Cost */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Manufacturing Cost</span>
              <span className="text-[10px] text-slate-400 font-normal">Machine Time & Power</span>
            </label>
            <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-2">₹</span>
              <input
                type="number"
                value={values.manufacturing || ''}
                onChange={e => handleInputChange('manufacturing', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-sm font-semibold text-slate-900 p-0 bg-transparent"
                placeholder="0.00"
                data-testid="input-manufacturing"
              />
              <Factory className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Two-Column Layout for Labour & Inspection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Labour Cost</label>
              <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
                <span className="text-xs font-bold text-slate-500 mr-1.5">₹</span>
                <input
                  type="number"
                  value={values.labour || ''}
                  onChange={e => handleInputChange('labour', e)}
                  className="flex-1 border-none outline-none focus:ring-0 font-mono text-sm font-semibold text-slate-900 p-0 bg-transparent w-full"
                  placeholder="0.00"
                  data-testid="input-labour"
                />
                <Users className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">Inspection</label>
              <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
                <span className="text-xs font-bold text-slate-500 mr-1.5">₹</span>
                <input
                  type="number"
                  value={values.inspection || ''}
                  onChange={e => handleInputChange('inspection', e)}
                  className="flex-1 border-none outline-none focus:ring-0 font-mono text-sm font-semibold text-slate-900 p-0 bg-transparent w-full"
                  placeholder="0.00"
                  data-testid="input-inspection"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Logistics Cost */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Logistics</span>
              <span className="text-[10px] text-slate-400 font-normal">Packaging & Freight</span>
            </label>
            <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-2">₹</span>
              <input
                type="number"
                value={values.logistics || ''}
                onChange={e => handleInputChange('logistics', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-sm font-semibold text-slate-900 p-0 bg-transparent"
                placeholder="0.00"
                data-testid="input-logistics"
              />
              <Truck className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Metadata Summary */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Summary Metadata</h3>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500 mb-0.5">Lead Time</p>
              <p className="font-semibold text-slate-900">12 Working Days</p>
            </div>
            <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
              <p className="text-slate-500 mb-0.5">Batch Size</p>
              <p className="font-semibold text-slate-900 font-mono">500 Units</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

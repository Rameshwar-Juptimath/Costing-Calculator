'use client'
import React, { useState } from 'react'
import { Cylinder, Save, Check, Info } from 'lucide-react'
import { useCostingStore, MachiningAllowance } from '@/store/costingStore'

export function MachiningAllowanceForm() {
  const machiningAllowance = useCostingStore(s => s.machiningAllowance)
  const setMachiningAllowance = useCostingStore(s => s.setMachiningAllowance)

  const [form, setForm] = useState<MachiningAllowance>({
    bar_stock_radius: machiningAllowance?.bar_stock_radius ?? 1.0,
    bar_stock_height: machiningAllowance?.bar_stock_height ?? 3.0,
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setMachiningAllowance(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Machining Allowance Settings</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure extra raw stock allowances for Bar Stock (cylindrical) parts. Included across all plans.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-all shadow-sm flex items-center gap-2"
        >
          {saved ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{saved ? 'Saved!' : 'Save Allowances'}</span>
        </button>
      </div>

      {/* Bar Stock Allowance Section */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Cylinder className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Bar Stock (Cylindrical Part) Allowances
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {/* Radius Allowance */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex justify-between">
              <span>Radius Allowance</span>
              <span className="text-[10px] text-slate-400 font-normal">Extra stock on radius</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.bar_stock_radius}
                onChange={e => setForm(prev => ({ ...prev, bar_stock_radius: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-3 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                placeholder="1.0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">mm</span>
            </div>
          </div>

          {/* Height Allowance */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600 flex justify-between">
              <span>Height / Length Allowance</span>
              <span className="text-[10px] text-slate-400 font-normal">Extra stock on height</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0"
                value={form.bar_stock_height}
                onChange={e => setForm(prev => ({ ...prev, bar_stock_height: parseFloat(e.target.value) || 0 }))}
                className="w-full pl-3 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                placeholder="3.0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">mm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explanation Banner */}
      <div className="border-l-4 border-indigo-600 bg-indigo-50 p-4 rounded-r-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-indigo-950">Raw Stock Volume Calculation Logic</p>
          <p className="text-xs text-indigo-800 mt-1 leading-relaxed">
            When Bar Stock is selected in the Estimator Workspace, the raw stock volume is automatically calculated as:
            <br />
            <span className="font-mono font-semibold bg-white/80 px-2 py-0.5 rounded border border-indigo-200 mt-1 inline-block text-indigo-900">
              Raw Volume = π × (Radius + {form.bar_stock_radius}mm)² × (Height + {form.bar_stock_height}mm)
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

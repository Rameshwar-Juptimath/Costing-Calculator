'use client'
import React, { useState } from 'react'
import { Factory, CreditCard, Info, Save } from 'lucide-react'
import { formatINR } from '@/lib/currency'

export interface CompanyOverheadsValues {
  factory_rent: number
  machinery_asset: number
  electricity: number
  telecom: number
  admin: number
  fixed_salary: number
  expenses: number
  tax_rate: number
  profit_margin_rate: number
}

interface CompanyOverheadsFormProps {
  initialValues?: Partial<CompanyOverheadsValues>
  isDisabled?: boolean
  onSave?: (values: CompanyOverheadsValues) => void
}

export function CompanyOverheadsForm({
  initialValues,
  isDisabled = false,
  onSave,
}: CompanyOverheadsFormProps) {
  const [form, setForm] = useState<CompanyOverheadsValues>({
    factory_rent: initialValues?.factory_rent ?? 12500,
    machinery_asset: initialValues?.machinery_asset ?? 4800,
    electricity: initialValues?.electricity ?? 2250,
    telecom: initialValues?.telecom ?? 450,
    admin: initialValues?.admin ?? 1200,
    fixed_salary: initialValues?.fixed_salary ?? 85000,
    expenses: initialValues?.expenses ?? 5000,
    tax_rate: initialValues?.tax_rate ?? 18,
    profit_margin_rate: initialValues?.profit_margin_rate ?? 25,
  })

  const [saved, setSaved] = useState(false)

  const handleChange = (field: keyof CompanyOverheadsValues, val: number) => {
    setForm(prev => ({ ...prev, [field]: val }))
  }

  const handleSave = () => {
    if (onSave) {
      onSave(form)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalFixedOverheads =
    form.factory_rent +
    form.machinery_asset +
    form.electricity +
    form.telecom +
    form.admin +
    form.fixed_salary +
    form.expenses

  return (
    <div className={`space-y-6 max-w-4xl mx-auto ${isDisabled ? 'blur-[2px] pointer-events-none select-none' : ''}`}>
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Company Overheads</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure global fixed costs and financial parameters for automated pricing logic.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isDisabled}
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg transition-all shadow-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Overhead Costs Section (Monthly) */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <Factory className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Overhead Costs (Monthly)
          </h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {/* Factory Rent */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Factory Rent
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₹</span>
              <input
                type="number"
                disabled={isDisabled}
                value={form.factory_rent}
                onChange={e => handleChange('factory_rent', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-[10px]">INR</span>
            </div>
          </div>

          {/* Machineries Asset Depreciation */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Machineries Asset (Depr.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₹</span>
              <input
                type="number"
                disabled={isDisabled}
                value={form.machinery_asset}
                onChange={e => handleChange('machinery_asset', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-[10px]">INR</span>
            </div>
          </div>

          {/* Electric Bills */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Electric Bills
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₹</span>
              <input
                type="number"
                disabled={isDisabled}
                value={form.electricity}
                onChange={e => handleChange('electricity', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-[10px]">INR</span>
            </div>
          </div>

          {/* Telecom */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Internet / Telecom
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₹</span>
              <input
                type="number"
                disabled={isDisabled}
                value={form.telecom}
                onChange={e => handleChange('telecom', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-[10px]">INR</span>
            </div>
          </div>

          {/* General Admin */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              General Admin
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₹</span>
              <input
                type="number"
                disabled={isDisabled}
                value={form.admin}
                onChange={e => handleChange('admin', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-[10px]">INR</span>
            </div>
          </div>

          {/* Salary (Fixed) */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Salary (Fixed Engineering)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₹</span>
              <input
                type="number"
                disabled={isDisabled}
                value={form.fixed_salary}
                onChange={e => handleChange('fixed_salary', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-[10px]">INR</span>
            </div>
          </div>

          {/* Misc Expenses */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Misc. Expenses
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">₹</span>
              <input
                type="number"
                disabled={isDisabled}
                value={form.expenses}
                onChange={e => handleChange('expenses', parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-12 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-[10px]">INR</span>
            </div>
          </div>
        </div>
      </section>

      {/* Commercials Section */}
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">Commercials</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tax Rate */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Tax Rate (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                disabled={isDisabled}
                value={form.tax_rate}
                onChange={e => handleChange('tax_rate', parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">%</span>
            </div>
          </div>

          {/* Profit Margin Rate */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Profit Margin (%)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                disabled={isDisabled}
                value={form.profit_margin_rate}
                onChange={e => handleChange('profit_margin_rate', parseFloat(e.target.value) || 0)}
                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded font-mono text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-slate-400 text-xs">%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calculated Operating Burden Banner */}
      <div className="border-l-4 border-indigo-600 bg-indigo-50 p-4 rounded-r-lg flex items-start gap-3">
        <Info className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-indigo-950">Calculated Operating Burden</p>
          <p className="text-xs text-indigo-800 mt-0.5">
            Based on the overheads above, your monthly burn rate is{' '}
            <span className="font-mono font-semibold">{formatINR(totalFixedOverheads)}</span>. Ensure your pricing models cover this threshold.
          </p>
        </div>
      </div>
    </div>
  )
}

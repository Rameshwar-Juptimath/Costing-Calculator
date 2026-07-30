'use client'
import React, { useState } from 'react'
import { useCostingStore } from '@/store/costingStore'
import { CompanyOverheadsForm, CompanyOverheadsValues } from '@/components/company-overheads-form'
import { BasicTierUpsellCard } from '@/components/basic-tier-upsell-card'
import { User, CreditCard, Factory, Percent, ChevronRight } from 'lucide-react'

export default function CompanySettingsPage() {
  const user = useCostingStore(s => s.user)
  const isBasicTier = user?.tier !== 'Pro'

  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'overheads' | 'commercials'>('overheads')

  const handleSaveOverheads = async (values: CompanyOverheadsValues) => {
    try {
      const token = useCostingStore.getState().token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      if (token) {
        await fetch(`${apiUrl}/api/v1/tenant/settings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(values),
        })
      }
    } catch (e) {
      console.error('Failed to save settings:', e)
    }
  }

  return (
    <div className="flex flex-1 min-h-screen bg-slate-50">
      {/* Settings Navigation Tabs Sidebar */}
      <nav className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col shrink-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Configuration
        </h2>
        <ul className="space-y-1">
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Profile</span>
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === 'billing'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span>Billing</span>
              </span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('overheads')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === 'overheads'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Factory className="w-4 h-4" />
                <span>Overheads</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setActiveTab('commercials')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold transition-colors ${
                activeTab === 'commercials'
                  ? 'bg-indigo-50 text-indigo-600 font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                <span>Commercials</span>
              </span>
            </button>
          </li>
        </ul>

        {/* Pro Tip Box */}
        <div className="mt-auto p-4 bg-indigo-50/60 rounded-lg border border-indigo-100 space-y-1">
          <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Pro Tip</h4>
          <p className="text-xs text-slate-600">
            Changes to overheads affect all future estimates immediately.
          </p>
        </div>
      </nav>

      {/* Main Settings Content Area */}
      <div className="flex-1 p-8 overflow-y-auto relative">
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p><span className="font-semibold text-slate-900">Email:</span> {user?.email || 'N/A'}</p>
              <p><span className="font-semibold text-slate-900">Tenant:</span> {user?.tenant_name || 'N/A'}</p>
              <p><span className="font-semibold text-slate-900">Role:</span> {user?.role || 'Admin'}</p>
              <p><span className="font-semibold text-slate-900">Subscription Tier:</span> {user?.tier || 'Basic'}</p>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="max-w-2xl bg-white p-6 rounded-lg border border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Billing Information</h2>
            <div className="p-4 bg-slate-50 rounded border border-slate-200">
              <p className="text-sm font-semibold text-slate-900">Current Plan: {user?.tier || 'Basic'} Plan</p>
              <p className="text-xs text-slate-500 mt-1">
                {isBasicTier ? 'Standard access to direct cost engine.' : 'Unlimited Pro features enabled with automatic overhead calculations.'}
              </p>
            </div>
          </div>
        )}

        {(activeTab === 'overheads' || activeTab === 'commercials') && (
          <div className="relative">
            <CompanyOverheadsForm
              isDisabled={isBasicTier}
              onSave={handleSaveOverheads}
            />

            {/* Basic Tier Gated Upsell Overlay (Verbatim matching reference mockup) */}
            {isBasicTier && <BasicTierUpsellCard />}
          </div>
        )}
      </div>
    </div>
  )
}

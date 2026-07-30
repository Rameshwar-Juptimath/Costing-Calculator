'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Sparkles } from 'lucide-react'

export function BasicTierUpsellCard() {
  const router = useRouter()

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10 backdrop-blur-sm p-4"
      data-testid="basic-tier-upsell-card"
    >
      <div className="bg-white p-8 rounded-xl shadow-2xl border border-slate-200 max-w-md text-center flex flex-col items-center gap-5 transform transition-all animate-fade">
        <div className="w-14 h-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
          <Lock className="w-7 h-7 text-indigo-600" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>Unlock Pro Features</span>
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Upgrade to Pro to configure factory overheads, taxes, and profit margins for automated costing calculations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push('/dashboard/upgrade')}
          className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          data-testid="unlock-pro-cta"
        >
          <span>Upgrade to Pro Now</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  )
}

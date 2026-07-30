'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Settings, ArrowRight, Activity, FileOutput, History, Sparkles } from 'lucide-react'

export default function UpgradeSuccessPage() {
  const router = useRouter()

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 min-h-screen">
      {/* Main Success Container */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-10 py-8">
          {/* Left: Hero Success Card */}
          <div className="w-full md:w-1/2 flex flex-col items-center text-center">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xl flex flex-col items-center w-full">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 text-emerald-600 shadow-inner">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Welcome to Pro Tier
              </h1>
              <p className="text-xs text-slate-500 max-w-sm mb-8 leading-relaxed">
                Your account has been successfully upgraded. You now have full access to automated overhead costing, financial PDF exports, and unlimited quote history.
              </p>

              <div className="flex flex-col w-full gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/settings')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white py-3 px-6 rounded-lg font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                  data-testid="success-go-to-settings"
                >
                  <span>Go to Settings</span>
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-lg font-bold text-xs border border-slate-300 transition-all active:scale-95 flex items-center justify-center gap-2"
                  data-testid="success-back-to-estimator"
                >
                  <span>Back to Estimator Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Unlocked Features Cards */}
          <div className="w-full md:w-1/2 space-y-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-indigo-50 rounded text-indigo-600">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Automated Overheads
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Real-time calculation of indirect labor, factory utilities, and facility depreciation applied to every BOM.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-indigo-50 rounded text-indigo-600">
                <FileOutput className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Financial Exports
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate professional high-fidelity PDF cost estimate reports with CAD geometry thumbnails and legal terms.
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-start gap-4">
              <div className="p-2.5 bg-indigo-50 rounded text-indigo-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Extended Archive History
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Unlimited version tracking for your assembly quotes with complete audit trail history.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Stats Bar */}
      <section className="bg-slate-900 text-white px-8 py-5 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-between gap-6 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Current Tier</span>
            <span className="font-mono text-indigo-300 font-bold text-base">Pro Enterprise</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Billing Cycle</span>
            <span className="font-mono text-white font-bold text-base">Active</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Available Exports</span>
            <span className="font-mono text-white font-bold text-base">Unlimited</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Support Status</span>
            <span className="font-mono text-emerald-400 font-bold text-base">Priority 24/7</span>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCostingStore } from '@/store/costingStore'
import { Calculator, Percent, FileOutput, History, CreditCard, Shield, Sparkles, CheckCircle2 } from 'lucide-react'
import { formatINR } from '@/lib/currency'

export default function CheckoutUpgradePage() {
  const router = useRouter()
  const user = useCostingStore(s => s.user)
  const setUser = useCostingStore(s => s.setUser)

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [loading, setLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvc, setCvc] = useState('')

  const monthlyPrice = 4999
  const yearlyPricePerMonth = 3999 // 20% discount
  const currentPrice = billingCycle === 'yearly' ? yearlyPricePerMonth : monthlyPrice

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = useCostingStore.getState().token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      if (token) {
        const res = await fetch(`${apiUrl}/api/v1/auth/upgrade`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          // Refresh user profile
          const meRes = await fetch(`${apiUrl}/api/v1/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (meRes.ok) {
            const meData = await meRes.json()
            setUser(meData, meData.features)
          }
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      router.push('/dashboard/upgrade/success')
    }
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            You are upgrading to Pro
          </h1>
          <p className="text-slate-500 mt-1 max-w-xl text-sm">
            Unlock high-precision financial controls and industrial-grade reporting for your manufacturing operations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: Feature Summary (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex gap-3.5">
                <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Automated Overheads</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Absorption costing based on rent, power, and labor.</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex gap-3.5">
                <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tax & Commercials</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Real-time localized GST tax logic and profit margin floors.</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex gap-3.5">
                <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileOutput className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Export Reports</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Generate high-fidelity PDF documents for client quotes.</p>
                </div>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex gap-3.5">
                <div className="w-10 h-10 rounded bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Extended Archive</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Unlimited quotes history and BOM version tracking.</p>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-xl shadow-lg border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Enterprise SLA Guarantee</span>
              </div>
              <p className="text-xs text-slate-300 italic">
                "The automated overheads calculation saved our estimators 12+ hours every week and guaranteed our target profit margins on every single quote."
              </p>
            </div>
          </div>

          {/* Right Side: Multi-Step Checkout Form (5 cols) */}
          <form onSubmit={handleUpgrade} className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-xl shadow-md space-y-6">
            {/* Step 1: Billing Cycle Toggle */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Billing Cycle</h3>
              </div>

              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`py-2 font-bold rounded transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  data-testid="billing-monthly"
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`py-2 font-bold rounded transition-all flex items-center justify-center gap-1 ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-indigo-600 shadow'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  data-testid="billing-yearly"
                >
                  <span>Yearly</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-mono">
                    -20%
                  </span>
                </button>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-slate-500">Plan Rate:</span>
                <span className="font-mono text-xl font-bold text-indigo-600">
                  {formatINR(currentPrice)}
                  <span className="text-xs font-sans text-slate-500 font-normal"> / month</span>
                </span>
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Step 2: Payment Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Payment Details</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-600 font-semibold uppercase tracking-wider block mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      placeholder="4532 &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; 8892"
                      className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded font-mono text-xs text-slate-900 focus:ring-1 focus:ring-indigo-600 outline-none"
                      data-testid="input-card-number"
                    />
                    <CreditCard className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 font-semibold uppercase tracking-wider block mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      required
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs text-slate-900 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 font-semibold uppercase tracking-wider block mb-1">
                      CVC
                    </label>
                    <input
                      type="password"
                      required
                      value={cvc}
                      onChange={e => setCvc(e.target.value)}
                      placeholder="***"
                      className="w-full px-3 py-2 border border-slate-300 rounded font-mono text-xs text-slate-900 focus:ring-1 focus:ring-indigo-600 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* Total Order Summary & Submit Button */}
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-600 font-sans">
                  <span>Pro License (Billed {billingCycle})</span>
                  <span className="font-mono">{formatINR(currentPrice * 12)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-sans">
                  <span>GST (18%)</span>
                  <span className="font-mono">{formatINR(currentPrice * 12 * 0.18)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                  <span className="font-sans">Total Billed Today</span>
                  <span className="text-indigo-600">{formatINR(currentPrice * 12 * 1.18)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-lg shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                data-testid="upgrade-now-button"
              >
                {loading ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Confirm Upgrade to Pro</span>
                    <Shield className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

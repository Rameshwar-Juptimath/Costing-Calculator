'use client'
import React, { useEffect, useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { formatINR } from '@/lib/currency'

interface StickyCostFooterProps {
  total: number
  onGenerateQuote?: () => void
  isSubmitting?: boolean
}

export function StickyCostFooter({ total, onGenerateQuote, isSubmitting = false }: StickyCostFooterProps) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    setPulse(true)
    const timeout = setTimeout(() => setPulse(false), 400)
    return () => clearTimeout(timeout)
  }, [total])

  return (
    <footer className="h-20 bg-slate-900 border-t border-slate-700/80 px-6 flex items-center justify-between shadow-2xl z-30 w-full">
      <div className="flex flex-col">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Calculated Estimate (INR)
        </span>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl lg:text-3xl font-bold font-mono text-indigo-300 tracking-tight transition-transform duration-150 ${
              pulse ? 'scale-105 text-white' : ''
            }`}
            data-testid="sticky-footer-total"
          >
            {formatINR(total)}
          </span>
          <span className="text-xs text-slate-400 font-medium">Total Cost</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerateQuote}
        disabled={isSubmitting}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-md font-semibold shadow-lg transition-all active:scale-95 flex items-center gap-2 text-sm disabled:opacity-50"
        data-testid="generate-quote-button"
      >
        {isSubmitting ? (
          <>
            <CheckCircle2 className="w-4 h-4 animate-spin" />
            <span>Calculating...</span>
          </>
        ) : (
          <>
            <span>Generate Quote</span>
            <Send className="w-4 h-4" />
          </>
        )}
      </button>
    </footer>
  )
}

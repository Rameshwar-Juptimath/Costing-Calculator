import React, { forwardRef } from 'react'

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-slate-400 sm:text-sm">₹</span>
        </div>
        <input
          ref={ref}
          type="text"
          className={`w-full bg-slate-900 border ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500'} text-slate-100 rounded-lg pl-8 pr-4 py-2 outline-none focus:ring-1 transition-all ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})
CurrencyInput.displayName = 'CurrencyInput'

import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'basic' | 'pro' | 'success'
}

export function Badge({ children, variant = 'basic', ...props }: BadgeProps & React.HTMLAttributes<HTMLSpanElement>) {
  const variants = {
    basic: 'bg-slate-700 text-slate-100',
    pro: 'bg-gradient-accent text-white shadow-sm shadow-blue-500/20',
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`} {...props}>
      {children}
    </span>
  )
}

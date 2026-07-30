import React from 'react'

interface CardProps {
  title?: React.ReactNode
  children: React.ReactNode
  className?: string
  glass?: boolean
}

export function Card({ title, children, className = '', glass = false }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-700/50 ${glass ? 'glass' : 'bg-slate-800'} ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
      )}
      <div className={title ? '' : 'h-full'}>
        {children}
      </div>
    </div>
  )
}

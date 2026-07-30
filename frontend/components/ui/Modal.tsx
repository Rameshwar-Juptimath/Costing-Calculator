import React from 'react'

interface ModalProps {
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ onClose, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 w-full max-w-lg p-1 animate-in fade-in zoom-in duration-200">
        <div className="glass rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50">
          {children}
        </div>
      </div>
    </div>
  )
}

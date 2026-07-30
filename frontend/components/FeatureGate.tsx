'use client'
import { useCostingStore } from '@/store/costingStore'
import { Modal } from '@/components/ui/Modal'
import { useState } from 'react'
import { LockIcon, StarIcon } from 'lucide-react'
import { UserFeatures } from '@/store/costingStore'

interface FeatureGateProps {
  feature: keyof UserFeatures
  children: React.ReactNode
}

export function FeatureGate({ feature, children }: FeatureGateProps) {
  const features = useCostingStore(s => s.features)
  const [showModal, setShowModal] = useState(false)
  
  if (!features || features[feature]) return <>{children}</>
  
  return (
    <div className="relative">
      {/* Blurred/locked overlay */}
      <div className="pointer-events-none opacity-30 blur-sm select-none">
        {children}
      </div>
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={() => setShowModal(true)}
        data-testid="upsell-modal-trigger"
      >
        <div className="glass rounded-xl p-6 text-center shadow-lg transition-transform hover:scale-105">
          <LockIcon className="mx-auto w-8 h-8 text-slate-300" />
          <p className="text-slate-200 font-semibold mt-2">Pro Feature</p>
          <p className="text-slate-400 text-sm">Click to learn more</p>
        </div>
      </div>
      {showModal && <UpsellModal onClose={() => setShowModal(false)} />}
    </div>
  )
}

function UpsellModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="text-center p-8" data-testid="upsell-modal">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
          <StarIcon className="w-8 h-8 text-white" fill="currentColor" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
        <p className="text-slate-400 mb-6">
          Unlock Overhead Cost analysis, Tax calculations, and Profit Margin
          estimation to get a complete picture of your manufacturing costs.
        </p>
        <div className="space-y-3 text-left mb-6 bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          {[
            'Overhead Cost breakdown (7 categories)',
            'GST / Tax calculation',
            'Profit margin analysis',
            'Full cost report export',
          ].map(f => (
            <div key={f} className="flex items-center text-slate-300 text-sm">
              <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              {f}
            </div>
          ))}
        </div>
        <p className="text-slate-500 text-sm">Contact your administrator to upgrade your plan.</p>
        <button onClick={onClose} className="mt-6 text-slate-400 hover:text-white text-sm transition-colors">Close</button>
      </div>
    </Modal>
  )
}

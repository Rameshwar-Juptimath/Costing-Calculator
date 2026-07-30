'use client'
import { CADViewer } from '@/components/viewer/CADViewer'
import { WizardShell } from '@/components/wizard/WizardShell'
import { useCostingStore } from '@/store/costingStore'

export default function EstimatePage() {
  const meshUrl = useCostingStore(s => s.meshUrl)
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">New Estimate</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <CADViewer meshUrl={meshUrl} />
        </div>
        <div className="lg:col-span-2">
          <WizardShell />
        </div>
      </div>
    </div>
  )
}

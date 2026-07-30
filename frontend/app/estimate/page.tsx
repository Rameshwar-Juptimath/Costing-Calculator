'use client'
import { CADUploadViewer } from '@/components/viewer/CADUploadViewer'
import { WizardShell } from '@/components/wizard/WizardShell'

export default function EstimatePage() {
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">New Manufacturing Estimate</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <CADUploadViewer />
        </div>
        <div className="lg:col-span-2">
          <WizardShell />
        </div>
      </div>
    </div>
  )
}

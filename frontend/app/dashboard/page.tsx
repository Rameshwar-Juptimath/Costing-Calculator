'use client'
import dynamic from 'next/dynamic'
import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCostingStore } from '@/store/costingStore'
import { CostInputForm, PrimaryCostInputs } from '@/components/cost-input-form'
import { StickyCostFooter } from '@/components/sticky-cost-footer'

const CADUploadViewer = dynamic(() => import('@/components/viewer/CADUploadViewer').then(m => m.CADUploadViewer), {
  ssr: false,
})

export default function EstimatorWorkspacePage() {
  const router = useRouter()
  const user = useCostingStore(s => s.user)
  const geometry = useCostingStore(s => s.geometry)
  const setCostResult = useCostingStore(s => s.setCostResult)

  const [inputs, setInputs] = useState<PrimaryCostInputs>({
    raw_material: 12500,
    tooling: 8000,
    manufacturing: 15200,
    labour: 4500,
    inspection: 2200,
    logistics: 3270,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Auto-sync extracted CAD geometry metadata to cost calculation inputs
  useEffect(() => {
    if (geometry) {
      if (geometry.volume_mm3 !== undefined && geometry.volume_mm3 > 0) {
        const calculatedMaterial = Math.max(1000, Math.round(geometry.volume_mm3 * 8))
        const calculatedMfg = Math.max(2000, Math.round(geometry.volume_mm3 * 12))
        setInputs(prev => ({
          ...prev,
          raw_material: calculatedMaterial,
          manufacturing: calculatedMfg,
        }))
      } else if (geometry.total_area_mm2 !== undefined && geometry.total_area_mm2 > 0) {
        const calculatedMaterial = Math.max(1000, Math.round(geometry.total_area_mm2 * 4))
        const calculatedMfg = Math.max(1500, Math.round(geometry.total_area_mm2 * 6))
        setInputs(prev => ({
          ...prev,
          raw_material: calculatedMaterial,
          manufacturing: calculatedMfg,
        }))
      }
    }
  }, [geometry])

  const handleInputChange = (field: keyof PrimaryCostInputs, val: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: val,
    }))
  }

  // Calculate real-time sum of JetBrains Mono inputs
  const calculatedTotal = useMemo(() => {
    return (
      (inputs.raw_material || 0) +
      (inputs.tooling || 0) +
      (inputs.manufacturing || 0) +
      (inputs.labour || 0) +
      (inputs.inspection || 0) +
      (inputs.logistics || 0)
    )
  }, [inputs])

  const handleGenerateQuote = async () => {
    setIsSubmitting(true)
    try {
      const token = useCostingStore.getState().token
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const payload = {
        estimate_id: 'est-' + Date.now(),
        currency: 'INR',
        direct_cost: inputs,
        overhead_cost: {
          factory_rent: 0,
          machinery_asset: 0,
          electricity: 0,
          telecom: 0,
          admin: 0,
          fixed_salary: 0,
          expenses: 0,
        },
        commercials: {
          tax_rate: 18,
          profit_margin_rate: 15,
        },
      }

      if (token) {
        const res = await fetch(`${apiUrl}/api/v1/cost/calculate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const data = await res.json()
          setCostResult(data)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsSubmitting(false)
      router.push('/dashboard/history')
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-900">
      {/* 60/40 Split Screen Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Pane: Interactive CAD Upload & Live Rendering Viewer (60%) */}
        <section className="w-full lg:w-3/5 h-1/2 lg:h-full relative border-b lg:border-b-0 lg:border-r border-slate-800 p-6 overflow-y-auto bg-[#0b1c30]">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>CAD Drawing Upload & Renderer</span>
                </h1>
                <p className="text-xs text-slate-400">Upload 3D (.step, .stp) or 2D (.dxf, .dwg, .dwf) technical drawings to render and proceed with costing</p>
              </div>
            </div>
            <CADUploadViewer />
          </div>
        </section>

        {/* Right Pane: Direct Cost Input Form (40%) */}
        <section className="w-full lg:w-2/5 h-1/2 lg:h-full flex flex-col bg-white overflow-hidden">
          <CostInputForm
            values={inputs}
            onChange={handleInputChange}
            showOverheadWarning={user?.tier !== 'Pro'}
          />
        </section>
      </div>

      {/* Real-time Sticky Calculation Footer */}
      <StickyCostFooter
        total={calculatedTotal}
        onGenerateQuote={handleGenerateQuote}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

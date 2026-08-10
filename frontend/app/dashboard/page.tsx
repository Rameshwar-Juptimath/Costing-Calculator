'use client'
import dynamic from 'next/dynamic'
import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
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
  const filename = useCostingStore(s => s.filename)
  const setCostResult = useCostingStore(s => s.setCostResult)
  const quoteName = useCostingStore(s => s.quoteName)
  const quoteRef = useCostingStore(s => s.quoteRef)
  const setQuoteRef = useCostingStore(s => s.setQuoteRef)
  const resetEstimate = useCostingStore(s => s.resetEstimate)

  const [inputs, setInputs] = useState<PrimaryCostInputs>({
    raw_material: 12500,
    tooling: 8000,
    manufacturing: 15200,
    labour: 4500,
    inspection: 2200,
    logistics: 3270,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const routingSteps = useCostingStore(s => s.routingSteps)
  const batchSize = useCostingStore(s => s.batchSize)
  const setMachines = useCostingStore(s => s.setMachines)
  const setMaterials = useCostingStore(s => s.setMaterials)

  // Fetch machine and materials libraries on load
  useEffect(() => {
    const token = useCostingStore.getState().token
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    if (token) {
      fetch(`${apiUrl}/api/v1/machines`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.items && data.items.length > 0) {
            setMachines(data.items.map((m: any) => ({
              id: m.id,
              machine_name: m.machine_name,
              hourly_rate_inr: Number(m.hourly_rate_inr),
              operator_rate_inr: Number(m.operator_rate_inr),
              is_active: m.is_active
            })))
          }
        })
        .catch(err => console.error('Failed to load machines:', err))

      fetch(`${apiUrl}/api/v1/materials`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.items && data.items.length > 0) {
            setMaterials(data.items.map((m: any) => ({
              id: m.id,
              material_name: m.material_name,
              cutting_speed_m_min: Number(m.cutting_speed_m_min),
              feed_rate_mm_rev: Number(m.feed_rate_mm_rev),
              density_g_cm3: Number(m.density_g_cm3),
              is_active: m.is_active,
            })))
          }
        })
        .catch(err => console.error('Failed to load materials:', err))
    }
  }, [setMachines, setMaterials])


  // Auto-sync extracted CAD geometry metadata to cost calculation inputs
  useEffect(() => {
    if (geometry) {
      if (geometry.volume_mm3 !== undefined && geometry.volume_mm3 > 0) {
        const calculatedMaterial = Math.max(1000, Math.round(geometry.volume_mm3 * 8))
        setInputs(prev => ({
          ...prev,
          raw_material: calculatedMaterial,
        }))
      } else if (geometry.total_area_mm2 !== undefined && geometry.total_area_mm2 > 0) {
        const calculatedMaterial = Math.max(1000, Math.round(geometry.total_area_mm2 * 4))
        setInputs(prev => ({
          ...prev,
          raw_material: calculatedMaterial,
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

  const handleNewEstimate = () => {
    resetEstimate()
    setInputs({
      raw_material: 12500,
      tooling: 8000,
      manufacturing: 15200,
      labour: 4500,
      inspection: 2200,
      logistics: 3270,
    })
  }

  const handleGenerateQuote = async () => {
    setIsSubmitting(true)
    try {
      const state = useCostingStore.getState()
      const token = state.token
      const currentEstimateId = state.estimateId
      const currentFilename = state.filename
      const currentQuoteName = state.quoteName
      const currentMatId = state.selectedMaterialId
      const currentMatName = state.selectedMaterial
      const currentMeshUrl = state.meshUrl
      const currentThumbnail = state.thumbnail
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const partDia = geometry?.part_forms?.bar_stock?.diameter_mm || ((geometry?.bounding_box?.x_mm || 50) + (geometry?.bounding_box?.y_mm || 50)) / 2
      const partLen = geometry?.part_forms?.bar_stock?.height_mm || (geometry?.bounding_box?.z_mm || 100)

      const geometryPayload = geometry
        ? { ...geometry, thumbnail_url: currentThumbnail || undefined }
        : currentThumbnail
          ? { thumbnail_url: currentThumbnail }
          : undefined

      const payload = {
        estimate_id: currentEstimateId || undefined,
        quote_name: currentQuoteName || currentFilename || 'Custom Machined Part',
        filename: currentFilename || 'Custom Machined Part',
        currency: 'INR',
        mesh_url: currentMeshUrl || undefined,
        geometry_data: geometryPayload,
        direct_cost: {
          ...inputs,
          batch_size: batchSize || 100,
          material_id: currentMatId && !currentMatId.startsWith('mat-') ? currentMatId : null,
          material_name: currentMatName,
          part_diameter_mm: partDia,
          cut_length_mm: partLen,
          routing_steps: routingSteps.map(s => ({
            sequence_order: s.sequence_order,
            machine_name: s.machine_name,
            machine_profile_id: s.machine_profile_id && !s.machine_profile_id.startsWith('m-') ? s.machine_profile_id : null,
            setup_time_mins: s.setup_time_mins,
            cycle_time_mins: s.cycle_time_mins,
            hourly_rate_inr: s.hourly_rate_inr,
            operator_rate_inr: s.operator_rate_inr,
          })),
        },
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
          // Reset the workspace store so that upon returning to the estimator workspace,
          // user starts with a brand new estimate where they upload the drawing once again.
          resetEstimate()
          router.push('/dashboard/history')
          return
        }
      }
      router.push('/dashboard/history')
    } catch (e) {
      console.error(e)
      router.push('/dashboard/history')
    } finally {
      setIsSubmitting(false)
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
              {(filename || quoteRef || quoteName || geometry) && (
                <button
                  type="button"
                  onClick={handleNewEstimate}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  title="Clear loaded part and start a fresh estimate"
                  data-testid="new-estimate-btn"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>New Estimate</span>
                </button>
              )}
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
            quoteRef={quoteRef || undefined}
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

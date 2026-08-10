'use client'
import React, { useMemo } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Box,
  Wrench,
  Cpu,
  Users,
  ShieldCheck,
  Truck,
  Plus,
  Trash2,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useCostingStore, RoutingStep } from '@/store/costingStore'
import { formatINR } from '@/lib/currency'

export interface PrimaryCostInputs {
  raw_material: number
  tooling: number
  manufacturing: number
  labour: number
  inspection: number
  logistics: number
}

interface CostInputFormProps {
  values: PrimaryCostInputs
  onChange: (field: keyof PrimaryCostInputs, val: number) => void
  showOverheadWarning?: boolean
  quoteRef?: string
}

export function CostInputForm({
  values,
  onChange,
  showOverheadWarning = false,
  quoteRef = 'REF-Pending',
}: CostInputFormProps) {
  const machines = useCostingStore(s => s.machines)
  const materials = useCostingStore(s => s.materials)
  const selectedMaterial = useCostingStore(s => s.selectedMaterial)
  const selectedCuttingSpeed = useCostingStore(s => s.selectedCuttingSpeed)
  const selectedFeedRate = useCostingStore(s => s.selectedFeedRate)
  const selectedDensity = useCostingStore(s => s.selectedDensity)
  const setSelectedMaterial = useCostingStore(s => s.setSelectedMaterial)
  const geometry = useCostingStore(s => s.geometry)

  const routingSteps = useCostingStore(s => s.routingSteps)
  const batchSize = useCostingStore(s => s.batchSize)
  const setBatchSize = useCostingStore(s => s.setBatchSize)
  const addStep = useCostingStore(s => s.addStep)
  const removeStep = useCostingStore(s => s.removeStep)
  const updateStep = useCostingStore(s => s.updateStep)

  // Extracted part dimensions for turning operations
  const partDiameter = useMemo(() => {
    if (geometry?.part_forms?.bar_stock?.diameter_mm) {
      return geometry.part_forms.bar_stock.diameter_mm
    }
    if (geometry?.bounding_box?.x_mm && geometry?.bounding_box?.y_mm) {
      return (geometry.bounding_box.x_mm + geometry.bounding_box.y_mm) / 2
    }
    return 50.0
  }, [geometry])

  const cutLength = useMemo(() => {
    if (geometry?.part_forms?.bar_stock?.height_mm) {
      return geometry.part_forms.bar_stock.height_mm
    }
    if (geometry?.bounding_box?.z_mm) {
      return geometry.bounding_box.z_mm
    }
    return 100.0
  }, [geometry])

  // Calculated Turning RPM and baseline cycle time
  const dynamicTurningMetrics = useMemo(() => {
    const vc = selectedCuttingSpeed || 180
    const feed = selectedFeedRate || 0.20
    if (partDiameter <= 0 || vc <= 0) return { rpm: 0, cycleTimeMins: 0 }
    const rpm = (vc * 1000) / (Math.PI * partDiameter)
    const cycleTimeMins = (rpm > 0 && feed > 0 && cutLength > 0) ? cutLength / (rpm * feed) : 0
    return {
      rpm: Math.round(rpm * 100) / 100,
      cycleTimeMins: Math.round(cycleTimeMins * 10000) / 10000,
    }
  }, [selectedCuttingSpeed, selectedFeedRate, partDiameter, cutLength])

  const handleDirectInputChange = (field: keyof PrimaryCostInputs, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0
    onChange(field, val)
  }

  const handleBatchSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10) || 1
    const cleanVal = Math.max(1, val)
    setBatchSize(cleanVal)
  }

  const handleMaterialSelect = (matName: string) => {
    const found = materials.find(m => m.material_name === matName)
    if (found) {
      setSelectedMaterial(found.material_name, found.density_g_cm3, found.cutting_speed_m_min, found.feed_rate_mm_rev, found.id)
    } else {
      setSelectedMaterial(matName)
    }
  }

  // Calculate manufacturing cost breakdown across all routing steps
  const { totalMfgCost, totalSetupAmortized, totalCycleRun } = useMemo(() => {
    let setupSum = 0
    let runSum = 0
    for (const s of routingSteps) {
      const combinedRate = (Number(s.hourly_rate_inr) || 0) + (Number(s.operator_rate_inr) || 0)
      const setupPerPc = (((Number(s.setup_time_mins) || 0) / 60) * combinedRate) / Math.max(1, batchSize)
      const runPerPc = ((Number(s.cycle_time_mins) || 0) / 60) * combinedRate
      setupSum += setupPerPc
      runSum += runPerPc
    }
    return {
      totalMfgCost: setupSum + runSum,
      totalSetupAmortized: setupSum,
      totalCycleRun: runSum,
    }
  }, [routingSteps, batchSize])

  // Sync computed manufacturing cost with parent form values
  React.useEffect(() => {
    const roundedMfg = Math.round(totalMfgCost * 100) / 100
    if (values.manufacturing !== roundedMfg) {
      onChange('manufacturing', roundedMfg)
    }
  }, [totalMfgCost, onChange, values.manufacturing])

  const handleMachineChange = (stepId: string, machineName: string) => {
    const found = machines.find(m => m.machine_name === machineName)
    const isTurning = machineName.toLowerCase().includes('lathe') || machineName.toLowerCase().includes('turning')
    
    if (found) {
      updateStep(stepId, {
        machine_profile_id: found.id,
        machine_name: found.machine_name,
        hourly_rate_inr: found.hourly_rate_inr,
        operator_rate_inr: found.operator_rate_inr,
        ...(isTurning && dynamicTurningMetrics.cycleTimeMins > 0 ? {
          cycle_time_mins: Math.max(0.1, Math.round(dynamicTurningMetrics.cycleTimeMins * 100) / 100),
          is_auto_calculated: true,
        } : {})
      })
    } else {
      updateStep(stepId, { machine_name: machineName })
    }
  }

  const activeMachines = useMemo(() => machines.filter(m => m.is_active), [machines])
  const activeMaterials = useMemo(() => materials.filter(m => m.is_active), [materials])

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden text-slate-900">
      {/* Warning Banner if Overheads not configured */}
      {showOverheadWarning && (
        <div className="p-3 bg-amber-50 border-l-4 border-amber-500 flex gap-3 animate-fade text-xs shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-900 leading-tight">
              <span className="font-semibold">Notice:</span> Company overheads are not configured. Go to Settings to configure overheads and commercials.
            </p>
            <Link href="/dashboard/settings" className="text-amber-700 font-semibold underline mt-0.5 inline-block hover:text-amber-800">
              Configure Now &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Main Dense Scrollable Input Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* Title Header */}
        <div className="flex justify-between items-end border-b border-slate-200 pb-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 leading-tight">Direct Cost Parameters</h2>
            <p className="text-[11px] text-slate-500">Material speeds & feeds, multi-machine routing & logistics</p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200" data-testid="quote-ref-badge">
            Ref: {quoteRef || 'REF-Pending'}
          </span>
        </div>

        {/* ── MATERIAL MACHINABILITY BASELINE SELECTOR ──────────────────────── */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Material Machinability Baseline</span>
            </label>
            <Link
              href="/dashboard/settings"
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Manage Library &rarr;
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1">
              <select
                value={selectedMaterial}
                onChange={e => handleMaterialSelect(e.target.value)}
                className="w-full h-8 px-2.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none cursor-pointer"
                data-testid="select-material-dropdown"
              >
                {activeMaterials.map(mat => (
                  <option key={mat.id} value={mat.material_name}>
                    {mat.material_name}
                  </option>
                ))}
                {!activeMaterials.some(m => m.material_name === selectedMaterial) && (
                  <option value={selectedMaterial}>{selectedMaterial}</option>
                )}
              </select>
            </div>

            {/* Speeds & Feeds Metallurgical Tags */}
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
              <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-bold" title="Cutting Speed">
                Vc: <span className="text-indigo-600">{selectedCuttingSpeed || 180}</span> m/min
              </span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-bold" title="Feed Rate">
                f: <span className="text-indigo-600">{selectedFeedRate || 0.20}</span> mm/rev
              </span>
              <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700 font-bold" title="Density">
                ρ: <span className="text-indigo-600">{(selectedDensity || 7.85).toFixed(2)}</span> g/cm³
              </span>
            </div>

          </div>
        </div>

        {/* Top Direct Materials & Tooling */}
        <div className="grid grid-cols-2 gap-3">
          {/* Raw Material Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Raw Material</span>
              <span className="text-[10px] text-slate-400 font-normal">Stock Cost</span>
            </label>
            <div className="flex items-center h-8 border border-slate-300 rounded px-2 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-1.5">₹</span>
              <input
                type="number"
                value={values.raw_material || ''}
                onChange={e => handleDirectInputChange('raw_material', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-xs font-semibold text-slate-900 p-0 bg-transparent"
                placeholder="0.00"
                data-testid="input-raw-material"
              />
              <Box className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          {/* Tooling Cost */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
              <span>Tooling</span>
              <span className="text-[10px] text-slate-400 font-normal">Inserts & Cutters</span>
            </label>
            <div className="flex items-center h-8 border border-slate-300 rounded px-2 bg-white focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-1.5">₹</span>
              <input
                type="number"
                value={values.tooling || ''}
                onChange={e => handleDirectInputChange('tooling', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-xs font-semibold text-slate-900 p-0 bg-transparent"
                placeholder="0.00"
                data-testid="input-tooling"
              />
              <Wrench className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* ── PROCESS ROUTING BUILDER SECTION ─────────────────────────────────── */}
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Process Routing Builder
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-100 text-indigo-800 font-bold">
                {routingSteps.length} Ops
              </span>
            </div>

            {/* Batch Size Amortization Control */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <label className="text-[11px] font-semibold text-slate-600 whitespace-nowrap">Batch Size:</label>
              <div className="flex items-center h-7 w-24 border border-slate-300 rounded px-1.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                <input
                  type="number"
                  min="1"
                  value={batchSize}
                  onChange={handleBatchSizeChange}
                  className="w-full font-mono text-xs font-bold text-indigo-700 outline-none text-right"
                  data-testid="input-batch-size"
                />
                <span className="text-[10px] text-slate-400 ml-1">pcs</span>
              </div>
            </div>
          </div>

          {/* Operations Table */}
          <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100/90 text-slate-600 uppercase font-semibold text-[9px] border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-2">Work Center</th>
                  <th className="py-2 px-2 text-right w-20">Setup (m)</th>
                  <th className="py-2 px-2 text-right w-20">Cycle (m)</th>
                  <th className="py-2 px-2 text-right w-24">Cost / Pc</th>
                  <th className="py-2 px-1 text-center w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {routingSteps.map((step, idx) => {
                  const combinedRate = (Number(step.hourly_rate_inr) || 0) + (Number(step.operator_rate_inr) || 0)
                  const setupCostPerPc = (((Number(step.setup_time_mins) || 0) / 60) * combinedRate) / Math.max(1, batchSize)
                  const runCostPerPc = ((Number(step.cycle_time_mins) || 0) / 60) * combinedRate
                  const stepLineTotal = setupCostPerPc + runCostPerPc
                  const isTurning = step.machine_name.toLowerCase().includes('lathe') || step.machine_name.toLowerCase().includes('turning')

                  return (
                    <tr key={step.id} className="hover:bg-slate-50 transition-colors" data-testid="routing-step-row">
                      <td className="py-2 px-2 text-center font-mono font-bold text-indigo-600">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={step.machine_name}
                          onChange={e => handleMachineChange(step.id, e.target.value)}
                          className="w-full text-xs font-semibold text-slate-800 bg-transparent border-none outline-none focus:ring-0 cursor-pointer p-0"
                          data-testid="routing-step-machine-select"
                        >
                          {activeMachines.map(m => (
                            <option key={m.id} value={m.machine_name}>
                              {m.machine_name} (₹{m.hourly_rate_inr + m.operator_rate_inr}/h)
                            </option>
                          ))}
                          {!activeMachines.some(m => m.machine_name === step.machine_name) && (
                            <option value={step.machine_name} disabled>
                              {step.machine_name} (Inactive / Offline)
                            </option>
                          )}
                        </select>
                        <div className="text-[9px] font-mono text-slate-400 flex items-center gap-1 mt-0.5 flex-wrap">
                          <span>M: ₹{step.hourly_rate_inr}</span>
                          <span>+</span>
                          <span>Op: ₹{step.operator_rate_inr}</span>
                          {isTurning && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded font-sans font-bold border border-indigo-100" title="Cycle time driven by metallurgical speeds & feeds">
                              <Zap className="w-2.5 h-2.5 text-indigo-600" />
                              <span>Auto {Math.round(dynamicTurningMetrics.rpm)} RPM</span>
                            </span>
                          )}
                          {!machines.find(m => m.machine_name === step.machine_name)?.is_active && (
                            <span className="text-[9px] text-rose-600 font-sans font-bold bg-rose-50 px-1 rounded ml-1">
                              Offline
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={step.setup_time_mins}
                          onChange={e => updateStep(step.id, { setup_time_mins: parseFloat(e.target.value) || 0 })}
                          className="w-16 h-6 px-1 text-right font-mono text-xs border border-slate-200 rounded focus:border-indigo-600 outline-none bg-slate-50 focus:bg-white"
                          placeholder="0"
                          data-testid="routing-step-setup-time"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={step.cycle_time_mins}
                          onChange={e => updateStep(step.id, { cycle_time_mins: parseFloat(e.target.value) || 0, is_auto_calculated: false })}
                          className={`w-16 h-6 px-1 text-right font-mono text-xs border rounded focus:border-indigo-600 outline-none bg-slate-50 focus:bg-white font-semibold text-slate-900 ${
                            isTurning ? 'border-indigo-300 text-indigo-900 font-bold' : 'border-slate-200'
                          }`}
                          placeholder="0"
                          data-testid="routing-step-cycle-time"
                        />
                      </td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-slate-900 tabular-nums" data-testid="routing-step-line-total">
                        ₹{stepLineTotal.toFixed(2)}
                      </td>
                      <td className="py-2 px-1 text-center">
                        <button
                          type="button"
                          onClick={() => removeStep(step.id)}
                          disabled={routingSteps.length <= 1}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Remove Operation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Add Operation Button & Subtotal Strip */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => addStep()}
              className="px-3 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              data-testid="add-routing-step-btn"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Routing Step</span>
            </button>

            {/* Manufacturing Cost Breakdown Summary */}
            <div className="flex items-center gap-3 self-end text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Mfg Total / Pc</span>
                <span className="font-mono font-extrabold text-indigo-700 text-sm" data-testid="total-mfg-cost-badge">
                  {formatINR(totalMfgCost)}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-2 text-[10px] text-slate-500 font-mono">
                <div>Setup: ₹{totalSetupAmortized.toFixed(2)}</div>
                <div>Run: ₹{totalCycleRun.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Labour & Inspection Inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Labour Cost</label>
            <div className="flex items-center h-8 border border-slate-300 rounded px-2 bg-white focus-within:ring-2 focus-within:ring-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-1.5">₹</span>
              <input
                type="number"
                value={values.labour || ''}
                onChange={e => handleDirectInputChange('labour', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-xs font-semibold text-slate-900 p-0 bg-transparent w-full"
                placeholder="0.00"
                data-testid="input-labour"
              />
              <Users className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">Inspection (QA)</label>
            <div className="flex items-center h-8 border border-slate-300 rounded px-2 bg-white focus-within:ring-2 focus-within:ring-indigo-600 transition-all">
              <span className="text-xs font-bold text-slate-500 mr-1.5">₹</span>
              <input
                type="number"
                value={values.inspection || ''}
                onChange={e => handleDirectInputChange('inspection', e)}
                className="flex-1 border-none outline-none focus:ring-0 font-mono text-xs font-semibold text-slate-900 p-0 bg-transparent w-full"
                placeholder="0.00"
                data-testid="input-inspection"
              />
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Logistics Cost */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between">
            <span>Logistics & Packaging</span>
            <span className="text-[10px] text-slate-400 font-normal">Freight & Packing</span>
          </label>
          <div className="flex items-center h-8 border border-slate-300 rounded px-2 bg-white focus-within:ring-2 focus-within:ring-indigo-600 transition-all">
            <span className="text-xs font-bold text-slate-500 mr-1.5">₹</span>
            <input
              type="number"
              value={values.logistics || ''}
              onChange={e => handleDirectInputChange('logistics', e)}
              className="flex-1 border-none outline-none focus:ring-0 font-mono text-xs font-semibold text-slate-900 p-0 bg-transparent"
              placeholder="0.00"
              data-testid="input-logistics"
            />
            <Truck className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Summary Metadata Card */}
        <div className="pt-2 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <p className="text-[10px] uppercase text-slate-500">Amortization Base</p>
              <p className="font-bold text-slate-900 font-mono">{batchSize} Units Batch</p>
            </div>
            <div className="p-2 bg-slate-50 rounded border border-slate-200">
              <p className="text-[10px] uppercase text-slate-500">Active Routing</p>
              <p className="font-bold text-indigo-700 font-mono">{routingSteps.length} Operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

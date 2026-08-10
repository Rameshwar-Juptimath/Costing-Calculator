'use client'
import React, { useMemo, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { CurrencyInput } from '@/components/ui/CurrencyInput'
import { useCostingStore } from '@/store/costingStore'
import { Cpu, Plus, Trash2, Sparkles, Zap } from 'lucide-react'
import { formatINR } from '@/lib/currency'

export function Step1DirectCost() {
  const { register, watch, setValue, formState: { errors } } = useFormContext()
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

  const partDiameter = useMemo(() => {
    if (geometry?.part_forms?.bar_stock?.diameter_mm) return geometry.part_forms.bar_stock.diameter_mm
    if (geometry?.bounding_box?.x_mm && geometry?.bounding_box?.y_mm) return (geometry.bounding_box.x_mm + geometry.bounding_box.y_mm) / 2
    return 50.0
  }, [geometry])

  const cutLength = useMemo(() => {
    if (geometry?.part_forms?.bar_stock?.height_mm) return geometry.part_forms.bar_stock.height_mm
    if (geometry?.bounding_box?.z_mm) return geometry.bounding_box.z_mm
    return 100.0
  }, [geometry])

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

  // Calculate manufacturing subtotal from routing steps
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

  const activeMachines = useMemo(() => machines.filter(m => m.is_active), [machines])
  const activeMaterials = useMemo(() => materials.filter(m => m.is_active), [materials])

  // Sync with form manufacturing value
  useEffect(() => {
    setValue('manufacturing', totalMfgCost.toFixed(2))
  }, [totalMfgCost, setValue])

  const values = watch(['raw_material', 'tooling', 'manufacturing', 'labour', 'inspection', 'logistics'])
  const subtotal = values.reduce((acc, val) => acc + (Number(val) || 0), 0)

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

  const handleMaterialSelect = (matName: string) => {
    const found = materials.find(m => m.material_name === matName)
    if (found) {
      setSelectedMaterial(found.material_name, found.density_g_cm3, found.cutting_speed_m_min, found.feed_rate_mm_rev, found.id)
    } else {
      setSelectedMaterial(matName)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Direct Cost Parameters</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Batch Quantity:</span>
          <input
            type="number"
            min="1"
            value={batchSize}
            onChange={e => setBatchSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono font-bold text-indigo-400 text-right outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Material Machinability Selector */}
      <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Material Machinability Baseline</span>
          </label>
          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span>Vc: <strong className="text-indigo-400">{selectedCuttingSpeed}</strong> m/min</span>
            <span>f: <strong className="text-indigo-400">{selectedFeedRate}</strong> mm/rev</span>
            <span>ρ: <strong className="text-indigo-400">{(selectedDensity || 7.85).toFixed(2)}</strong> g/cm³</span>
          </div>

        </div>
        <select
          value={selectedMaterial}
          onChange={e => handleMaterialSelect(e.target.value)}
          className="w-full bg-slate-800 text-white rounded px-3 py-1.5 text-xs border border-slate-700 outline-none cursor-pointer font-medium"
        >
          {activeMaterials.map(mat => (
            <option key={mat.id} value={mat.material_name}>
              {mat.material_name} ({mat.cutting_speed_m_min} m/min | {mat.feed_rate_mm_rev} mm/rev)
            </option>
          ))}
          {!activeMaterials.some(m => m.material_name === selectedMaterial) && (
            <option value={selectedMaterial}>{selectedMaterial}</option>
          )}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput label="Raw Material" {...register('raw_material')} error={errors.raw_material?.message as string} />
        <CurrencyInput label="Tooling" {...register('tooling')} error={errors.tooling?.message as string} />
      </div>

      {/* Process Routing Operations Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Process Routing Operations</h3>
          </div>
          <span className="text-xs font-mono text-indigo-400 font-semibold">
            Mfg Total: {formatINR(totalMfgCost)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2 px-2 text-center w-8">#</th>
                <th className="py-2 px-2">Work Center / Machine</th>
                <th className="py-2 px-2 text-right">Setup (m)</th>
                <th className="py-2 px-2 text-right">Cycle (m)</th>
                <th className="py-2 px-2 text-right">Cost / Pc</th>
                <th className="py-2 px-1 text-center w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {routingSteps.map((step, idx) => {
                const combinedRate = (Number(step.hourly_rate_inr) || 0) + (Number(step.operator_rate_inr) || 0)
                const setupCostPerPc = (((Number(step.setup_time_mins) || 0) / 60) * combinedRate) / Math.max(1, batchSize)
                const runCostPerPc = ((Number(step.cycle_time_mins) || 0) / 60) * combinedRate
                const stepLineTotal = setupCostPerPc + runCostPerPc
                const isTurning = step.machine_name.toLowerCase().includes('lathe') || step.machine_name.toLowerCase().includes('turning')

                return (
                  <tr key={step.id} className="hover:bg-slate-800/40">
                    <td className="py-2 px-2 text-center font-bold text-indigo-400">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-2 font-sans">
                      <select
                        value={step.machine_name}
                        onChange={e => handleMachineChange(step.id, e.target.value)}
                        className="bg-slate-800 text-white rounded px-2 py-1 text-xs border border-slate-700 outline-none w-full"
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
                      {isTurning && (
                        <span className="inline-flex items-center gap-1 text-[9px] text-indigo-300 font-mono mt-0.5">
                          <Zap className="w-2.5 h-2.5 text-indigo-400" />
                          <span>Auto RPM: {Math.round(dynamicTurningMetrics.rpm)}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={step.setup_time_mins}
                        onChange={e => updateStep(step.id, { setup_time_mins: parseFloat(e.target.value) || 0 })}
                        className="w-16 px-1.5 py-0.5 text-right bg-slate-800 border border-slate-700 rounded text-xs text-white outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={step.cycle_time_mins}
                        onChange={e => updateStep(step.id, { cycle_time_mins: parseFloat(e.target.value) || 0, is_auto_calculated: false })}
                        className="w-16 px-1.5 py-0.5 text-right bg-slate-800 border border-slate-700 rounded text-xs text-white font-semibold outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-indigo-300">
                      ₹{stepLineTotal.toFixed(2)}
                    </td>
                    <td className="py-2 px-1 text-center">
                      <button
                        type="button"
                        onClick={() => removeStep(step.id)}
                        disabled={routingSteps.length <= 1}
                        className="p-1 text-slate-500 hover:text-rose-400 disabled:opacity-30"
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

        <button
          type="button"
          onClick={() => addStep()}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Operation Step</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CurrencyInput label="Labour" {...register('labour')} error={errors.labour?.message as string} />
        <CurrencyInput label="Inspection" {...register('inspection')} error={errors.inspection?.message as string} />
        <CurrencyInput label="Logistics" {...register('logistics')} error={errors.logistics?.message as string} />
      </div>

      <div className="p-4 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800">
        <div>
          <span className="text-slate-400 font-medium">Direct Subtotal</span>
          <span className="text-xs text-slate-500 block">Includes amortized setup across {batchSize} pcs</span>
        </div>
        <span className="text-xl font-bold font-mono text-white">₹{subtotal.toFixed(2)}</span>
      </div>
    </div>
  )
}

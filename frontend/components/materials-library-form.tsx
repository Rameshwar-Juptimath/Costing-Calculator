'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X, RefreshCw, Layers, Sparkles, Activity, Gauge } from 'lucide-react'
import { useCostingStore, MaterialMachinability, DEFAULT_MATERIALS_MACHINABILITY } from '@/store/costingStore'

interface MaterialsLibraryFormProps {
  isDisabled?: boolean
}

export function MaterialsLibraryForm({ isDisabled = false }: MaterialsLibraryFormProps) {
  const materials = useCostingStore(s => s.materials)
  const setMaterials = useCostingStore(s => s.setMaterials)
  const token = useCostingStore(s => s.token)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<MaterialMachinability | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formVc, setFormVc] = useState('200')
  const [formFeed, setFormFeed] = useState('0.20')
  const [formDensity, setFormDensity] = useState('7.85')
  const [formActive, setFormActive] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Fetch materials from backend
  const fetchMaterials = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/v1/materials`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          setMaterials(
            data.items.map((m: any) => ({
              id: m.id,
              material_name: m.material_name,
              cutting_speed_m_min: Number(m.cutting_speed_m_min),
              feed_rate_mm_rev: Number(m.feed_rate_mm_rev),
              density_g_cm3: Number(m.density_g_cm3),
              is_active: m.is_active,
            }))
          )
        }
      }
    } catch (e) {
      console.error('Failed to fetch materials:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isDisabled) {
      fetchMaterials()
    }
  }, [isDisabled])

  const openAddModal = () => {
    setEditingMaterial(null)
    setFormName('')
    setFormVc('200')
    setFormFeed('0.20')
    setFormDensity('7.85')
    setFormActive(true)
    setErrorMsg('')
    setModalOpen(true)
  }

  const openEditModal = (mat: MaterialMachinability) => {
    setEditingMaterial(mat)
    setFormName(mat.material_name)
    setFormVc(mat.cutting_speed_m_min.toString())
    setFormFeed(mat.feed_rate_mm_rev.toString())
    setFormDensity(mat.density_g_cm3.toString())
    setFormActive(mat.is_active)
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      setErrorMsg('Material designation name is required')
      return
    }

    const vc = parseFloat(formVc) || 0
    const feed = parseFloat(formFeed) || 0
    const density = parseFloat(formDensity) || 0

    if (vc <= 0 || feed <= 0 || density <= 0) {
      setErrorMsg('Cutting speed, feed rate, and density must all be greater than zero')
      return
    }

    if (editingMaterial) {
      // Update local state
      const updatedList = materials.map(m =>
        m.id === editingMaterial.id
          ? {
              ...m,
              material_name: formName.trim(),
              cutting_speed_m_min: vc,
              feed_rate_mm_rev: feed,
              density_g_cm3: density,
              is_active: formActive,
            }
          : m
      )
      setMaterials(updatedList)

      // Sync backend
      if (token && editingMaterial.id && !editingMaterial.id.startsWith('mat-')) {
        try {
          await fetch(`${apiUrl}/api/v1/materials/${editingMaterial.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              material_name: formName.trim(),
              cutting_speed_m_min: vc,
              feed_rate_mm_rev: feed,
              density_g_cm3: density,
              is_active: formActive,
            }),
          })
        } catch (err) {
          console.error(err)
        }
      }
    } else {
      // Create new
      const tempId = 'mat-' + Date.now()
      const newMat: MaterialMachinability = {
        id: tempId,
        material_name: formName.trim(),
        cutting_speed_m_min: vc,
        feed_rate_mm_rev: feed,
        density_g_cm3: density,
        is_active: formActive,
      }
      setMaterials([...materials, newMat])

      if (token) {
        try {
          const res = await fetch(`${apiUrl}/api/v1/materials`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              material_name: formName.trim(),
              cutting_speed_m_min: vc,
              feed_rate_mm_rev: feed,
              density_g_cm3: density,
              is_active: formActive,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            setMaterials(
              materials
                .filter(m => m.id !== tempId)
                .concat({
                  id: data.id,
                  material_name: data.material_name,
                  cutting_speed_m_min: Number(data.cutting_speed_m_min),
                  feed_rate_mm_rev: Number(data.feed_rate_mm_rev),
                  density_g_cm3: Number(data.density_g_cm3),
                  is_active: data.is_active,
                })
            )
          }
        } catch (err) {
          console.error(err)
        }
      }
    }

    setModalOpen(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this material profile?')) {
      setMaterials(materials.filter(m => m.id !== id))
      if (token && id && !id.startsWith('mat-')) {
        try {
          await fetch(`${apiUrl}/api/v1/materials/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        } catch (err) {
          console.error(err)
        }
      }
    }
  }

  // Calculate live preview metrics for modal (for reference Ø50mm x 100mm cut)
  const modalVc = parseFloat(formVc) || 0
  const modalFeed = parseFloat(formFeed) || 0
  const previewRpm = modalVc > 0 ? (modalVc * 1000) / (Math.PI * 50) : 0
  const previewCycleTime = previewRpm > 0 && modalFeed > 0 ? 100 / (previewRpm * modalFeed) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>Material Machinability & Speeds/Feeds Library</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Define metallurgical cutting constants (Vc Cutting Speed and f Feed Rate) to automate CNC spindle RPM and cycle time calculations.
          </p>

        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMaterials}
            disabled={isDisabled || loading}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            onClick={openAddModal}
            disabled={isDisabled}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
            data-testid="add-material-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* Materials Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Material Grade / Tooling</th>
              <th className="py-3 px-4 text-right">Cutting Speed Vc (m/min)</th>
              <th className="py-3 px-4 text-right">Feed Rate f (mm/rev)</th>
              <th className="py-3 px-4 text-right">Density ρ (g/cm³)</th>
              <th className="py-3 px-4 text-right">Ref. Cycle (Ø50 × 100mm)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 font-mono">
            {materials.map(mat => {
              const rpm = (mat.cutting_speed_m_min * 1000) / (Math.PI * 50)
              const refCycle = (100 / (rpm * mat.feed_rate_mm_rev))

              return (
                <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span>{mat.material_name}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-800">
                    {mat.cutting_speed_m_min.toFixed(1)} <span className="text-[10px] text-slate-400 font-normal">m/min</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {mat.feed_rate_mm_rev.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">mm/rev</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    {mat.density_g_cm3.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">g/cm³</span>
                  </td>
                  <td className="py-3 px-4 text-right text-indigo-700 font-semibold">
                    {refCycle.toFixed(2)}m <span className="text-[10px] text-slate-400 font-normal font-sans">({Math.round(rpm)} RPM)</span>
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {mat.is_active ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEditModal(mat)}
                        disabled={isDisabled}
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
                        title="Edit Material"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(mat.id)}
                        disabled={isDisabled}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors disabled:opacity-50"
                        title="Delete Material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {materials.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                  No materials defined. Click &ldquo;Add Material&rdquo; to configure your first machinability baseline.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Metallurgical Formula Banner */}
      <div className="p-4 bg-slate-100/70 rounded-lg border border-slate-200 flex items-start gap-3">
        <Gauge className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-900 mb-0.5">Automated Speeds & Feeds Dynamic Cycle Calculation</p>
          <p>
            When a material is assigned to a part, the system extracts the turning diameter (D) and cut length (L) from the CAD geometry to compute machine cycle times directly:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-indigo-800 text-[11px]">
              <span className="text-slate-400 font-sans block text-[10px]">1. Spindle Speed (RPM):</span>
              RPM = (Vc × 1000) / (π × Part_Diameter_mm)
            </div>
            <div className="p-2 bg-white rounded border border-slate-200 font-mono text-indigo-800 text-[11px]">
              <span className="text-slate-400 font-sans block text-[10px]">2. Machining Cycle Time:</span>
              Cycle_Time_mins = Cut_Length_mm / (RPM × Feed_Rate_mm_rev)
            </div>
          </div>
        </div>

      </div>

      {/* Add / Edit Material Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">
                {editingMaterial ? 'Edit Material Baseline' : 'Add Material Baseline'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-600">Material Designation</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Aluminum 6061 - Carbide Tooling"
                  className="w-full h-9 px-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-600">Cutting Speed (Vc)</label>
                  <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={formVc}
                      onChange={e => setFormVc(e.target.value)}
                      className="flex-1 font-mono outline-none text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-400 font-sans">m/min</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-600">Feed Rate (f)</label>
                  <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={formFeed}
                      onChange={e => setFormFeed(e.target.value)}
                      className="flex-1 font-mono outline-none text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-400 font-sans">mm/rev</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold uppercase tracking-wider text-slate-600">Volumetric Density (ρ)</label>
                <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                  <input
                    type="number"
                    step="any"
                    min="0.1"
                    value={formDensity}
                    onChange={e => setFormDensity(e.target.value)}
                    className="flex-1 font-mono outline-none text-slate-900"
                    required
                  />
                  <span className="text-[10px] text-slate-400 font-sans">g/cm³</span>
                </div>
              </div>

              {/* Real-time Dynamic Calculation Preview */}
              <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-100 space-y-1.5">
                <div className="flex items-center justify-between text-slate-700 font-semibold text-[11px]">
                  <span>Live Simulation (Ø50mm × 100mm part):</span>
                  <span className="font-mono text-indigo-700">{Math.round(previewRpm)} RPM</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-[11px]">
                  <span>Calculated Turning Cycle Time:</span>
                  <span className="font-mono font-bold text-indigo-700 text-sm">
                    {previewCycleTime.toFixed(2)} mins ({Math.round(previewCycleTime * 60)} sec)
                  </span>
                </div>
              </div>


              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="mat-active"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="mat-active" className="text-slate-700 font-medium">
                  Active for automatic machining cycle time calculations
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold shadow-sm transition-colors"
                >
                  {editingMaterial ? 'Save Changes' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

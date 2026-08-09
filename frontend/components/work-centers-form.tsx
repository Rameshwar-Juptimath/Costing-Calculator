'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Check, X, Shield, Cpu, RefreshCw, Layers } from 'lucide-react'
import { useCostingStore, MachineProfile } from '@/store/costingStore'
import { formatINR } from '@/lib/currency'

interface WorkCentersFormProps {
  isDisabled?: boolean
}

export function WorkCentersForm({ isDisabled = false }: WorkCentersFormProps) {
  const machines = useCostingStore(s => s.machines)
  const setMachines = useCostingStore(s => s.setMachines)
  const token = useCostingStore(s => s.token)
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingMachine, setEditingMachine] = useState<MachineProfile | null>(null)

  // Form fields
  const [formName, setFormName] = useState('')
  const [formHourlyRate, setFormHourlyRate] = useState('1200')
  const [formOperatorRate, setFormOperatorRate] = useState('300')
  const [formActive, setFormActive] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  // Fetch machines from backend
  const fetchMachines = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch(`${apiUrl}/api/v1/machines`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          setMachines(
            data.items.map((m: any) => ({
              id: m.id,
              machine_name: m.machine_name,
              hourly_rate_inr: Number(m.hourly_rate_inr),
              operator_rate_inr: Number(m.operator_rate_inr),
              is_active: m.is_active,
            }))
          )
        }
      }
    } catch (e) {
      console.error('Failed to fetch machines:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isDisabled) {
      fetchMachines()
    }
  }, [isDisabled])

  const openAddModal = () => {
    setEditingMachine(null)
    setFormName('')
    setFormHourlyRate('1200')
    setFormOperatorRate('300')
    setFormActive(true)
    setErrorMsg('')
    setModalOpen(true)
  }

  const openEditModal = (m: MachineProfile) => {
    setEditingMachine(m)
    setFormName(m.machine_name)
    setFormHourlyRate(m.hourly_rate_inr.toString())
    setFormOperatorRate(m.operator_rate_inr.toString())
    setFormActive(m.is_active)
    setErrorMsg('')
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) {
      setErrorMsg('Machine name is required')
      return
    }

    const hourlyRate = parseFloat(formHourlyRate) || 0
    const operatorRate = parseFloat(formOperatorRate) || 0

    if (editingMachine) {
      // Update
      const updatedList = machines.map(m =>
        m.id === editingMachine.id
          ? {
              ...m,
              machine_name: formName.trim(),
              hourly_rate_inr: hourlyRate,
              operator_rate_inr: operatorRate,
              is_active: formActive,
            }
          : m
      )
      setMachines(updatedList)

      if (token && editingMachine.id && !editingMachine.id.startsWith('m-')) {
        try {
          await fetch(`${apiUrl}/api/v1/machines/${editingMachine.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              machine_name: formName.trim(),
              hourly_rate_inr: hourlyRate,
              operator_rate_inr: operatorRate,
              is_active: formActive,
            }),
          })
        } catch (err) {
          console.error(err)
        }
      }
    } else {
      // Create
      const tempId = 'm-' + Date.now()
      const newMachine: MachineProfile = {
        id: tempId,
        machine_name: formName.trim(),
        hourly_rate_inr: hourlyRate,
        operator_rate_inr: operatorRate,
        is_active: formActive,
      }
      setMachines([...machines, newMachine])

      if (token) {
        try {
          const res = await fetch(`${apiUrl}/api/v1/machines`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              machine_name: formName.trim(),
              hourly_rate_inr: hourlyRate,
              operator_rate_inr: operatorRate,
              is_active: formActive,
            }),
          })
          if (res.ok) {
            const data = await res.json()
            setMachines(
              machines
                .filter(m => m.id !== tempId)
                .concat({
                  id: data.id,
                  machine_name: data.machine_name,
                  hourly_rate_inr: Number(data.hourly_rate_inr),
                  operator_rate_inr: Number(data.operator_rate_inr),
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
    if (confirm('Are you sure you want to remove this machine profile?')) {
      setMachines(machines.filter(m => m.id !== id))
      if (token && id && !id.startsWith('m-')) {
        try {
          await fetch(`${apiUrl}/api/v1/machines/${id}`, {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600" />
            <span>Work Centers & Machine Library</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure hourly machine and operator rates used in sequenced process routing and batch setup calculations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchMachines}
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
            data-testid="add-machine-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Add Work Center</span>
          </button>
        </div>
      </div>

      {/* Machine Data Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Machine Profile</th>
              <th className="py-3 px-4 text-right">Machine Rate (₹/hr)</th>
              <th className="py-3 px-4 text-right">Operator Rate (₹/hr)</th>
              <th className="py-3 px-4 text-right">Combined Rate (₹/hr)</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {machines.map(m => {
              const combined = m.hourly_rate_inr + m.operator_rate_inr
              return (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-slate-900 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span>{m.machine_name}</span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    ₹{m.hourly_rate_inr.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-700">
                    ₹{m.operator_rate_inr.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-indigo-700">
                    ₹{combined.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-sans">
                    {m.is_active ? (
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
                        onClick={() => openEditModal(m)}
                        disabled={isDisabled}
                        className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors disabled:opacity-50"
                        title="Edit Machine"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(m.id)}
                        disabled={isDisabled}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors disabled:opacity-50"
                        title="Delete Machine"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {machines.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                  No work centers configured. Click &ldquo;Add Work Center&rdquo; to create your first machine profile.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pro Info Box */}
      <div className="p-4 bg-slate-100/70 rounded-lg border border-slate-200 flex items-start gap-3">
        <Layers className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 leading-relaxed">
          <p className="font-semibold text-slate-900 mb-0.5">Automated Multi-Stage Cost Amortization</p>
          <p>
            When quoting parts in the Estimator Workspace, each sequenced machine step draws directly from these hourly rates. Setup time is amortized across the requested batch size:
            <span className="font-mono text-indigo-700 font-semibold block mt-1">
              Line Cost = ((Setup Time / 60) &times; Combined Rate / Batch Size) + ((Cycle Time / 60) &times; Combined Rate)
            </span>
          </p>
        </div>
      </div>

      {/* Add / Edit Machine Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900">
                {editingMachine ? 'Edit Work Center' : 'Add New Work Center'}
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
                <label className="font-semibold uppercase tracking-wider text-slate-600">Machine / Center Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. 5-Axis CNC Mill"
                  className="w-full h-9 px-3 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-600">Hourly Machine Rate</label>
                  <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                    <span className="text-slate-400 font-bold mr-1">₹</span>
                    <input
                      type="number"
                      step="any"
                      value={formHourlyRate}
                      onChange={e => setFormHourlyRate(e.target.value)}
                      className="flex-1 font-mono outline-none text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-400">/hr</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold uppercase tracking-wider text-slate-600">Operator Rate</label>
                  <div className="flex items-center h-9 border border-slate-300 rounded px-2.5 bg-white focus-within:ring-2 focus-within:ring-indigo-600">
                    <span className="text-slate-400 font-bold mr-1">₹</span>
                    <input
                      type="number"
                      step="any"
                      value={formOperatorRate}
                      onChange={e => setFormOperatorRate(e.target.value)}
                      className="flex-1 font-mono outline-none text-slate-900"
                      required
                    />
                    <span className="text-[10px] text-slate-400">/hr</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded border border-indigo-100 flex justify-between items-center">
                <span className="text-slate-600 font-medium">Combined Hourly Rate:</span>
                <span className="font-mono font-bold text-indigo-700 text-sm">
                  ₹{((parseFloat(formHourlyRate) || 0) + (parseFloat(formOperatorRate) || 0)).toFixed(2)}/hr
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="m-active"
                  checked={formActive}
                  onChange={e => setFormActive(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="m-active" className="text-slate-700 font-medium">
                  Active for process routing calculations
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
                  {editingMachine ? 'Save Changes' : 'Create Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

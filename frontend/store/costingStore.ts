import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserFeatures {
  can_access_direct_cost: boolean
  can_access_overhead_cost: boolean
  can_access_tax: boolean
  can_access_profit_margin: boolean
}

export interface AuthUser {
  id: string
  email: string
  role: string
  tenant_id: string
  tenant_name: string
  tier: 'Basic' | 'Pro'
}

export interface MachiningAllowance {
  bar_stock_radius: number
  bar_stock_height: number
}

export interface MachineProfile {
  id: string
  machine_name: string
  hourly_rate_inr: number
  operator_rate_inr: number
  is_active: boolean
}

export interface RoutingStep {
  id: string
  sequence_order: number
  machine_profile_id?: string
  machine_name: string
  setup_time_mins: number
  cycle_time_mins: number
  hourly_rate_inr: number
  operator_rate_inr: number
}

export const DEFAULT_MACHINES: MachineProfile[] = [
  { id: 'm-1', machine_name: '3-Axis CNC VMC', hourly_rate_inr: 1200, operator_rate_inr: 300, is_active: true },
  { id: 'm-2', machine_name: 'CNC Lathe (Turning Center)', hourly_rate_inr: 850, operator_rate_inr: 250, is_active: true },
  { id: 'm-3', machine_name: '5-Axis CNC Mill', hourly_rate_inr: 2800, operator_rate_inr: 500, is_active: true },
  { id: 'm-4', machine_name: 'Wire EDM', hourly_rate_inr: 1600, operator_rate_inr: 350, is_active: true },
  { id: 'm-5', machine_name: 'Surface Grinding', hourly_rate_inr: 600, operator_rate_inr: 200, is_active: true },
  { id: 'm-6', machine_name: 'Sheet Metal Laser Cutting', hourly_rate_inr: 1500, operator_rate_inr: 300, is_active: true },
]

export const DEFAULT_INITIAL_STEPS: RoutingStep[] = [
  {
    id: 'step-1',
    sequence_order: 1,
    machine_name: '3-Axis CNC VMC',
    setup_time_mins: 15,
    cycle_time_mins: 4.5,
    hourly_rate_inr: 1200,
    operator_rate_inr: 300,
  }
]

interface CostingStore {
  user: AuthUser | null
  features: UserFeatures | null
  token: string | null
  estimateId: string | null
  quoteRef: string | null
  filename: string | null
  geometry: any | null
  meshUrl: string | null
  costResult: any | null
  currentStep: 1 | 2 | 3
  stockForm: 'bar_stock' | 'sheet'
  machiningAllowance: MachiningAllowance
  selectedMaterial: string
  selectedDensity: number
  batchSize: number
  machines: MachineProfile[]
  routingSteps: RoutingStep[]

  setUser: (user: AuthUser, features: UserFeatures) => void
  setToken: (token: string) => void
  setEstimate: (id: string, geometry: any, meshUrl: string | null, filename?: string, quoteRef?: string) => void
  setCostResult: (result: any) => void
  setStep: (step: 1 | 2 | 3) => void
  setStockForm: (stockForm: 'bar_stock' | 'sheet') => void
  setMachiningAllowance: (allowance: MachiningAllowance) => void
  setSelectedMaterial: (name: string, density: number) => void
  setBatchSize: (batchSize: number) => void
  setMachines: (machines: MachineProfile[]) => void
  setRoutingSteps: (steps: RoutingStep[]) => void
  addStep: (step?: Partial<RoutingStep>) => void
  removeStep: (id: string) => void
  updateStep: (id: string, updates: Partial<RoutingStep>) => void
  calculateManufacturingCost: (customBatchSize?: number) => number
  setQuoteRef: (ref: string | null) => void
  resetEstimate: () => void
  logout: () => void
}

export const useCostingStore = create<CostingStore>()(persist(
  (set, get) => ({
    user: null,
    features: null,
    token: null,
    estimateId: null,
    quoteRef: null,
    filename: null,
    geometry: null,
    meshUrl: null,
    costResult: null,
    currentStep: 1,
    stockForm: 'bar_stock',
    machiningAllowance: { bar_stock_radius: 1.0, bar_stock_height: 3.0 },
    selectedMaterial: 'Mild Steel',
    selectedDensity: 7.85,
    batchSize: 100,
    machines: DEFAULT_MACHINES,
    routingSteps: DEFAULT_INITIAL_STEPS,

    setUser: (user, features) => set({ user, features }),
    setToken: (token) => set({ token }),
    setEstimate: (estimateId, geometry, meshUrl, filename, quoteRef) => {
      const recForm = geometry?.part_forms?.recommended_form || 'bar_stock'
      const matName = geometry?.material_name || 'Mild Steel'
      const densityMap: Record<string, number> = {
        'aluminum 6061': 2.70,
        'al 6061': 2.70,
        'mild steel': 7.85,
        'steel': 7.85,
        'stainless steel 304': 8.00,
        'ss 304': 8.00,
        'stainless steel 316': 8.00,
        'ss 316': 8.00,
        'brass c360': 8.50,
        'brass': 8.50,
        'copper': 8.96,
        'titanium grade 5': 4.43,
        'titanium': 4.43,
        'cast iron': 7.20,
        'delrin (pom)': 1.41,
        'delrin': 1.41
      }
      const matchedDensity = densityMap[matName.toLowerCase()] ?? 7.85
      set({ 
        estimateId, geometry, meshUrl, filename: filename || null, 
        quoteRef: quoteRef || get().quoteRef || null,
        stockForm: recForm as 'bar_stock' | 'sheet',
        selectedMaterial: matName,
        selectedDensity: matchedDensity
      })
    },
    setCostResult: (costResult) => set({ costResult }),
    setStep: (currentStep) => set({ currentStep }),
    setStockForm: (stockForm) => set({ stockForm }),
    setMachiningAllowance: (machiningAllowance) => set({ machiningAllowance }),
    setSelectedMaterial: (selectedMaterial, selectedDensity) => set({ selectedMaterial, selectedDensity }),
    setBatchSize: (batchSize) => set({ batchSize: Math.max(1, batchSize || 1) }),
    setMachines: (machines) => set({ machines }),
    setRoutingSteps: (routingSteps) => set({ routingSteps }),
    addStep: (partial) => {
      const current = get().routingSteps
      const activeMachines = get().machines.filter(m => m.is_active)
      const defaultMachine = activeMachines[0] || get().machines[0] || DEFAULT_MACHINES[0]
      const newStep: RoutingStep = {
        id: 'step-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        sequence_order: current.length + 1,
        machine_profile_id: defaultMachine?.id,
        machine_name: defaultMachine?.machine_name || '3-Axis CNC VMC',
        setup_time_mins: 15,
        cycle_time_mins: 5,
        hourly_rate_inr: defaultMachine?.hourly_rate_inr || 1200,
        operator_rate_inr: defaultMachine?.operator_rate_inr || 300,
        ...partial,
      }
      set({ routingSteps: [...current, newStep] })
    },
    removeStep: (id) => {
      const filtered = get().routingSteps.filter(s => s.id !== id)
      const resequenced = filtered.map((s, idx) => ({ ...s, sequence_order: idx + 1 }))
      set({ routingSteps: resequenced })
    },
    updateStep: (id, updates) => {
      const updated = get().routingSteps.map(s => (s.id === id ? { ...s, ...updates } : s))
      set({ routingSteps: updated })
    },
    calculateManufacturingCost: (customBatchSize) => {
      const batch = customBatchSize || get().batchSize || 100
      const steps = get().routingSteps
      let total = 0
      for (const s of steps) {
        const combinedRate = (Number(s.hourly_rate_inr) || 0) + (Number(s.operator_rate_inr) || 0)
        const setupCostPerPc = (((Number(s.setup_time_mins) || 0) / 60) * combinedRate) / Math.max(1, batch)
        const runCostPerPc = ((Number(s.cycle_time_mins) || 0) / 60) * combinedRate
        total += setupCostPerPc + runCostPerPc
      }
      return Math.round(total * 100) / 100
    },
    setQuoteRef: (quoteRef) => set({ quoteRef }),
    resetEstimate: () => set({
      estimateId: null,
      quoteRef: null,
      filename: null,
      geometry: null,
      meshUrl: null,
      costResult: null,
      currentStep: 1,
      stockForm: 'bar_stock',
      machiningAllowance: { bar_stock_radius: 1.0, bar_stock_height: 3.0 },
      selectedMaterial: 'Mild Steel',
      selectedDensity: 7.85,
      batchSize: 100,
      routingSteps: DEFAULT_INITIAL_STEPS,
    }),
    logout: () => set({
      user: null, features: null, token: null, estimateId: null, quoteRef: null, filename: null,
      geometry: null, meshUrl: null, costResult: null, currentStep: 1, stockForm: 'bar_stock',
      machiningAllowance: { bar_stock_radius: 1.0, bar_stock_height: 3.0 },
      selectedMaterial: 'Mild Steel', selectedDensity: 7.85,
      batchSize: 100, routingSteps: DEFAULT_INITIAL_STEPS
    }),
  }),
  {
    name: 'costing-store',
    version: 2,
    migrate: (persistedState: any, version: number) => {
      if (persistedState && typeof persistedState === 'object') {
        if (persistedState.quoteRef && typeof persistedState.quoteRef === 'string' && persistedState.quoteRef.startsWith('CE-')) {
          persistedState.quoteRef = null
        }
      }
      return persistedState
    }
  }
))

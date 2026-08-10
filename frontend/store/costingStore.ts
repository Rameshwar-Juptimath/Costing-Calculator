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

export interface MaterialMachinability {
  id: string
  material_name: string
  cutting_speed_m_min: number
  feed_rate_mm_rev: number
  density_g_cm3: number
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
  is_auto_calculated?: boolean
}

export const DEFAULT_MACHINES: MachineProfile[] = [
  { id: 'm-1', machine_name: '3-Axis CNC VMC', hourly_rate_inr: 1200, operator_rate_inr: 300, is_active: true },
  { id: 'm-2', machine_name: 'CNC Lathe (Turning Center)', hourly_rate_inr: 850, operator_rate_inr: 250, is_active: true },
  { id: 'm-3', machine_name: '5-Axis CNC Mill', hourly_rate_inr: 2800, operator_rate_inr: 500, is_active: true },
  { id: 'm-4', machine_name: 'Wire EDM', hourly_rate_inr: 1600, operator_rate_inr: 350, is_active: true },
  { id: 'm-5', machine_name: 'Surface Grinding', hourly_rate_inr: 600, operator_rate_inr: 200, is_active: true },
  { id: 'm-6', machine_name: 'Sheet Metal Laser Cutting', hourly_rate_inr: 1500, operator_rate_inr: 300, is_active: true },
]

export const DEFAULT_MATERIALS_MACHINABILITY: MaterialMachinability[] = [
  { id: 'mat-1', material_name: 'Aluminum 6061 - Carbide Tooling', cutting_speed_m_min: 300, feed_rate_mm_rev: 0.25, density_g_cm3: 2.70, is_active: true },
  { id: 'mat-2', material_name: 'Mild Steel A36 - Carbide Tooling', cutting_speed_m_min: 180, feed_rate_mm_rev: 0.20, density_g_cm3: 7.85, is_active: true },
  { id: 'mat-3', material_name: 'Stainless Steel 316 - Carbide Tooling', cutting_speed_m_min: 120, feed_rate_mm_rev: 0.15, density_g_cm3: 8.00, is_active: true },
  { id: 'mat-4', material_name: 'Stainless Steel 304 - Carbide Tooling', cutting_speed_m_min: 130, feed_rate_mm_rev: 0.16, density_g_cm3: 8.00, is_active: true },
  { id: 'mat-5', material_name: 'Brass C360 - High Speed Tooling', cutting_speed_m_min: 350, feed_rate_mm_rev: 0.30, density_g_cm3: 8.50, is_active: true },
  { id: 'mat-6', material_name: 'Titanium Grade 5 - Carbide Tooling', cutting_speed_m_min: 50, feed_rate_mm_rev: 0.10, density_g_cm3: 4.43, is_active: true },
  { id: 'mat-7', material_name: 'Delrin (POM) - High Speed Tooling', cutting_speed_m_min: 400, feed_rate_mm_rev: 0.35, density_g_cm3: 1.41, is_active: true },
  { id: 'mat-8', material_name: 'Cast Iron - Carbide Tooling', cutting_speed_m_min: 150, feed_rate_mm_rev: 0.22, density_g_cm3: 7.20, is_active: true },
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
  selectedMaterialId: string | null
  selectedDensity: number
  selectedCuttingSpeed: number
  selectedFeedRate: number
  batchSize: number
  machines: MachineProfile[]
  materials: MaterialMachinability[]
  routingSteps: RoutingStep[]

  setUser: (user: AuthUser, features: UserFeatures) => void
  setToken: (token: string) => void
  setEstimate: (id: string, geometry: any, meshUrl: string | null, filename?: string, quoteRef?: string) => void
  setCostResult: (result: any) => void
  setStep: (step: 1 | 2 | 3) => void
  setStockForm: (stockForm: 'bar_stock' | 'sheet') => void
  setMachiningAllowance: (allowance: MachiningAllowance) => void
  setSelectedMaterial: (name: string, density?: number, cuttingSpeed?: number, feedRate?: number, id?: string | null) => void
  setBatchSize: (batchSize: number) => void
  setMachines: (machines: MachineProfile[]) => void
  setMaterials: (materials: MaterialMachinability[]) => void
  setRoutingSteps: (steps: RoutingStep[]) => void
  addStep: (step?: Partial<RoutingStep>) => void
  removeStep: (id: string) => void
  updateStep: (id: string, updates: Partial<RoutingStep>) => void
  calculateManufacturingCost: (customBatchSize?: number) => number
  calculateMachiningCycleTime: (diameterMm: number, cutLengthMm: number, customVc?: number, customFeed?: number) => { rpm: number; cycleTimeMins: number }
  applyCalculatedTurningTimeToRouting: (diameterMm: number, cutLengthMm: number) => void
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
    selectedMaterial: 'Mild Steel A36 - Carbide Tooling',
    selectedMaterialId: 'mat-2',
    selectedDensity: 7.85,
    selectedCuttingSpeed: 180,
    selectedFeedRate: 0.20,
    batchSize: 100,
    machines: DEFAULT_MACHINES,
    materials: DEFAULT_MATERIALS_MACHINABILITY,
    routingSteps: DEFAULT_INITIAL_STEPS,

    setUser: (user, features) => set({ user, features }),
    setToken: (token) => set({ token }),
    setEstimate: (estimateId, geometry, meshUrl, filename, quoteRef) => {
      const recForm = geometry?.part_forms?.recommended_form || 'bar_stock'
      const rawMatName = geometry?.material_name || ''
      const currentMaterials = get().materials
      
      // Attempt smart match with materials library
      let matchedMat = currentMaterials.find(m => 
        rawMatName && m.material_name.toLowerCase().includes(rawMatName.toLowerCase())
      )

      if (!matchedMat) {
        matchedMat = currentMaterials.find(m => m.material_name.includes('Mild Steel')) || currentMaterials[0] || DEFAULT_MATERIALS_MACHINABILITY[1]
      }

      set({ 
        estimateId, 
        geometry, 
        meshUrl, 
        filename: filename || null, 
        quoteRef: quoteRef || get().quoteRef || null,
        stockForm: recForm as 'bar_stock' | 'sheet',
        selectedMaterial: matchedMat.material_name,
        selectedMaterialId: matchedMat.id,
        selectedDensity: matchedMat.density_g_cm3,
        selectedCuttingSpeed: matchedMat.cutting_speed_m_min,
        selectedFeedRate: matchedMat.feed_rate_mm_rev,
      })

      // If turning operations exist and geometry provides dimensions, update turning cycle times
      const turningDiameter = geometry?.part_forms?.bar_stock?.diameter_mm || (geometry?.bounding_box?.x_mm ? (geometry.bounding_box.x_mm + geometry.bounding_box.y_mm) / 2 : 50)
      const turningLength = geometry?.part_forms?.bar_stock?.height_mm || geometry?.bounding_box?.z_mm || 100
      get().applyCalculatedTurningTimeToRouting(turningDiameter, turningLength)
    },
    setCostResult: (costResult) => set({ costResult }),
    setStep: (currentStep) => set({ currentStep }),
    setStockForm: (stockForm) => set({ stockForm }),
    setMachiningAllowance: (machiningAllowance) => set({ machiningAllowance }),
    setSelectedMaterial: (selectedMaterial, density, cuttingSpeed, feedRate, id) => {
      const allMats = get().materials
      const found = allMats.find(m => m.material_name === selectedMaterial || (id && m.id === id))
      
      const newDensity = density ?? found?.density_g_cm3 ?? get().selectedDensity
      const newSpeed = cuttingSpeed ?? found?.cutting_speed_m_min ?? get().selectedCuttingSpeed
      const newFeed = feedRate ?? found?.feed_rate_mm_rev ?? get().selectedFeedRate
      const newId = id ?? found?.id ?? get().selectedMaterialId

      set({
        selectedMaterial,
        selectedMaterialId: newId,
        selectedDensity: newDensity,
        selectedCuttingSpeed: newSpeed,
        selectedFeedRate: newFeed,
      })

      // Recalculate turning operation steps if CAD geometry is active
      const geom = get().geometry
      if (geom) {
        const dia = geom?.part_forms?.bar_stock?.diameter_mm || ((geom?.bounding_box?.x_mm || 50) + (geom?.bounding_box?.y_mm || 50)) / 2
        const len = geom?.part_forms?.bar_stock?.height_mm || (geom?.bounding_box?.z_mm || 100)
        get().applyCalculatedTurningTimeToRouting(dia, len)
      }
    },
    setBatchSize: (batchSize) => set({ batchSize: Math.max(1, batchSize || 1) }),
    setMachines: (machines) => set({ machines }),
    setMaterials: (materials) => {
      set({ materials })
      // Sync active selected material if present in new list
      const currId = get().selectedMaterialId
      const found = materials.find(m => m.id === currId) || materials.find(m => m.material_name === get().selectedMaterial)
      if (found) {
        set({
          selectedMaterial: found.material_name,
          selectedMaterialId: found.id,
          selectedDensity: found.density_g_cm3,
          selectedCuttingSpeed: found.cutting_speed_m_min,
          selectedFeedRate: found.feed_rate_mm_rev,
        })
      }
    },
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
    calculateMachiningCycleTime: (diameterMm, cutLengthMm, customVc, customFeed) => {
      const vc = customVc ?? get().selectedCuttingSpeed ?? 180
      const feed = customFeed ?? get().selectedFeedRate ?? 0.20

      if (diameterMm <= 0 || vc <= 0) {
        return { rpm: 0, cycleTimeMins: 0 }
      }

      const rpm = (vc * 1000) / (Math.PI * diameterMm)
      if (rpm <= 0 || feed <= 0 || cutLengthMm <= 0) {
        return { rpm: Math.round(rpm * 100) / 100, cycleTimeMins: 0 }
      }

      const cycleTimeMins = cutLengthMm / (rpm * feed)
      return {
        rpm: Math.round(rpm * 100) / 100,
        cycleTimeMins: Math.round(cycleTimeMins * 10000) / 10000,
      }
    },
    applyCalculatedTurningTimeToRouting: (diameterMm, cutLengthMm) => {
      const { rpm, cycleTimeMins } = get().calculateMachiningCycleTime(diameterMm, cutLengthMm)
      if (cycleTimeMins <= 0) return

      const steps = get().routingSteps
      let modified = false
      const updatedSteps = steps.map(s => {
        const lower = s.machine_name.toLowerCase()
        const isTurning = lower.includes('lathe') || lower.includes('turning')
        if (isTurning) {
          modified = true
          return {
            ...s,
            cycle_time_mins: Math.max(0.1, Math.round(cycleTimeMins * 100) / 100),
            is_auto_calculated: true,
          }
        }
        return s
      })

      if (modified) {
        set({ routingSteps: updatedSteps })
      }
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
      selectedMaterial: 'Mild Steel A36 - Carbide Tooling',
      selectedMaterialId: 'mat-2',
      selectedDensity: 7.85,
      selectedCuttingSpeed: 180,
      selectedFeedRate: 0.20,
      batchSize: 100,
      routingSteps: DEFAULT_INITIAL_STEPS,
    }),
    logout: () => set({
      user: null, features: null, token: null, estimateId: null, quoteRef: null, filename: null,
      geometry: null, meshUrl: null, costResult: null, currentStep: 1, stockForm: 'bar_stock',
      machiningAllowance: { bar_stock_radius: 1.0, bar_stock_height: 3.0 },
      selectedMaterial: 'Mild Steel A36 - Carbide Tooling',
      selectedMaterialId: 'mat-2',
      selectedDensity: 7.85,
      selectedCuttingSpeed: 180,
      selectedFeedRate: 0.20,
      batchSize: 100, routingSteps: DEFAULT_INITIAL_STEPS
    }),
  }),
  {
    name: 'costing-store',
    version: 3,
    migrate: (persistedState: any, version: number) => {
      if (persistedState && typeof persistedState === 'object') {
        if (persistedState.quoteRef && typeof persistedState.quoteRef === 'string' && persistedState.quoteRef.startsWith('CE-')) {
          persistedState.quoteRef = null
        }
        if (!persistedState.materials || persistedState.materials.length === 0) {
          persistedState.materials = DEFAULT_MATERIALS_MACHINABILITY
        }
      }
      return persistedState
    }
  }
))

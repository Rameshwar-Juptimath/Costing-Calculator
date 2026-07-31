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

interface CostingStore {
  user: AuthUser | null
  features: UserFeatures | null
  token: string | null
  estimateId: string | null
  filename: string | null
  geometry: any | null
  meshUrl: string | null
  costResult: any | null
  currentStep: 1 | 2 | 3
  stockForm: 'bar_stock' | 'sheet'
  machiningAllowance: MachiningAllowance
  selectedMaterial: string
  selectedDensity: number
  setUser: (user: AuthUser, features: UserFeatures) => void
  setToken: (token: string) => void
  setEstimate: (id: string, geometry: any, meshUrl: string | null, filename?: string) => void
  setCostResult: (result: any) => void
  setStep: (step: 1 | 2 | 3) => void
  setStockForm: (stockForm: 'bar_stock' | 'sheet') => void
  setMachiningAllowance: (allowance: MachiningAllowance) => void
  setSelectedMaterial: (name: string, density: number) => void
  logout: () => void
}

export const useCostingStore = create<CostingStore>()(persist(
  (set) => ({
    user: null, features: null, token: null,
    estimateId: null, filename: null, geometry: null, meshUrl: null,
    costResult: null, currentStep: 1, stockForm: 'bar_stock',
    machiningAllowance: { bar_stock_radius: 1.0, bar_stock_height: 3.0 },
    selectedMaterial: 'Mild Steel',
    selectedDensity: 7.85,
    setUser: (user, features) => set({ user, features }),
    setToken: (token) => set({ token }),
    setEstimate: (estimateId, geometry, meshUrl, filename) => {
      const recForm = geometry?.part_forms?.recommended_form || 'bar_stock'
      const matName = geometry?.material_name || 'Mild Steel'
      // Standard densities mapping
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
    logout: () => set({ user: null, features: null, token: null, estimateId: null, filename: null, geometry: null, meshUrl: null, costResult: null, currentStep: 1, stockForm: 'bar_stock', machiningAllowance: { bar_stock_radius: 1.0, bar_stock_height: 3.0 }, selectedMaterial: 'Mild Steel', selectedDensity: 7.85 }),
  }),
  { name: 'costing-store' }
))

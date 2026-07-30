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

interface CostingStore {
  user: AuthUser | null
  features: UserFeatures | null
  token: string | null
  estimateId: string | null
  geometry: any | null
  meshUrl: string | null
  costResult: any | null
  currentStep: 1 | 2 | 3
  setUser: (user: AuthUser, features: UserFeatures) => void
  setToken: (token: string) => void
  setEstimate: (id: string, geometry: any, meshUrl: string | null) => void
  setCostResult: (result: any) => void
  setStep: (step: 1 | 2 | 3) => void
  logout: () => void
}

export const useCostingStore = create<CostingStore>()(persist(
  (set) => ({
    user: null, features: null, token: null,
    estimateId: null, geometry: null, meshUrl: null,
    costResult: null, currentStep: 1,
    setUser: (user, features) => set({ user, features }),
    setToken: (token) => set({ token }),
    setEstimate: (estimateId, geometry, meshUrl) => set({ estimateId, geometry, meshUrl }),
    setCostResult: (costResult) => set({ costResult }),
    setStep: (currentStep) => set({ currentStep }),
    logout: () => set({ user: null, features: null, token: null, estimateId: null, geometry: null, meshUrl: null, costResult: null, currentStep: 1 }),
  }),
  { name: 'costing-store' }
))

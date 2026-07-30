'use client'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FullCostSchema } from '@/lib/schemas'
import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Step1DirectCost } from './Step1DirectCost'
import { Step2Overhead } from './Step2Overhead'
import { Step3Commercials } from './Step3Commercials'
import { FeatureGate } from '../FeatureGate'
import { ResultsPanel } from '../ResultsPanel'
import { useState } from 'react'

export function WizardShell() {
  const { currentStep, setStep, token, estimateId, costResult, setCostResult } = useCostingStore()
  const [loading, setLoading] = useState(false)
  const methods = useForm({
    resolver: zodResolver(FullCostSchema),
    shouldUnregister: false,
    defaultValues: {
      raw_material: '0.00', tooling: '0.00', manufacturing: '0.00', labour: '0.00', inspection: '0.00', logistics: '0.00',
      factory_rent: '0.00', machinery_asset: '0.00', electricity: '0.00', telecom: '0.00', admin: '0.00', fixed_salary: '0.00', expenses: '0.00',
      tax_rate: '0.0', profit_margin_rate: '0.0'
    }
  })

  const onSubmit = async (data: any) => {
    if (currentStep < 3) {
      setStep((currentStep + 1) as 2|3)
      return
    }
    
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/v1/cost/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          estimate_id: estimateId || '00000000-0000-0000-0000-000000000000', // Mock UUID if none
          currency: 'INR',
          direct_cost: {
            raw_material: Number(data.raw_material),
            tooling: Number(data.tooling),
            manufacturing: Number(data.manufacturing),
            labour: Number(data.labour),
            inspection: Number(data.inspection),
            logistics: Number(data.logistics)
          },
          overhead_cost: {
            factory_rent: Number(data.factory_rent),
            machinery_asset: Number(data.machinery_asset),
            electricity: Number(data.electricity),
            telecom: Number(data.telecom),
            admin: Number(data.admin),
            fixed_salary: Number(data.fixed_salary),
            expenses: Number(data.expenses)
          },
          commercials: {
            tax_rate: Number(data.tax_rate),
            profit_margin_rate: Number(data.profit_margin_rate)
          }
        })
      })
      if (!res.ok) throw new Error('Calculation failed')
      const result = await res.json()
      setCostResult(result)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (costResult) {
    return <ResultsPanel />
  }

  const steps = [
    { num: 1, label: 'Direct' },
    { num: 2, label: 'Overhead' },
    { num: 3, label: 'Commercials' }
  ]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded-full z-0"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-accent rounded-full z-0 transition-all duration-300" style={{ width: `${(currentStep - 1) * 50}%` }}></div>
        {steps.map((s) => (
          <div key={s.num} className="relative z-10 flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep >= s.num ? 'bg-gradient-accent text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              {s.num}
            </div>
            <div className="absolute top-12 whitespace-nowrap text-xs font-medium text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-12">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {currentStep === 1 && <Step1DirectCost />}
            {currentStep === 2 && (
              <FeatureGate feature="can_access_overhead_cost">
                <div data-testid="overhead-form"><Step2Overhead /></div>
              </FeatureGate>
            )}
            {currentStep === 3 && (
              <FeatureGate feature="can_access_tax">
                <Step3Commercials />
              </FeatureGate>
            )}

            <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setStep((currentStep - 1) as 1|2)}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <Button 
                type="submit" 
                loading={loading}
                data-testid="step-next-btn"
              >
                {currentStep === 3 ? 'Calculate Total' : 'Next Step'}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </Card>
  )
}

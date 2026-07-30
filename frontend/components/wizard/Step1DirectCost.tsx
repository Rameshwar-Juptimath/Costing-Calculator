import { useFormContext } from 'react-hook-form'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

export function Step1DirectCost() {
  const { register, watch, formState: { errors } } = useFormContext()
  const values = watch(['raw_material', 'tooling', 'manufacturing', 'labour', 'inspection', 'logistics'])
  const subtotal = values.reduce((acc, val) => acc + (Number(val) || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-white">Direct Costs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput label="Raw Material" {...register('raw_material')} error={errors.raw_material?.message as string} />
        <CurrencyInput label="Tooling" {...register('tooling')} error={errors.tooling?.message as string} />
        <CurrencyInput label="Manufacturing" {...register('manufacturing')} error={errors.manufacturing?.message as string} />
        <CurrencyInput label="Labour" {...register('labour')} error={errors.labour?.message as string} />
        <CurrencyInput label="Inspection" {...register('inspection')} error={errors.inspection?.message as string} />
        <CurrencyInput label="Logistics" {...register('logistics')} error={errors.logistics?.message as string} />
      </div>
      <div className="p-4 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800">
        <span className="text-slate-400 font-medium">Direct Subtotal</span>
        <span className="text-xl font-bold text-white">₹{subtotal.toFixed(2)}</span>
      </div>
    </div>
  )
}

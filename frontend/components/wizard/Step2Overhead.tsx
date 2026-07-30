import { useFormContext } from 'react-hook-form'
import { CurrencyInput } from '@/components/ui/CurrencyInput'

export function Step2Overhead() {
  const { register, watch, formState: { errors } } = useFormContext()
  const values = watch(['factory_rent', 'machinery_asset', 'electricity', 'telecom', 'admin', 'fixed_salary', 'expenses'])
  const subtotal = values.reduce((acc, val) => acc + (Number(val) || 0), 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-white">Overhead Costs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CurrencyInput label="Factory Rent" {...register('factory_rent')} error={errors.factory_rent?.message as string} />
        <CurrencyInput label="Machinery & Assets" {...register('machinery_asset')} error={errors.machinery_asset?.message as string} />
        <CurrencyInput label="Electricity Bills" {...register('electricity')} error={errors.electricity?.message as string} />
        <CurrencyInput label="Internet / Telecom" {...register('telecom')} error={errors.telecom?.message as string} />
        <CurrencyInput label="Admin & Stationery" {...register('admin')} error={errors.admin?.message as string} />
        <CurrencyInput label="Fixed Salary" {...register('fixed_salary')} error={errors.fixed_salary?.message as string} />
        <CurrencyInput label="Other Expenses" {...register('expenses')} error={errors.expenses?.message as string} />
      </div>
      <div className="p-4 bg-slate-900 rounded-lg flex justify-between items-center border border-slate-800">
        <span className="text-slate-400 font-medium">Overhead Subtotal</span>
        <span className="text-xl font-bold text-white">₹{subtotal.toFixed(2)}</span>
      </div>
    </div>
  )
}

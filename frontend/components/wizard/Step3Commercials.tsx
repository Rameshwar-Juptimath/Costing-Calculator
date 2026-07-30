import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'

export function Step3Commercials() {
  const { register, formState: { errors } } = useFormContext()

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <h2 className="text-xl font-semibold text-white">Commercials & Margins</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="GST / Tax Rate (%)" {...register('tax_rate')} error={errors.tax_rate?.message as string} placeholder="18.0" />
        <Input label="Profit Margin (%)" {...register('profit_margin_rate')} error={errors.profit_margin_rate?.message as string} placeholder="15.0" />
      </div>
    </div>
  )
}

import { z } from 'zod'
const DecimalStr = z.string().regex(/^\d+(\.\d{0,2})?$/, 'Must be a valid amount')

export const DirectCostSchema = z.object({
  raw_material: DecimalStr,
  tooling: DecimalStr,
  manufacturing: DecimalStr,
  labour: DecimalStr,
  inspection: DecimalStr,
  logistics: DecimalStr,
})

export const OverheadCostSchema = z.object({
  factory_rent: DecimalStr,
  machinery_asset: DecimalStr,
  electricity: DecimalStr,
  telecom: DecimalStr,
  admin: DecimalStr,
  fixed_salary: DecimalStr,
  expenses: DecimalStr,
})

export const CommercialsSchema = z.object({
  tax_rate: z.string().regex(/^\d+(\.\d)?$/).transform(Number),
  profit_margin_rate: z.string().regex(/^\d+(\.\d)?$/).transform(Number),
})

export const FullCostSchema = DirectCostSchema.merge(OverheadCostSchema).merge(CommercialsSchema)

import { useCostingStore } from '@/store/costingStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function fmt(val: any): string {
  const num = Number(val) || 0
  return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function ResultsPanel() {
  const costResult = useCostingStore(s => s.costResult)
  const setCostResult = useCostingStore(s => s.setCostResult)
  const setStep = useCostingStore(s => s.setStep)

  if (!costResult) return null

  const grandTotal = Number(costResult.totals?.grand_total) || 0
  const taxAmount = Number(costResult.totals?.tax_amount) || 0
  const marginAmount = Number(costResult.totals?.margin_amount) || 0
  const directSubtotal = Number(costResult.totals?.direct_subtotal) || 0
  const overheadSubtotal = Number(costResult.totals?.overhead_subtotal) || 0

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl font-bold text-white">Estimate Result</h2>
        <Button variant="ghost" size="sm" onClick={() => { setCostResult(null); setStep(1); }}>
          Start Over
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="bg-gradient-accent p-8 text-center text-white">
          <p className="text-blue-100 font-medium mb-1">Grand Total</p>
          <div className="text-4xl font-extrabold">₹{fmt(grandTotal)}</div>
          <div className="mt-2 text-sm text-blue-200">
            Includes {taxAmount > 0 ? 'Tax and ' : ''}Profit Margin
          </div>
        </div>

        <div className="p-6 space-y-6">
          {costResult.breakdown?.direct_cost && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Direct Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                {Object.entries(costResult.breakdown.direct_cost)
                  .filter(([k]) => k !== 'subtotal')
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between text-slate-300">
                      <span className="capitalize">{k.replace('_', ' ')}</span>
                      <span>₹{fmt(v)}</span>
                    </div>
                  ))}
                <div className="flex justify-between text-white font-medium pt-2 border-t border-slate-700/50">
                  <span>Subtotal</span>
                  <span>₹{fmt(directSubtotal)}</span>
                </div>
              </div>
            </div>
          )}

          {costResult.breakdown?.overhead_cost && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Overhead Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Factory Rent</span>
                  <span>₹{fmt(costResult.breakdown.overhead_cost.factory_rent)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Other Overheads</span>
                  <span>₹{fmt(overheadSubtotal - (Number(costResult.breakdown.overhead_cost.factory_rent) || 0))}</span>
                </div>
                <div className="flex justify-between text-white font-medium pt-2 border-t border-slate-700/50">
                  <span>Subtotal</span>
                  <span>₹{fmt(overheadSubtotal)}</span>
                </div>
              </div>
            </div>
          )}

          {costResult.breakdown?.commercials && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Commercials</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                  <span>Tax ({costResult.breakdown.commercials.tax_rate}%)</span>
                  <span>₹{fmt(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Margin ({costResult.breakdown.commercials.profit_margin_rate}%)</span>
                  <span>₹{fmt(marginAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

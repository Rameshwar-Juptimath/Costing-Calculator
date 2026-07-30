/**
 * Currency Utility - INR (₹) Formatting
 * Formats numbers into Indian Rupee locale format (e.g. ₹1,23,456.00)
 */

export function formatINR(val: number | string | undefined | null, showSymbol = true): string {
  if (val === undefined || val === null || isNaN(Number(val))) {
    return showSymbol ? '₹0.00' : '0.00';
  }

  const num = Number(val);
  
  // Format to 2 decimal places with en-IN locale
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return showSymbol ? `₹${formatted}` : formatted;
}

export function parseINR(val: string): number {
  if (!val) return 0;
  const clean = val.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? 0 : parsed;
}

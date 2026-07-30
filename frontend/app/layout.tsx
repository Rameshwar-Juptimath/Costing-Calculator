import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CostCalc — Manufacturing Cost Engine',
  description: 'Precision manufacturing cost estimation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">{children}</body>
    </html>
  )
}

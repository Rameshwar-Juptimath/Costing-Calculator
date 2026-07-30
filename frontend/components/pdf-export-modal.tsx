'use client'
import React from 'react'
import { Printer, X, ShieldCheck, Download, Sparkles } from 'lucide-react'
import { formatINR } from '@/lib/currency'

export interface PDFExportData {
  quoteRef: string
  date: string
  projectName: string
  material: string
  directCost: number
  overheadCost: number
  taxAmount: number
  marginAmount: number
  totalPrice: number
  volume: string
  surfaceArea: string
  boundingBox: string
}

interface PDFExportModalProps {
  data: PDFExportData
  onClose: () => void
}

export function PDFExportModal({ data, onClose }: PDFExportModalProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-slate-100 w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-700">
        {/* Modal Toolbar (No-print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex justify-between items-center border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">PDF Cost Estimate Document Preview</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded shadow flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body (A4 Simulation) */}
        <div className="p-8 bg-white overflow-y-auto flex-1 font-sans text-slate-900 print:p-0">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Document Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-indigo-600 uppercase">
                  CostEngine Pro
                </h1>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-0.5">
                  Precision Manufacturing Analysis
                </p>
              </div>
              <div className="text-right text-xs font-mono text-slate-600">
                <p>
                  Quote Ref: <span className="text-slate-900 font-bold">{data.quoteRef}</span>
                </p>
                <p>
                  Date: <span className="text-slate-900">{data.date}</span>
                </p>
                <p>
                  Project: <span className="text-indigo-600 font-bold">{data.projectName}</span>
                </p>
              </div>
            </div>

            {/* Section 1: Executive Summary */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-l-4 border-indigo-600 pl-2.5">
                01 // EXECUTIVE SUMMARY
              </h2>
              <div className="grid grid-cols-3 gap-0 border border-slate-300 rounded overflow-hidden">
                <div className="p-4 bg-slate-50 border-r border-slate-300">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">Direct Manufacturing Cost</p>
                  <p className="font-mono text-xl font-bold text-slate-900 mt-1">
                    {formatINR(data.directCost)}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 border-r border-slate-300">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">Fixed Overhead Allocation</p>
                  <p className="font-mono text-xl font-bold text-indigo-600 mt-1">
                    {formatINR(data.overheadCost)}
                  </p>
                </div>
                <div className="p-4 bg-indigo-600 text-white">
                  <p className="text-[10px] font-semibold uppercase opacity-90">Final Commercial Quote</p>
                  <p className="font-mono text-2xl font-bold mt-1">{formatINR(data.totalPrice)}</p>
                </div>
              </div>
            </section>

            {/* Section 2: Component Specifications */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-l-4 border-indigo-600 pl-2.5">
                02 // COMPONENT SPECIFICATIONS & CAD DATA
              </h2>
              <div className="grid grid-cols-2 gap-6 items-start">
                <div className="aspect-video bg-slate-900 rounded border border-slate-700 flex items-center justify-center p-4 text-slate-400 text-center relative overflow-hidden">
                  <svg viewBox="0 0 300 200" className="w-full h-full stroke-indigo-400 fill-none stroke-2">
                    <polygon points="50,60 210,40 210,140 50,160" />
                    <polygon points="50,60 210,40 250,20 90,40" fill="#1e1b4b" />
                    <polygon points="210,40 250,20 250,120 210,140" fill="#312e81" />
                    <ellipse cx="130" cy="100" rx="30" ry="20" stroke="#a5b4fc" />
                  </svg>
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-indigo-300 bg-slate-900/80 px-2 py-0.5 rounded">
                    CAD THUMBNAIL PREVIEW
                  </span>
                </div>
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="border-b border-slate-200 pb-1.5 flex justify-between">
                    <span className="font-sans text-slate-500">Material</span>
                    <span className="text-slate-900 font-bold">{data.material}</span>
                  </div>
                  <div className="border-b border-slate-200 pb-1.5 flex justify-between">
                    <span className="font-sans text-slate-500">Volume</span>
                    <span className="text-slate-900">{data.volume}</span>
                  </div>
                  <div className="border-b border-slate-200 pb-1.5 flex justify-between">
                    <span className="font-sans text-slate-500">Surface Area</span>
                    <span className="text-slate-900">{data.surfaceArea}</span>
                  </div>
                  <div className="border-b border-slate-200 pb-1.5 flex justify-between">
                    <span className="font-sans text-slate-500">Bounding Box</span>
                    <span className="text-slate-900">{data.boundingBox}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Itemized Financial BOM Breakdown */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-l-4 border-indigo-600 pl-2.5">
                03 // DETAILED COST BREAKDOWN (INR ₹)
              </h2>
              <table className="w-full text-xs font-mono border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-sans border-b border-slate-200">
                    <th className="p-2.5 text-left">ITEM CATEGORY</th>
                    <th className="p-2.5 text-right">AMOUNT (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-sans">Direct Material & Tooling</td>
                    <td className="p-2.5 text-right font-bold">{formatINR(data.directCost * 0.45)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Machining & Labor Processing</td>
                    <td className="p-2.5 text-right font-bold">{formatINR(data.directCost * 0.55)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Allocated Factory Overheads</td>
                    <td className="p-2.5 text-right font-bold text-indigo-600">{formatINR(data.overheadCost)}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-sans">Applicable Taxes (GST 18%)</td>
                    <td className="p-2.5 text-right font-bold">{formatINR(data.taxAmount)}</td>
                  </tr>
                  <tr className="bg-indigo-50 font-bold">
                    <td className="p-2.5 font-sans text-indigo-950">TOTAL FINAL QUOTE</td>
                    <td className="p-2.5 text-right text-indigo-950">{formatINR(data.totalPrice)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Legal Disclaimers & Signatures */}
            <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px] text-slate-500 font-sans">
              <div>
                <h4 className="font-bold text-slate-800 uppercase mb-1">Terms & Conditions</h4>
                <p className="leading-relaxed">
                  This cost estimate is generated based on automated physics-based CAD analysis. Quote is valid for 30 calendar days from issue date. Material prices are subject to market fluctuations.
                </p>
              </div>
              <div className="text-right flex flex-col justify-between">
                <div className="flex items-center justify-end gap-1.5 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Authorized Financial Estimate</span>
                </div>
                <p className="font-mono text-[10px] text-slate-400">
                  Generated by CostEngine Pro &bull; Tenant ID: DEMO-TN-01
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

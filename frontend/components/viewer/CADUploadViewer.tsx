'use client'

import dynamic from 'next/dynamic'
import { useState, useRef } from 'react'
import { useCostingStore } from '@/store/costingStore'
import { Button } from '@/components/ui/Button'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Box, Layers, Scale } from 'lucide-react'

const CADViewer = dynamic(() => import('./CADViewer').then(m => m.CADViewer), { ssr: false })
const DXF2DViewer = dynamic(() => import('./DXF2DViewer').then(m => m.DXF2DViewer), { ssr: false })

function sortedDims(geom: any) {
  if (!geom?.bounding_box) return [0, 0, 0]
  const { x_mm = 0, y_mm = 0, z_mm = 0 } = geom.bounding_box
  return [x_mm, y_mm, z_mm].sort((a, b) => a - b)
}

const MATERIALS_LIST = [
  { name: 'Aluminum 6061', density: 2.70 },
  { name: 'Mild Steel', density: 7.85 },
  { name: 'Stainless Steel 304', density: 8.00 },
  { name: 'Stainless Steel 316', density: 8.00 },
  { name: 'Brass C360', density: 8.50 },
  { name: 'Copper', density: 8.96 },
  { name: 'Titanium Grade 5', density: 4.43 },
  { name: 'Cast Iron', density: 7.20 },
  { name: 'Delrin (POM)', density: 1.41 },
]

export function CADUploadViewer() {
  const { 
    token, meshUrl, geometry, filename, setEstimate, 
    stockForm, setStockForm, machiningAllowance,
    selectedMaterial, selectedDensity, setSelectedMaterial 
  } = useCostingStore()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Calculate Part Volume (factoring in machining allowances for Bar Stock)
  const getDisplayVolume = () => {
    if (!geometry) return 0
    if (stockForm === 'bar_stock') {
      const baseRadius = geometry.part_forms?.bar_stock?.radius_mm ?? 
        ((sortedDims(geometry)[0] + sortedDims(geometry)[1]) / 4)
      const baseHeight = geometry.part_forms?.bar_stock?.height_mm ?? sortedDims(geometry)[2]

      const radiusAllowance = machiningAllowance?.bar_stock_radius ?? 
        ((machiningAllowance as any)?.bar_stock_diameter ? (machiningAllowance as any).bar_stock_diameter / 2 : 1.0)
      const heightAllowance = machiningAllowance?.bar_stock_height ?? 3.0

      const rawRadius = baseRadius + radiusAllowance
      const rawHeight = baseHeight + heightAllowance

      const rawVolume = Math.PI * Math.pow(rawRadius, 2) * rawHeight
      return Math.round(rawVolume)
    }
    return Math.round(geometry.volume_mm3 ?? 0)
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    const ext = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : ''
    if (!['step', 'stp', 'dxf', 'dwg', 'dwf'].includes(ext || '')) {
      setError('Invalid file type. Please upload a .step, .stp, .dxf, .dwg, or .dwf CAD file.')
      return
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds the 100 MB limit.')
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiUrl}/api/v1/cad/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(errData.detail || 'Failed to upload CAD file.')
      }

      const data = await res.json()
      // Construct full mesh URL if relative
      const fullMeshUrl = data.mesh_url
        ? data.mesh_url.startsWith('http')
          ? data.mesh_url
          : `${apiUrl}${data.mesh_url}`
        : null

      setEstimate(data.estimate_id, data.geometry, fullMeshUrl, data.filename)
      setFileInfo({ name: data.filename, type: data.file_type })
    } catch (err: any) {
      setError(err.message || 'CAD file processing failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const isLoaded = Boolean(meshUrl || (geometry && geometry.entities))

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        accept=".step,.stp,.dxf,.dwg,.dwf"
        className="hidden"
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0])
          }
        }}
      />

      {!isLoaded ? (
        /* Upload Drag & Drop Zone */
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            uploading
              ? 'border-blue-500 bg-blue-500/5 cursor-wait'
              : 'border-slate-700 hover:border-blue-500/50 hover:bg-slate-900/50 bg-slate-900/30'
          }`}
        >
          {uploading ? (
            <div className="py-6 space-y-3">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto" />
              <p className="text-white font-medium text-base">Processing CAD Geometry...</p>
              <p className="text-xs text-slate-400">Extracting volume, bounding box & mesh</p>
            </div>
          ) : (
            <div className="py-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto text-blue-400 border border-blue-500/20">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-white font-semibold text-base">Upload CAD File</p>
                <p className="text-slate-400 text-xs mt-1">
                  Drag & drop your 3D (<span className="text-blue-400 font-mono">.step, .stp</span>) or 2D (<span className="text-blue-400 font-mono">.dxf, .dwg, .dwf</span>) files here
                </p>
              </div>
              <Button variant="secondary" size="sm" type="button" className="mt-2">
                Browse Files
              </Button>
              <p className="text-slate-500 text-[11px]">Maximum file size: 100 MB</p>
            </div>
          )}
        </div>
      ) : (
        /* CAD Model / Drawing Viewer */
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-200">{filename || fileInfo?.name || 'CAD File Loaded'}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              <span>Replace File</span>
            </Button>
          </div>

          {meshUrl ? (
            <CADViewer meshUrl={meshUrl} />
          ) : (
            <DXF2DViewer geometry={geometry} />
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-400 bg-red-950/40 p-3 rounded-lg border border-red-500/30 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Geometry Metadata Display Cards & Stock Form Selector */}
      {geometry && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Geometry Feature Analysis</p>
            
            {/* Form Selection Toggle */}
            <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
              <button
                type="button"
                onClick={() => setStockForm('bar_stock')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-all ${
                  stockForm === 'bar_stock'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                Bar Stock
              </button>
              <button
                type="button"
                onClick={() => setStockForm('sheet')}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-all ${
                  stockForm === 'sheet'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                Sheet Metal
              </button>
            </div>
          </div>

          {geometry.volume_mm3 !== undefined && (() => {
            const rawVol = getDisplayVolume()
            const activeDensity = selectedDensity || 7.85
            const rawMassKg = (rawVol * activeDensity) / 1000000
            const rawMassG = (rawVol * activeDensity) / 1000
            const netMassKg = ((geometry.volume_mm3 ?? 0) * activeDensity) / 1000000

            return (
              <div className="space-y-3">
                {/* Volume & Mass Cards */}
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60 flex flex-col justify-between">
                    <div className="flex items-center text-slate-400">
                      <Box className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
                      <span>Part Volume</span>
                    </div>
                    <div className="text-white font-mono font-semibold text-sm mt-1">
                      {rawVol.toLocaleString()} mm³
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Net CAD: {Math.round(geometry.volume_mm3 ?? 0).toLocaleString()} mm³
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center">
                        <Scale className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                        <span>Estimated Mass</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 font-mono font-medium">
                        ρ {activeDensity.toFixed(2)} g/cm³
                      </span>
                    </div>
                    <div className="text-white font-mono font-semibold text-sm mt-1">
                      {rawMassKg.toFixed(3)} kg
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex justify-between">
                      <span>{rawMassG.toFixed(1)} g</span>
                      <span>Net: {netMassKg.toFixed(3)} kg</span>
                    </div>
                  </div>
                </div>

                {/* Material Specification Banner & Interactive Dropdown */}
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Material Specification</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {geometry.material_name ? (
                      <span className="text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 font-mono text-[10px]">
                        CAD: {geometry.material_name}
                      </span>
                    ) : null}
                    <select
                      value={selectedMaterial}
                      onChange={(e) => {
                        const mat = MATERIALS_LIST.find(m => m.name === e.target.value)
                        if (mat) {
                          setSelectedMaterial(mat.name, mat.density)
                        }
                      }}
                      className="bg-slate-900 text-cyan-400 font-mono text-xs border border-cyan-800/60 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                    >
                      {MATERIALS_LIST.map((mat) => (
                        <option key={mat.name} value={mat.name} className="bg-slate-900 text-slate-200">
                          {mat.name} ({mat.density.toFixed(2)} g/cm³)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              {stockForm === 'bar_stock' ? (() => {
                const baseRadius = geometry.part_forms?.bar_stock?.radius_mm ?? 
                  ((sortedDims(geometry)[0] + sortedDims(geometry)[1]) / 4)
                const radiusAllowance = machiningAllowance?.bar_stock_radius ?? 
                  ((machiningAllowance as any)?.bar_stock_diameter ? (machiningAllowance as any).bar_stock_diameter / 2 : 1.0)
                const rawRadius = baseRadius + radiusAllowance
                const rawDiameter = rawRadius * 2.0

                const baseHeight = geometry.part_forms?.bar_stock?.height_mm ?? sortedDims(geometry)[2]
                const heightAllowance = machiningAllowance?.bar_stock_height ?? 3.0
                const rawHeight = baseHeight + heightAllowance

                const rawArea = Math.PI * Math.pow(rawRadius, 2)

                return (
                  /* Cylindrical Part / Bar Stock Dimensions (Drawing + Machining Allowance) */
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Radius (R)</span>
                        <span className="text-[10px] text-blue-400 font-mono">Drawing: {baseRadius.toFixed(1)} + {radiusAllowance.toFixed(1)}mm</span>
                      </div>
                      <p className="text-white font-mono font-semibold text-sm mt-0.5">
                        {rawRadius.toFixed(2)} mm
                      </p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Diameter (D)</span>
                        <span className="text-[10px] text-blue-400 font-mono">Drawing: {(baseRadius * 2).toFixed(1)} + {(radiusAllowance * 2).toFixed(1)}mm</span>
                      </div>
                      <p className="text-white font-mono font-semibold text-sm mt-0.5">
                        {rawDiameter.toFixed(2)} mm
                      </p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Height / Length (H)</span>
                        <span className="text-[10px] text-blue-400 font-mono">Drawing: {baseHeight.toFixed(1)} + {heightAllowance.toFixed(1)}mm</span>
                      </div>
                      <p className="text-white font-mono font-semibold text-sm mt-0.5">
                        {rawHeight.toFixed(2)} mm
                      </p>
                    </div>

                    <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Cross-Section Area</span>
                        <span className="text-[10px] text-slate-400 font-mono">π × R²</span>
                      </div>
                      <p className="text-white font-mono font-semibold text-sm mt-0.5">
                        {rawArea.toFixed(2)} mm²
                      </p>
                    </div>
                  </div>
                )
              })() : (
                /* Sheet Metal Dimensions */
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                    <p className="text-slate-400 text-[11px]">Thickness (T)</p>
                    <p className="text-white font-mono font-semibold text-sm mt-0.5">
                      {geometry.part_forms?.sheet?.thickness_mm ?? sortedDims(geometry)[0].toFixed(2)} mm
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                    <p className="text-slate-400 text-[11px]">Width (W)</p>
                    <p className="text-white font-mono font-semibold text-sm mt-0.5">
                      {geometry.part_forms?.sheet?.width_mm ?? sortedDims(geometry)[1].toFixed(2)} mm
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                    <p className="text-slate-400 text-[11px]">Length (L)</p>
                    <p className="text-white font-mono font-semibold text-sm mt-0.5">
                      {geometry.part_forms?.sheet?.length_mm ?? sortedDims(geometry)[2].toFixed(2)} mm
                    </p>
                  </div>
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800/60">
                    <p className="text-slate-400 text-[11px]">Sheet Area (L × W)</p>
                    <p className="text-white font-mono font-semibold text-sm mt-0.5">
                      {geometry.part_forms?.sheet?.sheet_area_mm2 ?? 
                        (sortedDims(geometry)[1] * sortedDims(geometry)[2]).toFixed(2)} mm²
                    </p>
                  </div>
                </div>
              )}
            </div>
            )
          })()}

          {geometry.total_area_mm2 !== undefined && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-lg">
                <div className="flex items-center text-slate-400 mb-1">
                  <FileText className="w-3.5 h-3.5 mr-1 text-blue-400" />
                  <span>Total Area</span>
                </div>
                <div className="text-white font-mono font-semibold">{geometry.total_area_mm2.toLocaleString()} mm²</div>
              </div>
              <div className="bg-slate-800/60 p-2.5 rounded-lg">
                <div className="flex items-center text-slate-400 mb-1">
                  <Layers className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                  <span>Total Perimeter</span>
                </div>
                <div className="text-white font-mono font-semibold">{geometry.total_perimeter_mm.toLocaleString()} mm</div>
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Geometry extracted & synced to cost input engine</span>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import dynamic from 'next/dynamic'
import { useState, useRef } from 'react'
import { useCostingStore } from '@/store/costingStore'
import { Button } from '@/components/ui/Button'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Box, Layers } from 'lucide-react'

const CADViewer = dynamic(() => import('./CADViewer').then(m => m.CADViewer), { ssr: false })
const DXF2DViewer = dynamic(() => import('./DXF2DViewer').then(m => m.DXF2DViewer), { ssr: false })

export function CADUploadViewer() {
  const { token, meshUrl, geometry, setEstimate } = useCostingStore()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

      setEstimate(data.estimate_id, data.geometry, fullMeshUrl)
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
              <span className="text-xs font-medium text-slate-200">{fileInfo?.name || 'CAD File Loaded'}</span>
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

      {/* Geometry Metadata Display Cards */}
      {geometry && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Geometry Feature Analysis</p>

          {geometry.volume_mm3 !== undefined && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-2.5 rounded-lg">
                <div className="flex items-center text-slate-400 mb-1">
                  <Box className="w-3.5 h-3.5 mr-1 text-blue-400" />
                  <span>Volume</span>
                </div>
                <div className="text-white font-mono font-semibold">{geometry.volume_mm3.toLocaleString()} mm³</div>
              </div>

              {geometry.bounding_box && (
                <div className="bg-slate-800/60 p-2.5 rounded-lg">
                  <div className="flex items-center text-slate-400 mb-1">
                    <Layers className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                    <span>Bounding Box</span>
                  </div>
                  <div className="text-white font-mono font-semibold">
                    {geometry.bounding_box.x_mm} × {geometry.bounding_box.y_mm} × {geometry.bounding_box.z_mm} mm
                  </div>
                </div>
              )}
            </div>
          )}

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

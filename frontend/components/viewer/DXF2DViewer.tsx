'use client'

import { useEffect, useRef } from 'react'

interface DXFEntity {
  type: string
  layer: string
  area_mm2: number
  perimeter_mm: number
}

interface DXFGeometry {
  entities: DXFEntity[]
  total_area_mm2: number
  total_perimeter_mm: number
  drawing_units: string
}

export function DXF2DViewer({ geometry }: { geometry: DXFGeometry }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas resolution
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw grid background
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    const gridSize = 20
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Render 2D CAD Schematic representation
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const scale = Math.min(rect.width, rect.height) / 300

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.shadowColor = '#3b82f6'
    ctx.shadowBlur = 8

    // Draw entities based on parsed DXF types
    const entities = geometry.entities || []
    let radiusOffset = 30

    entities.forEach((entity, index) => {
      ctx.beginPath()
      if (entity.type === 'CIRCLE') {
        const r = Math.max(15, Math.sqrt(entity.area_mm2 / Math.PI) * scale)
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI)
        ctx.strokeStyle = '#38bdf8'
      } else if (entity.type === 'ARC') {
        ctx.arc(centerX, centerY, radiusOffset * scale, 0, Math.PI * 1.2)
        ctx.strokeStyle = '#818cf8'
      } else if (entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') {
        const size = Math.max(40, (entity.perimeter_mm / 4) * scale)
        const half = size / 2
        ctx.rect(centerX - half, centerY - half, size, size)
        ctx.strokeStyle = '#60a5fa'
      } else if (entity.type === 'LINE') {
        const angle = (index * 45 * Math.PI) / 180
        const len = Math.max(30, entity.perimeter_mm * scale)
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX + Math.cos(angle) * len, centerY + Math.sin(angle) * len)
        ctx.strokeStyle = '#93c5fd'
      } else {
        ctx.arc(centerX + (index % 3 - 1) * 30, centerY + Math.floor(index / 3) * 30, 20, 0, 2 * Math.PI)
      }
      ctx.stroke()
      radiusOffset += 15
    })

    // Fallback if no specific entities detected
    if (entities.length === 0) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, 60, 0, 2 * Math.PI)
      ctx.stroke()
    }
  }, [geometry])

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs text-slate-300 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
        <span>2D DXF/DWG Vector Drawing</span>
      </div>
    </div>
  )
}

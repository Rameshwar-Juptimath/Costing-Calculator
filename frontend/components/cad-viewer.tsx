'use client'
import React, { useState } from 'react'
import { ZoomIn, ZoomOut, Grid, RotateCcw, Box, FileCode } from 'lucide-react'

interface GeometrySpecs {
  volume: string
  surfaceArea: string
  boundingBox: string
}

interface CADViewerProps {
  geometry?: GeometrySpecs
}

export function CADViewer({ geometry }: CADViewerProps) {
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D')
  const [isWireframe, setIsWireframe] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [rotation, setRotation] = useState({ x: 20, y: 35 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const specs = geometry || {
    volume: '1,240 mm³',
    surfaceArea: '850 mm²',
    boundingBox: '120 × 80 × 45 mm',
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (viewMode === '3D') {
      setIsDragging(true)
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && viewMode === '3D') {
      const deltaX = e.clientX - dragStart.x
      const deltaY = e.clientY - dragStart.y
      setRotation(prev => ({
        x: Math.max(-90, Math.min(90, prev.x - deltaY * 0.5)),
        y: (prev.y + deltaX * 0.5) % 360,
      }))
      setDragStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleReset = () => {
    setRotation({ x: 20, y: 35 })
    setZoomLevel(1)
    setIsWireframe(false)
  }

  return (
    <div className="w-full h-full bg-[#0b1c30] relative overflow-hidden flex flex-col justify-between select-none">
      {/* Top Bar: View Mode Switcher */}
      <div className="absolute top-4 left-4 z-20 bg-slate-900/90 backdrop-blur-md p-1 rounded-lg border border-slate-700/80 flex gap-1 shadow-lg">
        <button
          type="button"
          onClick={() => setViewMode('3D')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
            viewMode === '3D'
              ? 'bg-primary text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D Model</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('2D')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
            viewMode === '2D'
              ? 'bg-primary text-white shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>2D Blueprint</span>
        </button>
      </div>

      {/* CAD Canvas Area */}
      <div
        className="w-full h-full flex items-center justify-center p-6 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {viewMode === '3D' ? (
          <div
            className="transition-transform duration-75 flex items-center justify-center w-full h-full"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Interactive 3D Render Representation */}
            <svg
              viewBox="0 0 400 300"
              className="w-full max-w-lg h-auto drop-shadow-[0_10px_25px_rgba(70,72,212,0.25)]"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <defs>
                <linearGradient id="cadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4648d4" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6063ee" stopOpacity="0.1" />
                </linearGradient>
              </defs>

              {/* Technical Grid Background */}
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <rect width="400" height="300" fill="url(#grid)" />

              {/* 3D Machined Block Geometry */}
              <g stroke="#6063ee" strokeWidth={isWireframe ? "1" : "1.5"} fill={isWireframe ? "none" : "url(#cadGrad)"}>
                {/* Front Face */}
                <polygon points="100,120 280,100 280,220 100,240" strokeOpacity="0.9" />
                {/* Top Face */}
                <polygon points="100,120 280,100 320,60 140,80" fill="#3b82f6" fillOpacity={isWireframe ? "0" : "0.4"} />
                {/* Side Face */}
                <polygon points="280,100 320,60 320,180 280,220" fill="#1e1b4b" fillOpacity={isWireframe ? "0" : "0.7"} />
                {/* Bored Hole Detail */}
                <ellipse cx="190" cy="170" rx="35" ry="25" stroke="#a5b4fc" strokeDasharray="3,3" fill="none" />
                <ellipse cx="190" cy="170" rx="20" ry="14" stroke="#c0c1ff" strokeWidth="1.5" fill="#0f172a" fillOpacity={isWireframe ? "0" : "0.8"} />
                {/* Chamfer lines */}
                <line x1="100" y1="120" x2="120" y2="110" stroke="#93c5fd" />
                <line x1="280" y1="100" x2="295" y2="92" stroke="#93c5fd" />
              </g>

              {/* Dimension Annotations */}
              <text x="190" y="260" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">120.0 mm</text>
              <line x1="100" y1="248" x2="280" y2="228" stroke="#64748b" strokeWidth="0.5" strokeDasharray="2,2" />
            </svg>
          </div>
        ) : (
          /* 2D Blueprint Mode */
          <div className="w-full h-full flex items-center justify-center p-4">
            <svg viewBox="0 0 500 380" className="w-full max-w-lg h-auto border border-slate-700/60 rounded bg-[#091524] p-4">
              <defs>
                <pattern id="grid2d" width="15" height="15" patternUnits="userSpaceOnUse">
                  <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="460" height="340" fill="url(#grid2d)" />

              {/* Blueprint Geometry Top View */}
              <rect x="60" y="50" width="160" height="120" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="140" cy="110" r="30" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4,2" />
              <line x1="60" y1="110" x2="220" y2="110" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="6,3" />
              <line x1="140" y1="50" x2="140" y2="170" stroke="#0284c7" strokeWidth="0.5" strokeDasharray="6,3" />
              <text x="140" y="42" fill="#38bdf8" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">R 30.00</text>
              <text x="140" y="190" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">TOP VIEW - SCALE 1:1</text>

              {/* Blueprint Side Section View */}
              <rect x="260" y="50" width="150" height="120" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <line x1="310" y1="50" x2="310" y2="170" stroke="#e0e7ff" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="360" y1="50" x2="360" y2="170" stroke="#e0e7ff" strokeWidth="1" strokeDasharray="2,2" />
              <text x="335" y="190" fill="#94a3b8" fontSize="10" fontFamily="JetBrains Mono" textAnchor="middle">SECTION A-A</text>

              {/* Title Block */}
              <rect x="240" y="260" width="200" height="70" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <text x="250" y="280" fill="#f8fafc" fontSize="11" fontFamily="Inter" fontWeight="bold">PRECISION COSTENGINE</text>
              <text x="250" y="298" fill="#94a3b8" fontSize="9" fontFamily="Inter">PART #: CE-4402-A</text>
              <text x="250" y="315" fill="#38bdf8" fontSize="9" fontFamily="JetBrains Mono">MAT: AL-6061-T6</text>
            </svg>
          </div>
        )}
      </div>

      {/* Geometry Specs Overlay (Bottom Left) */}
      <div className="absolute bottom-4 left-4 p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-lg backdrop-blur-md z-20 min-w-[200px] shadow-lg">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-700/80 pb-1.5 mb-2.5">
          Geometry Specs
        </h4>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between gap-6">
            <span className="text-slate-400 font-sans">Volume</span>
            <span className="text-white font-medium">{specs.volume}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400 font-sans">Surface Area</span>
            <span className="text-white font-medium">{specs.surfaceArea}</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-slate-400 font-sans">Bounding Box</span>
            <span className="text-white font-medium">{specs.boundingBox}</span>
          </div>
        </div>
      </div>

      {/* Floating Toolbar Controls (Right) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-1.5 p-1 bg-slate-900/90 border border-slate-700/80 rounded-xl backdrop-blur-md z-20 shadow-lg">
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
          className="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
          className="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setIsWireframe(!isWireframe)}
          className={`w-9 h-9 flex items-center justify-center rounded transition-colors ${
            isWireframe ? 'bg-primary text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
          title="Toggle Wireframe"
        >
          <Grid className="w-4 h-4" />
        </button>
        <div className="h-px bg-slate-700/80 mx-1.5 my-0.5" />
        <button
          type="button"
          onClick={handleReset}
          className="w-9 h-9 flex items-center justify-center text-slate-300 hover:bg-slate-800 hover:text-white rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

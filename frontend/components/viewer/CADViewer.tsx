'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

function EmptyViewerPlaceholder() {
  return (
    <div className="w-full h-80 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700/50 text-slate-500 text-xs">
      No 3D model loaded
    </div>
  )
}

export function CADViewer({ meshUrl }: { meshUrl: string | null }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!meshUrl) return
    const container = containerRef.current
    if (!container) return

    let animationFrameId: number
    setLoading(true)
    setError(null)

    // 1. Setup Scene, Camera & WebGL Renderer
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f172a)

    const width = container.clientWidth || 400
    const height = container.clientHeight || 320

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(40, 40, 40)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    container.innerHTML = ''
    container.appendChild(renderer.domElement)

    // 2. Interactive OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0)
    dirLight1.position.set(50, 80, 50)
    scene.add(dirLight1)

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.0)
    dirLight2.position.set(-50, -30, -50)
    scene.add(dirLight2)

    // 4. Engineering Grid
    const gridHelper = new THREE.GridHelper(100, 20, 0x3b82f6, 0x1e293b)
    scene.add(gridHelper)

    // 5. Load GLB Mesh
    const loader = new GLTFLoader()
    loader.load(
      meshUrl,
      gltf => {
        const model = gltf.scene

        // Auto-center and fit model inside viewport
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        model.position.sub(center)

        const maxDim = Math.max(size.x, size.y, size.z)
        if (maxDim > 0) {
          const scale = 30 / maxDim
          model.scale.set(scale, scale, scale)
        }

        scene.add(model)
        setLoading(false)
      },
      undefined,
      err => {
        console.error('GLTF load error:', err)
        setError('Failed to load 3D GLB model')
        setLoading(false)
      }
    )

    // 6. Resize Observer
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      if (w > 0 && h > 0) {
        camera.aspect = w / h
        camera.updateProjectionMatrix()
        renderer.setSize(w, h)
      }
    }
    window.addEventListener('resize', handleResize)

    // 7. Render Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      renderer.dispose()
      if (container) container.innerHTML = ''
    }
  }, [meshUrl])

  if (!meshUrl) return <EmptyViewerPlaceholder />

  return (
    <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 relative">
      <div ref={containerRef} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-slate-400 text-xs">
          Loading 3D Model...
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-red-400 text-xs p-4 text-center">
          {error}
        </div>
      )}
    </div>
  )
}

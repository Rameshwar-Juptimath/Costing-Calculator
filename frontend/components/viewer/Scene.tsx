'use client'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment, Grid } from '@react-three/drei'
import { Suspense } from 'react'

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

export default function Scene({ meshUrl }: { meshUrl: string }) {
  return (
    <Canvas camera={{ position: [30, 30, 30], fov: 50 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Suspense fallback={null}>
        <Model url={meshUrl} />
      </Suspense>
      <OrbitControls enablePan enableZoom enableRotate />
      <Environment preset="city" />
      <Grid args={[100, 100]} cellColor="#334155" sectionColor="#475569" />
    </Canvas>
  )
}

'use client'
import dynamic from 'next/dynamic'
const Scene = dynamic(() => import('./Scene'), { ssr: false })

function EmptyViewerPlaceholder() {
  return (
    <div className="w-full h-80 rounded-xl flex items-center justify-center bg-slate-900 border border-slate-700/50 text-slate-500">
      No model loaded
    </div>
  )
}

export function CADViewer({ meshUrl }: { meshUrl: string | null }) {
  if (!meshUrl) return <EmptyViewerPlaceholder />
  return (
    <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
      <Scene meshUrl={meshUrl} />
    </div>
  )
}

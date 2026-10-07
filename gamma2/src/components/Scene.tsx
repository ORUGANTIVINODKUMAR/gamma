import { Component, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { useSceneMotion } from '../hooks/useSceneMotion'

const TaxScene = lazy(() => import('../three/TaxScene'))
export type SceneVariant = 'hero' | 'workspace' | 'platform'

class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? this.props.fallback : this.props.children }
}

function SceneFallback({ variant }: { variant: SceneVariant }) {
  return <div className={`scene-fallback fallback-${variant}`} aria-hidden="true"><div className="fallback-slab slab-back" /><div className="fallback-slab slab-middle" /><div className="fallback-slab slab-front"><span className="fallback-brand">TAPRECO</span><strong>{variant === 'platform' ? 'One connected workspace.' : 'A clearer tax perspective.'}</strong><span>Plan. Analyze. Decide.</span><i /><i /><i /></div></div>
}

export default function Scene({ variant, className = '' }: { variant: SceneVariant; className?: string }) {
  const { ref, active, loaded, reduced, progress } = useSceneMotion()
  const fallback = <SceneFallback variant={variant} />
  return <div ref={ref} className={`scene scene-${variant} ${className}`} data-render-state={!active ? 'paused' : reduced ? 'static' : 'animated'} role="img" aria-label={variant === 'hero' ? 'Interactive three-dimensional glass tax documents representing Tapreco’s connected tools' : variant === 'workspace' ? 'Layered three-dimensional tax planning documents' : 'Five glass tax modules assembled into one Tapreco platform'}>
    <SceneBoundary fallback={fallback}><Suspense fallback={fallback}>{loaded && <TaxScene variant={variant} active={active} reduced={reduced} progress={progress} />}</Suspense></SceneBoundary>
  </div>
}

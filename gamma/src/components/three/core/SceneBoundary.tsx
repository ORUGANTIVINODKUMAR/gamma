import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { cn, withPosition } from '@/lib/cn'
import { detectQuality } from '@/lib/three/quality'

/**
 * Loads a (lazy) 3D scene safely:
 *  - no WebGL           → static fallback, three.js is never downloaded
 *  - not idle yet       → static fallback (so the 3D bundle never competes with first paint)
 *  - scene throws       → static fallback
 *  - chunk still loading → LoadingScene
 */
export function SceneBoundary({
  children,
  fallback,
  className,
  eager = false,
}: {
  children: ReactNode
  fallback: ReactNode
  className?: string
  /** Start loading immediately instead of waiting for browser idle time. */
  eager?: boolean
}) {
  const supported = useMemo(() => detectQuality() !== 'none', [])
  const [go, setGo] = useState(eager)

  useEffect(() => {
    if (!supported || go) return
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setGo(true), { timeout: 1200 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setGo(true), 500)
    return () => clearTimeout(id)
  }, [supported, go])

  return (
    <div className={withPosition(className)}>
      {!supported || !go ? (
        <div className="absolute inset-0">{fallback}</div>
      ) : (
        <ErrorBoundary fallback={<div className="absolute inset-0">{fallback}</div>}>
          <Suspense fallback={<LoadingScene />}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}

/** Shown while the 3D chunk downloads: a quiet pearl sheen, nothing pretending to be 3D. */
export function LoadingScene() {
  return (
    <div role="status" aria-label="Loading 3D scene" className="absolute inset-0 grid place-items-center">
      <div className="h-40 w-32 animate-pulse-soft rounded-xl border border-line/10 bg-gradient-to-br from-white to-ink-600 shadow-[0_30px_50px_-30px_rgba(15,23,42,0.4)]" />
    </div>
  )
}

/**
 * Static stand-in for the 3D scene (no WebGL, reduced capability, or while it
 * loads): a few printed pages, fanned. Deliberately flat — it is a fallback.
 */
export function DocumentPoster({ className }: { className?: string }) {
  const sheet = 'absolute left-1/2 top-1/2 h-[46%] aspect-[0.77] -translate-x-1/2 -translate-y-1/2 rounded-md border border-line/10 bg-gradient-to-b from-white to-[#f0eee8] shadow-[0_28px_50px_-26px_rgba(15,23,42,0.45)]'
  return (
    <div aria-hidden className={cn('pointer-events-none absolute inset-0', className)}>
      <div className={cn(sheet, '-translate-x-[78%] -rotate-[9deg]')} />
      <div className={cn(sheet, 'translate-x-[-22%] rotate-[5deg]')} />
      <div className={cn(sheet, 'z-10 -translate-y-[54%]')}>
        <div className="m-[9%] h-1.5 w-1/4 rounded-full bg-accent-400" />
        <div className="mx-[9%] mt-3 h-2.5 w-3/5 rounded-full bg-fg/80" />
        <div className="mx-[9%] mt-2 h-2 w-4/5 rounded-full bg-fg/10" />
        <div className="mx-[9%] mt-2 h-2 w-2/3 rounded-full bg-fg/10" />
        <div className="mx-[9%] mt-6 h-2 w-3/4 rounded-full bg-fg/10" />
        <div className="mx-[9%] mt-2 h-2 w-1/2 rounded-full bg-fg/10" />
      </div>
    </div>
  )
}

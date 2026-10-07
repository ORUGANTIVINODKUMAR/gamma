import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, X } from 'lucide-react'
import { lazy, useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DocumentPoster, SceneBoundary } from '@/components/three/core/SceneBoundary'
import type { GalleryState } from '@/components/three/scenes/GalleryScene'
import { Button } from '@/components/ui/Button'
import { TOOLS, type ToolId, type ToolMeta } from '@/config/tools'
import { usePreferences } from '@/context/PreferencesContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'

const GalleryScene = lazy(() => import('@/components/three/scenes/GalleryScene'))

function InfoPanel({ tool, index, onOpen, onClose, opening }: { tool: ToolMeta; index: number; onOpen: () => void; onClose: () => void; opening: boolean }) {
  return (
    <motion.aside
      key={tool.id}
      aria-label={`${tool.name} details`}
      initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 12, transition: { duration: 0.18 } }}
      transition={{ duration: 0.5, ease: EASE_PREMIUM }}
      className="glass-panel absolute inset-x-3 bottom-3 z-10 rounded-[1.5rem] p-5 sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-1/2 sm:w-[24rem] sm:-translate-y-1/2 sm:p-7"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">
          Tool {String(index + 1).padStart(2, '0')} / {String(TOOLS.length).padStart(2, '0')}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Back to all tools"
          className="-m-1.5 grid size-8 place-items-center rounded-full text-fg-faint transition-colors hover:bg-line/[0.06] hover:text-fg"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <h3 className="mt-3 font-serif text-[clamp(1.7rem,2.6vw,2.2rem)] leading-[1.05] tracking-[-0.02em] text-fg">{tool.name}</h3>
      <p className="mt-3 text-[14.5px] leading-relaxed text-fg-subtle">{tool.description}</p>
      <ul className="mt-4 hidden flex-col gap-2 sm:flex">
        {tool.outputs.map((o) => (
          <li key={o} className="flex items-start gap-2 text-[13px] text-fg-muted">
            <Check className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
            {o}
          </li>
        ))}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={onOpen} loading={opening} withArrow magnetic>
          Open {tool.shortName}
        </Button>
        <Button variant="ghost" size="sm" onClick={onClose}>
          All tools
        </Button>
      </div>
    </motion.aside>
  )
}

/**
 * The Tax Tool Gallery: five physical objects in a bright studio. Hover lifts
 * one, click (or tap) brings the camera to it, "Open" dives in and navigates.
 * The tool rail underneath is the keyboard and screen-reader path to the same
 * state, and stays usable when WebGL is unavailable.
 */
export function ToolGallery({ className }: { className?: string }) {
  const navigate = useNavigate()
  const { reduceMotion } = usePreferences()
  const compact = useMediaQuery('(max-width: 767px)')
  const [selected, setSelected] = useState<ToolId | null>(null)
  const [hovered, setHovered] = useState<ToolId | null>(null)
  const [diving, setDiving] = useState(false)
  const rail = useRef<HTMLDivElement>(null)

  // On phones one tool is always in focus: the arc is too wide to read at that size.
  const active: ToolId | null = selected ?? (compact ? TOOLS[0]!.id : null)
  const activeIndex = active ? TOOLS.findIndex((t) => t.id === active) : -1
  const activeTool = activeIndex >= 0 ? TOOLS[activeIndex]! : null

  const state: GalleryState = { selected: active, hovered: compact ? null : hovered, diving }

  const open = useCallback(() => {
    if (!activeTool) return
    setDiving(true)
    window.setTimeout(() => navigate(activeTool.path), reduceMotion ? 0 : 380)
  }, [activeTool, navigate, reduceMotion])

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const onRailKey = (e: KeyboardEvent<HTMLElement>) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    const next = (Math.max(0, activeIndex) + dir + TOOLS.length) % TOOLS.length
    setSelected(TOOLS[next]!.id)
    rail.current?.querySelectorAll<HTMLElement>('button[data-tool]')[next]?.focus()
  }

  return (
    <section aria-label="Tax tool gallery" className={cn('relative', className)}>
      <div className="relative h-[72svh] min-h-[540px] overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_40px_90px_-50px_rgba(15,23,42,0.35)] studio-bg sm:h-[62svh] sm:min-h-[520px]">
        <SceneBoundary eager className="absolute inset-0" fallback={<DocumentPoster />}>
          <GalleryScene state={state} onSelect={setSelected} onHover={setHovered} className="absolute inset-0" />
        </SceneBoundary>

        {!activeTool && (
          <p className="pointer-events-none absolute inset-x-0 bottom-5 text-center text-[12.5px] font-medium text-fg-faint">
            <span className="hidden sm:inline">Hover an object · click to explore</span>
            <span className="sm:hidden">Tap a tool below</span>
          </p>
        )}

        <AnimatePresence mode="wait">
          {activeTool && <InfoPanel tool={activeTool} index={activeIndex} onOpen={open} onClose={() => setSelected(null)} opening={diving} />}
        </AnimatePresence>
      </div>

      <div
        ref={rail}
        role="group"
        aria-label="Choose a tax tool"
        className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:justify-center [scrollbar-width:none]"
      >
        {TOOLS.map((t) => {
          const on = active === t.id
          return (
            <button
              key={t.id}
              type="button"
              data-tool={t.id}
              onKeyDown={onRailKey}
              aria-pressed={on}
              tabIndex={on || (!active && t.id === TOOLS[0]!.id) ? 0 : -1}
              onClick={() => setSelected(on ? null : t.id)}
              onMouseEnter={() => !compact && setHovered(t.id)}
              onMouseLeave={() => setHovered(null)}
              className={cn(
                'inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-[13.5px] font-semibold transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-premium',
                on
                  ? 'border-accent-500/50 bg-accent-500/10 text-accent-200 shadow-[0_10px_20px_-14px_rgba(37,99,235,0.7)]'
                  : 'border-line/10 bg-white text-fg-muted hover:-translate-y-0.5 hover:border-line/25 hover:text-fg',
              )}
            >
              <t.icon className={cn('size-4', on ? 'text-accent-400' : 'text-fg-faint')} aria-hidden />
              {t.shortName}
            </button>
          )
        })}
        {activeTool && (
          <Link
            to={activeTool.path}
            onClick={(e) => {
              e.preventDefault()
              open()
            }}
            className="ml-1 hidden h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-semibold text-accent-300 hover:text-accent-200 sm:inline-flex"
          >
            Open
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </section>
  )
}

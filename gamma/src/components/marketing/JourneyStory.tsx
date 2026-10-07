import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { lazy, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { scrollToId } from '@/components/layout/SmoothScroll'
import { DocumentPoster, SceneBoundary } from '@/components/three/core/SceneBoundary'
import { Button } from '@/components/ui/Button'
import { TOOLS, type ToolMeta } from '@/config/tools'
import { useAuth } from '@/context/AuthContext'
import { useStory } from '@/hooks/useStory'
import { cn } from '@/lib/cn'
import { EASE_PREMIUM } from '@/lib/motion'

const JourneyScene = lazy(() => import('@/components/three/scenes/JourneyScene'))

/** One editorial line per tool: what you do there, said spatially. */
const TOOL_STORY: Record<ToolMeta['id'], { headline: string; lead: string }> = {
  'mutual-fund': {
    headline: 'Open the statement. See every layer of tax.',
    lead: 'Distributions, dividends and gains separated by character and taxed against the client’s real return — so the drag is visible before it is a surprise.',
  },
  'estimated-tax': {
    headline: 'Four quarters, assembled.',
    lead: 'Safe-harbor payments laid out quarter by quarter with due dates, so clients always know what is owed and when.',
  },
  'audit-risk': {
    headline: 'Scan the return before anyone else does.',
    lead: 'Eighteen documented IRS focus areas, analysed layer by layer, with the reasoning shown — and what to document to defend each position.',
  },
  'entity-comparison': {
    headline: 'Two structures, side by side.',
    lead: 'Schedule C and S corporation, each carrying its own tax components, so the cost of every choice is something you can point at.',
  },
  'tax-planner': {
    headline: 'Every strategy on one organized desk.',
    lead: 'Income, deductions, credits and strategies assembled into a full-year plan, with the savings of each move shown on its own.',
  },
}

/** Soft frosted wash behind copy so 3D objects behind it never fight the type. Feathered, so it has no visible edge. */
function Wash() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-x-14 -inset-y-16 -z-10 hidden bg-ink-950/75 backdrop-blur-[6px] [mask-image:radial-gradient(closest-side,#000_62%,transparent_100%)] sm:block"
    />
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

/** Text block pinned to one side of the viewport; the 3D tool occupies the other half. */
function Side({ side, children }: { side: 'left' | 'right' | 'center'; children: ReactNode }) {
  return (
    <div
      className={cn(
        'container-page flex min-h-svh items-end pb-[9svh] sm:items-center sm:pb-0',
        side === 'right' && 'sm:justify-end',
        side === 'center' && 'sm:justify-center sm:text-center',
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, margin: '-18% 0px -18% 0px' }}
        transition={{ duration: 0.8, ease: EASE_PREMIUM }}
        className={cn(
          'glass-panel relative w-full rounded-[1.75rem] p-6 sm:max-w-[30rem] sm:rounded-none sm:border-0 sm:bg-none sm:p-0 sm:shadow-none sm:backdrop-blur-none',
          side === 'center' && 'sm:max-w-3xl',
        )}
      >
        <Wash />
        {children}
      </motion.div>
    </div>
  )
}

function ToolScene({ tool, index, side }: { tool: ToolMeta; index: number; side: 'left' | 'right' }) {
  const copy = TOOL_STORY[tool.id]
  return (
    <section id={`scene-${index + 2}`} data-scene={index + 2} aria-labelledby={`story-${tool.id}`} className="relative min-h-[115svh]">
      <Side side={side}>
        <Eyebrow>
          {String(index + 1).padStart(2, '0')} · {tool.shortName}
        </Eyebrow>
        <h2 id={`story-${tool.id}`} className="t-h2 mt-4 text-fg">
          {copy.headline}
        </h2>
        <p className="t-lead mt-5">{copy.lead}</p>
        <ul className="mt-6 flex flex-col gap-2.5">
          {tool.outputs.map((o) => (
            <li key={o} className="flex items-start gap-2.5 text-[14.5px] text-fg-muted">
              <Check className="mt-0.5 size-4 shrink-0 text-accent-400" aria-hidden />
              {o}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button to={tool.path} withArrow>
            Open {tool.shortName}
          </Button>
          <span className="text-[12.5px] text-fg-faint">{tool.forms.join(' · ')}</span>
        </div>
      </Side>
    </section>
  )
}

/** The side rail: where you are in the story, and a way to jump. */
function StoryRail({ labels }: { labels: string[] }) {
  const [active, setActive] = useState(0)
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('[data-scene]')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.scene))
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return (
    <nav aria-label="Story progress" className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-1 lg:flex">
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => scrollToId(`scene-${i}`, i === 0 ? -200 : 0)}
          aria-label={`Go to ${label}`}
          aria-current={active === i ? 'step' : undefined}
          className="group flex h-6 items-center justify-end gap-3 rounded-full pl-2"
        >
          <span className="pointer-events-none translate-x-1 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-medium text-fg-muted opacity-0 shadow-sm transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
            {label}
          </span>
          <span className={cn('block rounded-full transition-all duration-300 ease-premium', active === i ? 'h-6 w-1.5 bg-accent-400' : 'size-1.5 bg-fg/20 group-hover:bg-fg/45')} />
        </button>
      ))}
    </nav>
  )
}

export function JourneyStory() {
  const root = useRef<HTMLDivElement>(null)
  const story = useStory(root)
  const { status } = useAuth()
  const authed = status === 'authenticated'
  const labels = ['Tapreco', 'Tax tools', ...TOOLS.map((t) => t.shortName), 'Begin']

  return (
    <div ref={root} className="relative" style={{ ['--scene' as string]: 0 }}>
      {/* The persistent stage: backdrop → wordmark → 3D scene. Content scrolls over it. */}
      <div className="pointer-events-none sticky top-0 z-0 -mb-[100svh] h-svh overflow-hidden">
        <div aria-hidden className="studio-bg absolute inset-0" />
        <div
          aria-hidden
          className="absolute inset-x-0 top-[17svh] select-none text-center font-serif uppercase leading-none text-fg/[0.065]"
          style={{
            fontSize: 'clamp(5.5rem, 22vw, 23rem)',
            letterSpacing: '-0.02em',
            opacity: 'clamp(0, calc(1 - (var(--scene) - 0.5) * 2.4), 1)' as never,
            transform: 'translate3d(0, calc(-1 * max(0svh, (var(--scene) - 0.5) * 14svh)), 0)',
          }}
        >
          Tapreco
        </div>
        <SceneBoundary eager className="absolute inset-0" fallback={<DocumentPoster className="sm:left-[22%]" />}>
          <JourneyScene story={story} className="absolute inset-0" />
        </SceneBoundary>
      </div>

      <div className="relative z-10">
        {/* 0 — Tapreco */}
        <section id="scene-0" data-scene={0} aria-labelledby="hero-title" className="relative min-h-svh">
          <div className="container-page flex min-h-svh items-end pb-[9svh] pt-28 sm:items-center sm:pb-0">
            <div className="glass-panel relative w-full rounded-[1.75rem] p-6 sm:max-w-[34rem] sm:rounded-none sm:border-0 sm:bg-none sm:p-0 sm:shadow-none sm:backdrop-blur-none">
              <Wash />
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE_PREMIUM }}
                className="eyebrow"
              >
                Tapreco · Tax technology for CPAs, EAs &amp; advisors
              </motion.p>
              <motion.h1
                id="hero-title"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.65, ease: EASE_PREMIUM }}
                className="t-h1 mt-5 text-fg"
              >
                Tax Intelligence, <em className="text-accent-400">Reimagined.</em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.85, ease: EASE_PREMIUM }}
                className="t-lead mt-6 max-w-[30rem]"
              >
                A unified platform for intelligent tax planning, analysis and decision support.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: EASE_PREMIUM }}
                className="mt-9 flex flex-col gap-3 sm:flex-row"
              >
                <Button size="lg" withArrow onClick={() => scrollToId('scene-1', 0)}>
                  Explore Tax Tools
                </Button>
                <Button size="lg" variant="secondary" to={authed ? '/app' : '/login'}>
                  {authed ? 'Open Dashboard' : 'Enter Platform'}
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 1 — The tools, separated */}
        <section id="scene-1" data-scene={1} aria-labelledby="story-tools" className="relative min-h-[125svh]">
          <div className="container-page flex min-h-[125svh] flex-col items-center pt-[16svh] text-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-10% 0px -30% 0px' }}
              transition={{ duration: 0.8, ease: EASE_PREMIUM }}
              className="max-w-2xl"
            >
              <Eyebrow>Intelligent tax tools</Eyebrow>
              <h2 id="story-tools" className="t-h2 mt-4 text-fg">
                One workspace, separated into five instruments.
              </h2>
              <p className="t-lead mt-5">Each tool has its own object, its own workflow — and they all run on the same federal tax engine.</p>
            </motion.div>
            <ul className="pointer-events-auto mt-auto flex flex-wrap items-center justify-center gap-2 pb-[9svh]">
              {TOOLS.map((t) => (
                <li key={t.id}>
                  <Link
                    to={t.path}
                    className="glass inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold text-fg-muted transition-[transform,box-shadow] duration-200 ease-premium hover:-translate-y-0.5 hover:text-fg hover:shadow-[0_12px_24px_-14px_rgba(15,23,42,0.35)]"
                  >
                    <t.icon className="size-4 text-accent-400" aria-hidden />
                    {t.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2–6 — Each tool */}
        {TOOLS.map((tool, i) => (
          <ToolScene key={tool.id} tool={tool} index={i} side={i % 2 === 0 ? 'left' : 'right'} />
        ))}

        {/* 7 — Reconnected */}
        <section id="scene-7" data-scene={7} aria-labelledby="story-cta" className="relative min-h-svh">
          <div className="container-page flex min-h-svh flex-col items-center justify-end pb-[11svh] text-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-20% 0px -5% 0px' }}
              transition={{ duration: 0.8, ease: EASE_PREMIUM }}
              className="glass-panel w-full max-w-2xl rounded-[1.75rem] p-7 sm:rounded-[2rem] sm:p-10"
            >
              <Eyebrow>Everything, reconnected</Eyebrow>
              <h2 id="story-cta" className="t-h2 mt-4 text-fg">
                Five tools. One engine. <em className="text-accent-400">One Tapreco.</em>
              </h2>
              <p className="t-lead mx-auto mt-4 max-w-lg">Sign in once and every tool, client and report is ready.</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" withArrow to={authed ? '/app' : '/signup'}>
                  {authed ? 'Open Dashboard' : 'Get Started'}
                </Button>
                <Button size="lg" variant="secondary" to="/tools">
                  Explore Tax Tools
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <StoryRail labels={labels} />
    </div>
  )
}

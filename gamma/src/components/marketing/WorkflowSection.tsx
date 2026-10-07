import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { FileText, FileInput, Lightbulb, MousePointerClick, Sparkles, UserRound, type LucideIcon } from 'lucide-react'
import { useRef } from 'react'
import { Highlight, SectionHeading } from '@/components/ui/SectionHeading'
import { usePreferences } from '@/context/PreferencesContext'
import { cn } from '@/lib/cn'

const STEPS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: UserRound, title: 'Client', text: 'Start from a client record with entity type and filing status.' },
  { icon: MousePointerClick, title: 'Select Tax Tool', text: 'Choose the analysis the engagement calls for.' },
  { icon: FileInput, title: 'Enter or Import Tax Data', text: 'Key figures straight from 1099s, K-1s and prior returns.' },
  { icon: Sparkles, title: 'Tapreco Analysis', text: 'The shared federal engine computes every line in real time.' },
  { icon: Lightbulb, title: 'Tax Insights', text: 'Savings, risk and deadlines surface with clear explanations.' },
  { icon: FileText, title: 'Professional Report', text: 'Save to the client and print a polished report.' },
]

function Step({ index, progress, step, vertical }: { index: number; progress: MotionValue<number>; step: (typeof STEPS)[number]; vertical: boolean }) {
  const start = index / STEPS.length
  const opacity = useTransform(progress, [start - 0.05, start + 0.08], [0.35, 1])
  const y = useTransform(progress, [start - 0.05, start + 0.08], [12, 0])
  const glow = useTransform(progress, [start - 0.02, start + 0.06], [0, 1])
  return (
    <motion.li style={{ opacity, y }} className={cn('relative', vertical ? 'pl-16' : 'flex flex-col items-center text-center')}>
      <span
        className={cn(
          'relative z-10 grid size-12 place-items-center rounded-2xl border border-accent-500/30 bg-ink-850 text-accent-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          vertical && 'absolute left-0 top-0',
        )}
      >
        <motion.span style={{ opacity: glow }} className="absolute inset-0 rounded-2xl bg-accent-500/15" />
        <step.icon className="relative size-5" aria-hidden />
      </span>
      <span className={cn('tabular text-[11px] font-semibold tracking-[0.16em] text-accent-400/90', vertical ? 'block' : 'mt-5')}>
        STEP {String(index + 1).padStart(2, '0')}
      </span>
      <h3 className="mt-1.5 font-display text-[16px] font-semibold text-fg">{step.title}</h3>
      <p className={cn('mt-1.5 text-[13px] leading-relaxed text-fg-subtle', !vertical && 'max-w-[11rem]')}>{step.text}</p>
    </motion.li>
  )
}

export function WorkflowSection({ id }: { id?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { reduceMotion } = usePreferences()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 55%'] })
  const progress = useTransform(scrollYProgress, (v) => (reduceMotion ? 1 : v))

  return (
    <section id={id} aria-labelledby="workflow-title" className="relative overflow-hidden py-24 sm:py-32">
      <div className="container-page relative">
        <SectionHeading
          eyebrow="How it works"
          title={
            <span id="workflow-title">
              From client data to <Highlight>professional report</Highlight>
            </span>
          }
          description="A consistent six-step workflow your whole team follows — for every client, in every tool."
        />

        <div ref={ref} className="relative mt-20">
          {/* Desktop: horizontal rail */}
          <div className="hidden lg:block">
            <div aria-hidden className="absolute left-[8.33%] right-[8.33%] top-6 h-px bg-line/[0.08]" />
            <motion.div
              aria-hidden
              style={{ scaleX: progress }}
              className="absolute left-[8.33%] right-[8.33%] top-6 h-px origin-left bg-gradient-to-r from-accent-700 via-accent-400 to-accent-300"
            />
            <ol className="relative grid grid-cols-6 gap-4">
              {STEPS.map((s, i) => (
                <Step key={s.title} index={i} progress={progress} step={s} vertical={false} />
              ))}
            </ol>
          </div>

          {/* Mobile / tablet: vertical rail */}
          <div className="relative lg:hidden">
            <div aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-line/[0.08]" />
            <motion.div
              aria-hidden
              style={{ scaleY: progress }}
              className="absolute bottom-6 left-6 top-6 w-px origin-top bg-gradient-to-b from-accent-700 via-accent-400 to-accent-300"
            />
            <ol className="relative flex flex-col gap-10">
              {STEPS.map((s, i) => (
                <Step key={s.title} index={i} progress={progress} step={s} vertical />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}

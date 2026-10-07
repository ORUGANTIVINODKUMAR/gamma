import type { CSSProperties } from 'react'
import { Check, Flag } from 'lucide-react'
import { useStep } from '../hooks/useStep'
import '../styles/scenes.css'

/**
 * Small animated walk-throughs of each Tapreco tool. They are driven by a step counter
 * (one step every ~0.7s) and styled with CSS transitions, so they stay light and
 * replay from the start whenever `active` turns on. `loop` makes them repeat forever.
 */
interface SceneProps {
  active: boolean
  loop?: boolean
}

const cls = (...c: (string | false)[]) => c.filter(Boolean).join(' ')

/* ---------- Tax Planner: checklist completes, opportunity appears ---------- */
const PLAN_ITEMS = ['Client review', 'Tax scenarios', 'Deductions review', 'Planning opportunities']

export function PlannerScene({ active, loop }: SceneProps) {
  const step = useStep(active, loop ? 10 : undefined)
  const done = Math.min(step, PLAN_ITEMS.length + 1)
  return (
    <div className="sc">
      <div className="sc__card sc__card--lg">
        <div className="sc__head">
          <b>Tax Planner</b>
          <span>Tax year 2026</span>
        </div>
        <ul className="sc__list">
          {PLAN_ITEMS.map((t, i) => (
            <li key={t} className={cls(done > i + 1 && 'is-done', done === i + 1 && 'is-now')}>
              <span className="sc__check">
                <Check size={14} strokeWidth={3} />
              </span>
              {t}
              <span className="sc__line" />
            </li>
          ))}
        </ul>
        <div className="sc__progress">
          <span style={{ width: `${Math.min(done / (PLAN_ITEMS.length + 1), 1) * 100}%` }} />
        </div>
      </div>
      <div className={cls('sc__pop', done >= PLAN_ITEMS.length + 1 && 'is-on')}>
        <Flag size={15} /> Planning opportunity found
      </div>
    </div>
  )
}

/* ---------- Estimated Tax: calculator keys + quarterly due dates ---------- */
const KEY_SEQ = [4, 9, 6, 13, 2, 10, 7, 14]
const QUARTERS = [
  ['Q1', 'Apr 15'],
  ['Q2', 'Jun 15'],
  ['Q3', 'Sep 15'],
  ['Q4', 'Jan 15'],
]

export function EstimatedScene({ active, loop }: SceneProps) {
  const step = useStep(active, loop ? 12 : undefined, 600)
  const pressed = step > 0 && step <= KEY_SEQ.length ? KEY_SEQ[step - 1] : -1
  return (
    <div className="sc sc--row">
      <div className="sc__card sc__calc">
        <div className="sc__display">
          <span style={{ width: `${Math.min(step, 8) * 11}%` }} />
        </div>
        <div className="sc__keys">
          {Array.from({ length: 16 }, (_, i) => (
            <span key={i} className={cls('sc__key', i === pressed && 'is-pressed', i === 15 && 'sc__key--eq')} />
          ))}
        </div>
      </div>
      <div className="sc__card sc__quarters">
        <div className="sc__head">
          <b>Estimated Tax</b>
          <span>Due dates</span>
        </div>
        <ul>
          {QUARTERS.map(([q, d], i) => (
            <li key={q} className={cls(step > i + 3 && 'is-on')}>
              <strong>{q}</strong>
              <span>{d}</span>
              <Check size={15} strokeWidth={3} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* ---------- Audit Risk: scan beam reviews return lines ---------- */
const AUDIT_ROWS = ['Schedule C income', 'Home office deduction', 'Charitable gifts', 'Cash receipts']
const FLAGGED = 1

export function AuditScene({ active, loop }: SceneProps) {
  const step = useStep(active, loop ? 10 : undefined)
  const scanned = Math.min(step, AUDIT_ROWS.length + 1)
  return (
    <div className="sc">
      <div className="sc__card sc__card--lg sc__scan">
        <div className="sc__head">
          <b>Audit Risk Analyzer</b>
          <span>Return review</span>
        </div>
        <ul className="sc__list sc__list--audit">
          {AUDIT_ROWS.map((t, i) => {
            const reviewed = scanned > i + 1
            return (
              <li key={t} className={cls(reviewed && 'is-done', reviewed && i === FLAGGED && 'is-flag')}>
                <span className="sc__check">
                  {i === FLAGGED ? <Flag size={13} strokeWidth={2.5} /> : <Check size={14} strokeWidth={3} />}
                </span>
                {t}
                <em>{reviewed ? (i === FLAGGED ? 'Needs attention' : 'Reviewed') : 'Pending'}</em>
              </li>
            )
          })}
        </ul>
        <span
          className="sc__beam"
          style={{ top: `${64 + Math.min(scanned, AUDIT_ROWS.length) * 17.5}%`, opacity: scanned > AUDIT_ROWS.length ? 0 : 1 }}
        />
      </div>
    </div>
  )
}

/* ---------- Entity Comparison: Schedule C vs S Corporation ---------- */
export function EntityScene({ active }: SceneProps) {
  const step = useStep(active, undefined, 1400)
  const sCorp = step % 2 === 1
  return (
    <div className="sc">
      <div className="sc__toggle" aria-hidden="true">
        <span className={cls(!sCorp && 'is-on')}>Schedule C</span>
        <span className={cls(sCorp && 'is-on')}>S Corporation</span>
        <i style={{ transform: sCorp ? 'translateX(100%)' : 'none' }} />
      </div>
      <div className="sc__pair">
        {[
          ['Schedule C', 'Sole proprietorship', !sCorp],
          ['S Corporation', 'Entity election', sCorp],
        ].map(([title, sub, lit]) => (
          <div key={title as string} className={cls('sc__card sc__entity', lit && 'is-lit')}>
            <b>{title as string}</b>
            <small>{sub as string}</small>
            <span className="sc__line" />
            <span className="sc__line sc__line--s" />
            <span className="sc__line sc__line--xs" />
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- Mutual Fund: statement rows get tax tags ---------- */
const FUND_ROWS = [
  ['Dividends', 'Qualified'],
  ['Distributions', 'Ordinary'],
  ['Capital gains', 'Long-term'],
]

export function FundScene({ active, loop }: SceneProps) {
  const step = useStep(active, loop ? 9 : undefined)
  return (
    <div className="sc">
      <div className="sc__card sc__card--lg">
        <div className="sc__head">
          <b>Mutual Fund Tax</b>
          <span>Fund statement</span>
        </div>
        <ul className="sc__fund">
          {FUND_ROWS.map(([label, tag], i) => (
            <li key={label} className={cls(step > i && 'is-in')} style={{ ['--i' as string]: i } as CSSProperties}>
              <span>{label}</span>
              <span className="sc__line" />
              <em className={cls(step > i + 1 && 'is-tag')}>{tag}</em>
            </li>
          ))}
        </ul>
        <div className={cls('sc__ready', step > FUND_ROWS.length + 1 && 'is-on')}>
          <Check size={15} strokeWidth={3} /> Tax information ready
        </div>
      </div>
    </div>
  )
}

export const SCENES = [
  { key: 'planner', tab: 'Tax Planner', route: '/tools/tax-planner', Scene: PlannerScene, tint: '#eef5fb' },
  { key: 'estimated', tab: 'Estimated Tax', route: '/tools/estimated-tax-calculator', Scene: EstimatedScene, tint: '#f1f6ee' },
  { key: 'audit', tab: 'Audit Risk', route: '/tools/audit-risk-analyzer', Scene: AuditScene, tint: '#fbf6ea' },
  { key: 'entity', tab: 'Entity Comparison', route: '/tools/entity-comparison', Scene: EntityScene, tint: '#eef0fa' },
  { key: 'funds', tab: 'Mutual Fund', route: '/tools/mutual-fund-tax-calculator', Scene: FundScene, tint: '#eaf6f4' },
]

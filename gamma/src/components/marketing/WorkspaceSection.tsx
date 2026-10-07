import { lazy, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DocumentPoster, SceneBoundary } from '@/components/three/core/SceneBoundary'
import type { StationId } from '@/components/three/scenes/DeskScene'
import { Button } from '@/components/ui/Button'
import { Highlight, SectionHeading } from '@/components/ui/SectionHeading'
import { useAuth } from '@/context/AuthContext'

const DeskScene = lazy(() => import('@/components/three/scenes/DeskScene'))

const STATION_COPY: Record<StationId, { title: string; text: string }> = {
  clients: { title: 'Clients', text: 'Every client file, with their entities, filing status and saved analyses.' },
  tools: { title: 'Tax Tools', text: 'Five instruments on one federal engine, within reach.' },
  analyses: { title: 'Recent analyses', text: 'The latest sheets from every tool, ready to reopen.' },
  reports: { title: 'Reports', text: 'Organized folders of print-ready client reports.' },
  deadlines: { title: 'Deadlines', text: 'Quarterly due dates and filing deadlines, in order.' },
}

/** The signed-in desk, previewed: the same five stations the dashboard is built around. */
export function WorkspaceSection({ id }: { id?: string }) {
  const [hovered, setHovered] = useState<StationId | null>(null)
  const navigate = useNavigate()
  const { status } = useAuth()
  const authed = status === 'authenticated'
  const copy = hovered ? STATION_COPY[hovered] : null

  return (
    <section id={id} aria-labelledby="workspace-title" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="The workspace"
          title={
            <span id="workspace-title">
              Your practice, <Highlight>laid out on one desk</Highlight>
            </span>
          }
          description="Not a wall of charts: clients, tools, analyses, reports and deadlines, each where you expect it, each a number you can read at a glance."
        />
        <div className="studio-bg relative mt-14 overflow-hidden rounded-[2rem] border border-white/80 shadow-[0_40px_90px_-56px_rgba(15,23,42,0.4)]">
          <SceneBoundary className="relative h-[300px] sm:h-[380px]" fallback={<DocumentPoster />}>
            <DeskScene hovered={hovered} onHover={setHovered} onSelect={(s) => navigate(authed ? '/app' : `/login?from=${s}`)} className="absolute inset-0" />
          </SceneBoundary>
          <div className="min-h-[5.5rem] border-t border-line/[0.07] px-6 py-5 text-center" aria-live="polite">
            {copy ? (
              <>
                <p className="font-serif text-[1.6rem] leading-none text-fg">{copy.title}</p>
                <p className="mt-2 text-[14px] text-fg-subtle">{copy.text}</p>
              </>
            ) : (
              <p className="text-[14px] text-fg-faint">Hover a station to see what lives there.</p>
            )}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Button to={authed ? '/app' : '/login'} withArrow magnetic>
            {authed ? 'Open your desk' : 'Enter Platform'}
          </Button>
        </div>
      </div>
    </section>
  )
}

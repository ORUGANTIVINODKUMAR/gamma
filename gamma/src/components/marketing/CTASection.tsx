import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/ui/Reveal'
import { useAuth } from '@/context/AuthContext'

export function CTASection({
  title = 'Bring every tax decision into one platform.',
  text = 'Start with the tools your clients need this season — and keep every analysis, report and deadline in one secure workspace.',
}: {
  title?: string
  text?: string
}) {
  const { status } = useAuth()
  return (
    <section aria-labelledby="cta-title" className="relative py-20 sm:py-28">
      <div className="container-page">
        <Reveal y={32}>
          <div className="relative isolate overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(160deg,#ffffff,#f3f1ec)] px-6 py-16 text-center shadow-[0_1px_0_#fff_inset,0_40px_80px_-50px_rgba(15,23,42,0.35)] sm:px-16 sm:py-24">
            {/* a pearl floor with a sapphire seam: depth without decoration */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-[radial-gradient(70%_100%_at_50%_100%,rgba(201,209,219,0.5),transparent)]" />
            <div aria-hidden className="absolute left-1/2 top-0 h-px w-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent via-accent-400 to-transparent" />

            <h2 id="cta-title" className="t-h2 mx-auto max-w-3xl text-fg">
              {title}
            </h2>
            <p className="t-lead mx-auto mt-5 max-w-xl">{text}</p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              {status === 'authenticated' ? (
                <Button to="/app" size="lg" withArrow magnetic>
                  Open Dashboard
                </Button>
              ) : (
                <Button to="/signup" size="lg" withArrow magnetic>
                  Get Started
                </Button>
              )}
              <Button to="/contact" size="lg" variant="secondary">
                Talk to our team
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

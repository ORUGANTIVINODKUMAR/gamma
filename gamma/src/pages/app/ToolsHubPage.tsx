import { ToolGallery } from '@/components/marketing/ToolGallery'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** In-app tool gallery — reached from the sidebar and breadcrumbs. */
export default function ToolsHubPage() {
  useDocumentTitle('Tax Tools')
  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="eyebrow">Tax Tools</p>
        <h1 className="t-h2 mt-2 text-fg">Choose an instrument</h1>
        <p className="mt-2 max-w-2xl text-[14.5px] text-fg-subtle">
          Every tool runs on the same federal engine, saves to the same client records and prints in the same report format.
        </p>
      </header>
      <ToolGallery />
    </div>
  )
}

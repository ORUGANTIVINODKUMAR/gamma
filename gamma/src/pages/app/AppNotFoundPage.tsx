import { ClipboardList, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/primitives'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function AppNotFoundPage() {
  useDocumentTitle('Page not found')
  return (
    <div className="surface-card rounded-panel">
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        className="py-20"
        icon={<ClipboardList className="size-5" />}
        title="This page doesn’t exist"
        description="The link may be outdated. Head back to your dashboard or pick a tool."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button to="/app" size="sm" icon={<LayoutDashboard className="size-4" aria-hidden />}>
              Dashboard
            </Button>
            <Button to="/app/tools" size="sm" variant="secondary">
              Tax Tools
            </Button>
          </div>
        }
      />
    </div>
  )
}

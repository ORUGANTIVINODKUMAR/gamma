import { JourneyStory } from '@/components/marketing/JourneyStory'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** Landing: one continuous scroll-driven 3D story (see JourneyStory). */
export default function HomePage() {
  useDocumentTitle('')
  return <JourneyStory />
}

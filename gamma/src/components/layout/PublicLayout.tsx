import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { AnimatedOutlet } from './PageTransition'

/** Marketing shell: fixed navbar, transitioning page content, footer. */
export function PublicLayout() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-x-clip">
      <Navbar />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <AnimatedOutlet />
      </main>
      <Footer />
    </div>
  )
}

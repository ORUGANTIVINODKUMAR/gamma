import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="landing">
      <Navbar />
      <main className="page">{children}</main>
      <Footer />
    </div>
  )
}

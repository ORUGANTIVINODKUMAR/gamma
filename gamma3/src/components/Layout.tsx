import type { ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

/** Shared page frame: navigation, page content, footer. */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}

import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Tools from '../components/Tools'
import CTA from '../components/CTA'
import Footer from '../components/Footer'

export default function LandingPage() {
  return (
    <div className="landing">
      <Navbar />
      <main>
        <Hero />
        <Tools />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

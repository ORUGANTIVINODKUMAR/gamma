import Layout from '../components/Layout'
import Hero from '../components/Hero'
import ToolsSection from '../components/ToolsSection'
import TaxPlannerSection from '../components/TaxPlannerSection'
import CTA from '../components/CTA'

export default function Landing() {
  return (
    <Layout>
      <Hero />
      <ToolsSection />
      <TaxPlannerSection />
      <CTA />
    </Layout>
  )
}

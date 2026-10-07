import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import ToolsSection from '../components/ToolsSection'
import TaxPlannerSection from '../components/TaxPlannerSection'
import PlatformSection from '../components/PlatformSection'
import WorkflowSection from '../components/WorkflowSection'
import BenefitsSection from '../components/BenefitsSection'
import CTA from '../components/CTA'

export function PlatformPage() {
  return (
    <Layout>
      <PageHeader
        label="The Platform"
        title="One platform for your tax workflow"
        lead="Instead of switching between disconnected tools, Tapreco provides access to specialized tax analysis tools from one platform."
      />
      <PlatformSection bare />
      <BenefitsSection />
      <CTA />
    </Layout>
  )
}

export function ToolsPage() {
  return (
    <Layout>
      <PageHeader
        label="Tax Tools"
        title="Tax tools built for better decisions"
        lead="Access specialized tools for planning, calculations, risk review and entity analysis from one professional platform."
      />
      <ToolsSection bare />
      <TaxPlannerSection />
      <CTA />
    </Layout>
  )
}

export function SolutionsPage() {
  return (
    <Layout>
      <PageHeader
        label="Solutions"
        title="A simpler tax analysis workflow"
        lead="From selecting a client to reviewing results, Tapreco keeps every step in one consistent, professional workspace."
      />
      <WorkflowSection bare />
      <PlatformSection />
      <CTA />
    </Layout>
  )
}

export function AboutPage() {
  return (
    <Layout>
      <PageHeader
        label="About Tapreco"
        title="Professional tax intelligence"
        lead="Tapreco is a tax technology platform that brings tax planning, calculations, risk analysis and entity comparison into one place for CPAs, tax professionals and accounting firms."
      />
      <BenefitsSection bare />
      <CTA />
    </Layout>
  )
}

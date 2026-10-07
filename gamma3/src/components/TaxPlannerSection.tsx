import { Check } from 'lucide-react'
import Button from './Button'
import Reveal from './Reveal'
import { PlannerScene } from './ToolScenes'

const FEATURES = ['Tax Scenario Planning', 'Client-Level Analysis', 'Planning Opportunities', 'Professional Tax Workflow']

export default function TaxPlannerSection() {
  return (
    <section className="section" id="planner" aria-labelledby="planner-title">
      <div className="container">
        <Reveal className="planner">
          <div>
            <p className="label">Flagship Tool</p>
            <h2 id="planner-title">Plan with clarity before tax season begins.</h2>
            <p className="section__lead">
              Tapreco Tax Planner gives tax professionals a structured workspace to review client information, evaluate tax
              scenarios and identify planning opportunities.
            </p>
            <ul className="checks">
              {FEATURES.map((f) => (
                <li key={f}>
                  <Check size={18} aria-hidden="true" />
                  {f}
                </li>
              ))}
            </ul>
            <Button to="/tools/tax-planner">Explore Tax Planner</Button>
          </div>

          <div className="planner__demo" aria-hidden="true">
            <PlannerScene active loop />
          </div>
        </Reveal>
      </div>
    </section>
  )
}

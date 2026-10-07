import Button from './Button'
import Reveal from './Reveal'

export default function CTA() {
  return (
    <section className="cta" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="cta__inner">
          <h2 id="cta-title">A better way to work with tax planning tools.</h2>
          <p className="section__lead">
            Bring planning, calculations and tax analysis into one professional platform with Tapreco.
          </p>
          <div className="cta__actions">
            <Button to="/signup">Get Started</Button>
            <Button to="/tools" variant="secondary">
              Explore Tools
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

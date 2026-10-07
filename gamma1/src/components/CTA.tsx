import { Reveal } from './Reveal'
import MagneticButton from './MagneticButton'
import { ROUTES } from '../lib/routes'

export default function CTA() {
  return (
    <section className="section cta">
      <div className="container">
        <Reveal className="cta-box">
          <i className="cta-aurora" aria-hidden="true" />
          <h2 className="h2">
            Ready for a smarter way to <span className="grad">handle tax?</span>
          </h2>
          <p className="sec-lead">Join professionals who plan, calculate and advise from one unified platform.</p>
          <div className="cta-actions">
            <MagneticButton to={ROUTES.signUp}>Get started</MagneticButton>
            <MagneticButton to={ROUTES.signIn} variant="ghost" arrow={false}>
              Sign in
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

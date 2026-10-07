import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'
import { SCENES } from './ToolScenes'

const INTERVAL = 7500

export default function Hero() {
  const [index, setIndex] = useState(0)

  // move to the next tool scene automatically; restarts whenever a tab is clicked
  useEffect(() => {
    const id = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % SCENES.length)
    }, INTERVAL)
    return () => window.clearInterval(id)
  }, [index])

  const current = SCENES[index]

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__bgs" aria-hidden="true">
        {SCENES.map((s, i) => (
          <div
            key={s.key}
            className={`hero__bg${i === index ? ' is-active' : ''}`}
            style={{ background: `linear-gradient(135deg, #fff 0%, ${s.tint} 100%)` }}
          />
        ))}
      </div>

      <div className="container hero__grid">
        <div className="hero__copy fade-in">
          <p className="label">Tax Intelligence Platform</p>
          <h1 id="hero-title" className="hero__title">
            Smarter Tax Planning.
            <br />
            One Professional Platform.
          </h1>
          <p className="hero__lead">
            Tapreco brings tax planning, calculations, risk analysis and entity comparison into one streamlined platform for
            modern tax professionals.
          </p>
          <div className="hero__actions">
            <Button to="/tools">Explore Tax Tools</Button>
            <Button to="/signup" variant="secondary">
              Get Started
            </Button>
          </div>
          <p className="hero__trust">Built for CPAs, tax professionals and accounting firms.</p>
        </div>

        <div className="hero__stage" aria-hidden="true">
          {SCENES.map(({ key, Scene }, i) => (
            <div key={key} className={`hero__scene${i === index ? ' is-active' : ''}`}>
              <Scene active={i === index} />
            </div>
          ))}
        </div>
      </div>

      <div className="container hero__tabs-row">
        <div className="hero__tabs" role="group" aria-label="Tapreco tools">
          {SCENES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={`hero__tab${i === index ? ' is-active' : ''}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {s.tab}
            </button>
          ))}
        </div>
        <Link to={current.route} className="text-link hero__open">
          Open {current.tab} &rarr;
        </Link>
      </div>
    </section>
  )
}

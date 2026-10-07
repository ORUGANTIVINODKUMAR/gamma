import { useState } from 'react'
import type { FormEvent } from 'react'
import { Reveal } from '../components/Reveal'
import PageLayout from '../components/PageLayout'
import Tools from '../components/Tools'
import Process from '../components/Process'
import Why from '../components/Why'
import CTA from '../components/CTA'

export const ToolsPage = () => (
  <PageLayout>
    <Tools />
    <CTA />
  </PageLayout>
)

export const ProcessPage = () => (
  <PageLayout>
    <Process />
    <CTA />
  </PageLayout>
)

export const WhyPage = () => (
  <PageLayout>
    <Why />
    <CTA />
  </PageLayout>
)

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }
  return (
    <PageLayout>
      <section className="section">
        <div className="container contact-grid">
          <Reveal className="sec-head">
            <span className="pill">
              <span className="pulse" /> Contact
            </span>
            <h1 className="h2">
              Let&apos;s talk <span className="grad">tax.</span>
            </h1>
            <p className="sec-lead">Questions about Tapreco, the tools or getting your team started? Send us a note.</p>
            <div className="contact-info">
              <div>
                <b>Support</b>
                <span>We reply within one business day.</span>
              </div>
              <div>
                <b>Sales</b>
                <span>Talk to us about plans for your firm.</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <form className="form" onSubmit={submit}>
              <label>
                Name
                <input required name="name" autoComplete="name" />
              </label>
              <label>
                Email
                <input required type="email" name="email" autoComplete="email" />
              </label>
              <label>
                Message
                <textarea required name="message" />
              </label>
              <button className="btn btn-primary" type="submit">
                Send message
              </button>
              {sent && <p className="form-ok">Thanks! This is a placeholder form. Connect it to your backend to receive messages.</p>}
            </form>
          </Reveal>
        </div>
      </section>
    </PageLayout>
  )
}

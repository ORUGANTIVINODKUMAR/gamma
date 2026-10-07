import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { Heading, Reveal } from './ui'
const stages = [['Client', 'Start with the individual. Bring the relevant details into focus.'], ['Analyze', 'Use the right tools to understand the tax situation.'], ['Plan', 'Explore scenarios and consider the opportunities ahead.'], ['Review', 'Look closer. Test assumptions. Refine your approach.'], ['Decide', 'Turn a clearer perspective into an informed next step.']]

function Stage({ name, description, index }: { name: string; description: string; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'start 35%'] })
  const color = useTransform(scrollYProgress, [0, 1], ['#748198', '#243b60'])
  const y = useTransform(scrollYProgress, [0, 1], [14 + index * 3, 0])
  return <Reveal delay={index * 0.07}><motion.div ref={ref} className="workflow-stage" style={reduced ? undefined : { y }}><motion.span className="workflow-number" style={reduced ? undefined : { color }}>0{index + 1}</motion.span><h3>{name}</h3><p>{description}</p></motion.div></Reveal>
}
export default function WorkflowSection() {
  return <section id="solutions" className="section workflow-section" aria-labelledby="workflow-title"><div className="container"><Reveal><div className="section-kicker"><span className="eyebrow">BUILT AROUND YOUR WORKFLOW</span><span className="section-number">02 / THE PROCESS</span></div></Reveal><div id="workflow-title"><Heading>From client data<br /><span className="text-muted">to better tax decisions.</span></Heading></div><div className="workflow-grid">{stages.map(([name, description], index) => <Stage key={name} name={name} description={description} index={index} />)}</div></div></section>
}

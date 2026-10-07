import { Layers, Users, Zap, ListChecks, FileCheck2, LockKeyhole } from 'lucide-react'
import { Heading, Reveal } from './ui'
const benefits = [
  { icon: Layers, name: 'Unified tax tools', description: 'Five focused tools. One familiar place to work.' },
  { icon: Users, name: 'Client-centered analysis', description: 'Keep the full client situation at the heart of every decision.' },
  { icon: Zap, name: 'Focused tax planning', description: 'More time considering possibilities. Less time switching tools.' },
  { icon: ListChecks, name: 'Consistent workflows', description: 'A considered structure for repeatable professional work.' },
  { icon: FileCheck2, name: 'Clear review & reporting', description: 'Organize the insights that support your professional review.' },
  { icon: LockKeyhole, name: 'Firm access, considered', description: 'Designed with a dedicated professional team workspace in mind.' },
]
export default function BenefitsSection() {
  return <section id="about" className="section benefits-section" aria-labelledby="benefits-title"><div className="container benefits-grid"><div className="benefits-intro"><Reveal><span className="eyebrow">PROFESSIONAL BY DESIGN</span></Reveal><div id="benefits-title"><Heading>Thoughtful tools.<br /><span className="text-muted">For people who<br />think ahead.</span></Heading></div><Reveal><p>Built for the precision, perspective, and professional judgment your work demands.</p><span className="benefits-signature"><span className="tiny-square" /> THE TAPRECO APPROACH</span></Reveal></div><div className="benefits-list">{benefits.map(({ icon: Icon, name, description }, index) => <Reveal key={name} delay={index * 0.05}><article className="benefit"><Icon size={25} strokeWidth={1.5} /><div><h3>{name}</h3><p>{description}</p></div></article></Reveal>)}</div></div></section>
}

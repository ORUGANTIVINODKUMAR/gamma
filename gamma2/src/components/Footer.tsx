import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Logo } from './ui'
import { tools, toolPath } from '../data/tools'

const columns = [
  { title: 'Platform', links: [['Overview', '/#platform'], ['Our workflow', '/#solutions'], ['Get started', '/get-started']] },
  { title: 'Tax Tools', links: tools.map(tool => [tool.name, toolPath(tool.slug)]) },
  { title: 'Company', links: [['About Tapreco', '/#about'], ['Our approach', '/#about']] },
  { title: 'Resources', links: [['Explore tools', '/#tools'], ['Planning workspace', '/tools/tax-planner']] },
  { title: 'Legal', links: [['Privacy policy', '/legal/privacy'], ['Terms of use', '/legal/terms'], ['Security', '/legal/security']] },
]

export default function Footer() {
  return <footer className="footer"><div className="container"><div className="footer-top"><div className="footer-brand"><Logo /><p>Professional tax intelligence.<br />Thoughtfully connected.</p><Link to="/get-started" className="text-link">A better perspective starts here <ArrowUpRight size={15} /></Link></div><div className="footer-columns">{columns.map(column => <div key={column.title}><h3>{column.title}</h3>{column.links.map(([label, path]) => <Link to={path} key={label}>{label}</Link>)}</div>)}</div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Tapreco. All rights reserved.</span><span>DESIGNED FOR BETTER DECISIONS.</span><div><Link to="/legal/privacy">Privacy</Link><Link to="/legal/terms">Terms</Link><Link to="/legal/security">Security</Link></div></div></div></footer>
}

interface Props {
  label: string
  title: string
  lead: string
}

/** Title block at the top of the inner pages (Platform, Tax Tools, Solutions, About). */
export default function PageHeader({ label, title, lead }: Props) {
  return (
    <section className="page-header">
      <div className="container fade-in">
        <p className="label">{label}</p>
        <h1>{title}</h1>
        <p className="section__lead">{lead}</p>
      </div>
    </section>
  )
}

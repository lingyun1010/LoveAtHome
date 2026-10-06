interface Props { number: string; title: string; description: string; items: string[] }
export function ServiceCard({ number, title, description, items }: Props) {
  return <article className="service-card"><span className="card-number">{number}</span><h3>{title}</h3><p>{description}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}


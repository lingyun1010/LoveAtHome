interface Props { number: string; title: string; description: string; items: string[]; image: string; imageAlt: string }
export function ServiceCard({ number, title, description, items, image, imageAlt }: Props) {
  return <article className="service-card"><img className="service-image" src={image} alt={imageAlt} loading="lazy" /><span className="card-number">{number}</span><h3>{title}</h3><p>{description}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}

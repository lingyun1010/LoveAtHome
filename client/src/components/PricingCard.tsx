interface Props { title: string; price: string; note: string; details: string[] }
export function PricingCard({ title, price, note, details }: Props) {
  return <article className="pricing-card"><h3>{title}</h3><strong>{price}</strong><p>{note}</p><ul>{details.map(item => <li key={item}>{item}</li>)}</ul><p className="price-caveat">Indicative starting rate; ask our team to confirm service availability and the applicable quote.</p></article>;
}

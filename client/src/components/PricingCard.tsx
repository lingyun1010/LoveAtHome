interface Props { title: string; price: string; note: string }
export function PricingCard({ title, price, note }: Props) {
  return <article className="pricing-card"><span className="placeholder-label">PLACEHOLDER</span><h3>{title}</h3><strong>{price}</strong><p>{note}</p></article>;
}


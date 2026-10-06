interface Props { eyebrow: string; title: string; intro?: string; align?: "left" | "center" }

export function SectionHeading({ eyebrow, title, intro, align = "left" }: Props) {
  return <div className={`section-heading section-heading--${align}`}>
    <p className="eyebrow">{eyebrow}</p>
    <h2>{title}</h2>
    {intro && <p className="section-intro">{intro}</p>}
  </div>;
}


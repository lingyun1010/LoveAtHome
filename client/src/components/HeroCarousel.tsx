import { useEffect, useState } from "react";
import type { Copy } from "../i18n";

// Homepage care photos, served from Vite public assets.
const slides = [
  `${import.meta.env.BASE_URL}images/hero/care-at-home-01.jpg?v=20261023-asian-care`,
  `${import.meta.env.BASE_URL}images/hero/clinical-care-02.jpg?v=20261023-asian-care`,
  `${import.meta.env.BASE_URL}images/hero/community-outing-03.jpg?v=20261023-asian-care`,
  `${import.meta.env.BASE_URL}images/hero/home-living-04.jpg?v=20261023-asian-care`,
];

export function HeroCarousel({ t }: { t: Copy["carousel"] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const timer = window.setInterval(() => setActive(index => (index + 1) % slides.length), 5500);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion]);

  return <div className="hero-visual" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    <div className="visual-frame hero-slides" role="group" aria-label={t.groupLabel}>
      {slides.map((src, index) => <img key={src} className={index === active ? "hero-slide hero-slide--active" : "hero-slide"} src={src} alt={index === active ? t.slideAlts[index] : ""} aria-hidden={index !== active} loading={index === 0 ? "eager" : "lazy"} />)}
    </div>
    <div className="hero-note"><span>{t.noteLabel}</span><strong>{t.noteText}</strong></div>
    <div className="hero-carousel-controls" aria-label={t.controlsLabel}>
      {slides.map((src, index) => <button key={src} type="button" className={index === active ? "hero-carousel-dot hero-carousel-dot--active" : "hero-carousel-dot"} aria-label={t.showSlide(index + 1, slides.length)} aria-pressed={active === index} onClick={() => setActive(index)} />)}
    </div>
  </div>;
}

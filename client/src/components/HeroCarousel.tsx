import { useEffect, useState } from "react";

// Client-supplied photos, served from Vite public assets.
const slides = [
  { src: `${import.meta.env.BASE_URL}images/hero/care-at-home-01.jpg`, alt: "Carer supporting a client at home" },
  { src: `${import.meta.env.BASE_URL}images/hero/clinical-care-02.jpg`, alt: "Healthcare professional, illustrative image" },
  { src: `${import.meta.env.BASE_URL}images/hero/community-outing-03.jpg`, alt: "People enjoying time together in the community" },
  { src: `${import.meta.env.BASE_URL}images/hero/home-living-04.jpg`, alt: "A welcoming home kitchen, illustrative image" },
];

export function HeroCarousel() {
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
    <div className="visual-frame hero-slides" role="group" aria-label="Home care photographs">
      {slides.map((slide, index) => <img key={slide.src} className={index === active ? "hero-slide hero-slide--active" : "hero-slide"} src={slide.src} alt={index === active ? slide.alt : ""} aria-hidden={index !== active} loading={index === 0 ? "eager" : "lazy"} />)}
    </div>
    <div className="hero-note"><span>Care, your way</span><strong>Warm. Personal. Close to home.</strong></div>
    <div className="hero-carousel-controls" aria-label="Choose a care photograph">
      {slides.map((slide, index) => <button key={slide.src} type="button" className={index === active ? "hero-carousel-dot hero-carousel-dot--active" : "hero-carousel-dot"} aria-label={`Show photograph ${index + 1} of ${slides.length}`} aria-pressed={active === index} onClick={() => setActive(index)} />)}
    </div>
  </div>;
}

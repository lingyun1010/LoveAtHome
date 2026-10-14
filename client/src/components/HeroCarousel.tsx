import { useEffect, useState } from "react";

const slides = [
  { src: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1100&auto=format&fit=crop", alt: "Close-up of supportive hands during a care interaction" },
  { src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1100&auto=format&fit=crop", alt: "Healthcare professional, illustrative image" },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1100&auto=format&fit=crop", alt: "People enjoying time together in the community" },
  { src: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1100&auto=format&fit=crop", alt: "A welcoming home kitchen, illustrative image" },
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

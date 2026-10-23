import { useEffect } from "react";
import { Button } from "../components/Button";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { HeroCarousel } from "../components/HeroCarousel";
import { PricingCard } from "../components/PricingCard";
import { SectionHeading } from "../components/SectionHeading";
import { ServiceCard } from "../components/ServiceCard";
import { TeamCard } from "../components/TeamCard";
import { services } from "../data/services";
import { team } from "../data/team";
import { copy, type Language } from "../i18n";
import { EnquiryForm } from "../sections/EnquiryForm";

export function HomePage({ language, setLanguage }: { language: Language; setLanguage: (value: Language) => void }) {
  const t = copy[language];
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;
    // Animate actual content blocks rather than the entire section: a large section
    // can intersect before its cards enter the viewport, making motion invisible.
    const elements = Array.from(document.querySelectorAll<HTMLElement>(
      "main .section-heading, main .services-grid > *, main .pricing-grid > *, main .team-grid > *, main .upgrade-cards > *, main .trust-list > *, main .faq-list > *, main .ndis-image, main .sydney-map, main .contact-note, main .enquiry-form"
    ));
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -35px 0px" });
    elements.forEach((el, i) => {
      el.classList.add("reveal-item");
      el.style.setProperty("--reveal-delay", `${(i % 3) * 90}ms`);
      observer.observe(el);
    });
    return () => {
      observer.disconnect();
      elements.forEach(el => {
        el.classList.remove("reveal-item", "is-visible");
        el.style.removeProperty("--reveal-delay");
      });
    };
  }, []);
  return <>
    <Header language={language} setLanguage={setLanguage} t={t.header} />
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">{t.hero.eyebrow}</p><h1><span className="hero-title-line">{t.hero.titleLine1}</span><em className="hero-title-line">{t.hero.titleLine2}</em></h1><p className="hero-intro">{t.hero.intro}</p><div className="button-row"><Button href="#contact">{t.hero.primary}</Button><Button href="#services" variant="secondary">{t.hero.secondary}</Button></div></div><HeroCarousel t={t.carousel} /></div></section>
      <section className="trust-strip" aria-label={t.trustStripLabel}><div className="container">{t.trustStrip.map((item, index) => <div key={index}><span aria-hidden="true">✓</span>{item}</div>)}</div></section>
      <section className="section" id="services"><div className="container"><SectionHeading align="center" eyebrow={t.services.eyebrow} title={t.services.title} intro={t.services.intro} /><div className="services-grid">{services.map((service, index) => <ServiceCard key={service.number} {...service} {...t.services.cards[index]} />)}</div></div></section>
      <section className="section upgrade-section" id="support-at-home"><div className="container upgrade-grid"><div><SectionHeading eyebrow={t.supportAtHome.eyebrow} title={t.supportAtHome.title} intro={t.supportAtHome.intro} /><Button href="#contact" variant="secondary">{t.supportAtHome.button}</Button></div><div className="upgrade-cards">{["assistive-technology", "home-modification"].map((image, index) => <article key={image}><img className="upgrade-image" src={`${import.meta.env.BASE_URL}images/services/${image}.jpg`} alt={t.supportAtHome.cards[index].imageAlt} loading="lazy" /><h3>{t.supportAtHome.cards[index].title}</h3><p>{t.supportAtHome.cards[index].text}</p></article>)}</div></div></section>
      <section className="section ndis-section" id="ndis"><div className="container ndis-layout"><div className="ndis-content"><SectionHeading eyebrow={t.ndis.eyebrow} title={t.ndis.title} intro={t.ndis.intro} /><p>{t.ndis.linkBefore}<a href="https://www.ndis.gov.au/" target="_blank" rel="noopener noreferrer">{t.ndis.linkLabel}</a>{t.ndis.linkAfter}</p><Button href="#contact" variant="secondary">{t.ndis.button}</Button></div><img className="ndis-image" src={`${import.meta.env.BASE_URL}images/hero/care-at-home-01.jpg?v=20261023-asian-care`} alt={t.ndis.imageAlt} loading="lazy" /></div></section>
      <section className="section" id="pricing"><div className="container"><div className="split-heading"><SectionHeading align="center" eyebrow={t.pricing.eyebrow} title={t.pricing.title} intro={t.pricing.intro} /></div><p className="pricing-disclaimer">{t.pricing.disclaimer}</p><div className="pricing-grid">{t.pricing.cards.map((item, index) => <PricingCard key={index} {...item} />)}</div></div></section>
      <section className="section team-section" id="team"><div className="container"><SectionHeading align="center" eyebrow={t.team.eyebrow} title={t.team.title} intro={t.team.intro} /><div className="team-grid">{team.map((member, index) => <TeamCard key={member.id} {...member} {...t.team.members[index]} imageAlt={t.team.portraitAlt(t.team.members[index].name)} photoPending={t.team.photoPending} />)}</div></div></section>
      <section className="section why-section" id="about"><div className="container why-grid"><div><SectionHeading eyebrow={t.why.eyebrow} title={t.why.title} intro={t.why.intro} /><Button href="#contact" variant="secondary">{t.why.button}</Button></div><div className="trust-list">{t.why.reasons.map((item, index) => <article key={index}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></section>
      <section className="section sydney-section"><div className="container sydney-grid"><div className="sydney-map"><img src={`${import.meta.env.BASE_URL}images/locations/sydney-harbour.jpg`} alt={t.sydney.imageAlt} loading="lazy" /></div><div><SectionHeading eyebrow={t.sydney.eyebrow} title={t.sydney.title} intro={t.sydney.intro} /><p className="availability-note">{t.sydney.availability}</p></div></div></section>
      <section className="section" id="faq"><div className="container">
        <SectionHeading align="center" eyebrow={t.faq.eyebrow} title={t.faq.title} intro={t.faq.intro} />
        <div className="faq-list">
          {t.faq.items.map((item, index) => <details key={index}><summary>{item.question}</summary><div><p>{item.before}{item.link && <a href={item.link.href} target="_blank" rel="noopener noreferrer">{item.link.label}</a>}{item.after}</p></div></details>)}
        </div>
      </div></section>
      <EnquiryForm t={t.enquiry} />
      <section className="final-cta"><div className="container"><div><p className="eyebrow">{t.finalCta.eyebrow}</p><h2>{t.finalCta.title}</h2><p>{t.finalCta.text}</p></div><Button href="#contact" variant="secondary">{t.finalCta.button}</Button></div></section>
    </main>
    <Footer t={t.footer} />
  </>;
}

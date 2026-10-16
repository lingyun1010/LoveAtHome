import { useEffect } from "react";
import { Button } from "../components/Button";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { HeroCarousel } from "../components/HeroCarousel";
import { PricingCard } from "../components/PricingCard";
import { SectionHeading } from "../components/SectionHeading";
import { ServiceCard } from "../components/ServiceCard";
import { TeamCard } from "../components/TeamCard";
import { pricing } from "../data/pricing";
import { services } from "../data/services";
import { team } from "../data/team";
import { trustReasons, trustStrip } from "../data/homepage";
import { EnquiryForm } from "../sections/EnquiryForm";

export function HomePage({ language, setLanguage }: { language: "en" | "zh"; setLanguage: (value: "en" | "zh") => void }) {
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
    <Header language={language} setLanguage={setLanguage} />
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">PERSONALISED HOME CARE ACROSS SYDNEY</p><h1><span className="hero-title-line">Care that feels</span><em className="hero-title-line">closer to home.</em></h1><p className="hero-intro">Support at Home aged care and NDIS-related services across Sydney. Our clinician-led team combines personalised care, competitive support-worker rates and meaningful community connections, delivered with culturally responsive support and in partnership with licensed providers where applicable.</p><div className="button-row"><Button href="#contact">Make an enquiry</Button><Button href="#services" variant="secondary">Explore our services</Button></div></div><HeroCarousel /></div></section>
      <section className="trust-strip" aria-label="Love At Home trust points"><div className="container">{trustStrip.map((item) => <div key={item}><span aria-hidden="true">✓</span>{item}</div>)}</div></section>
      <section className="section" id="services"><div className="container"><SectionHeading align="center" eyebrow="OUR SERVICES" title="Practical support for everyday life." intro="Three clear areas of support for Support at Home and NDIS clients, shaped around each person's needs and circumstances." /><div className="services-grid">{services.map((service) => <ServiceCard key={service.title} {...service} />)}</div></div></section>
      <section className="section upgrade-section" id="support-at-home"><div className="container upgrade-grid"><div><SectionHeading eyebrow="SUPPORT AT HOME" title="Need more support at home?" intro="Whether you are new to Support at Home or already receiving services, Love At Home can help you understand the program, apply for support, explore package upgrades and answer questions about your options." /><Button href="#contact" variant="secondary">Ask about your options</Button></div><div className="upgrade-cards"><article><img className="upgrade-image" src="/images/services/assistive-technology.jpg" alt="Illustrative healthcare equipment" loading="lazy" /><h3>Assistive Technology</h3><p>Equipment and technology that can support safety and independence at home.</p></article><article><img className="upgrade-image" src="/images/services/home-modification.jpg" alt="Illustrative accessible home interior" loading="lazy" /><h3>Home Modifications</h3><p>Changes to the home environment that may improve accessibility, safety and everyday living.</p></article></div></div></section>
      <section className="section ndis-section" id="ndis"><div className="container ndis-layout"><div className="ndis-content"><SectionHeading eyebrow="NDIS SUPPORT" title="Support that fits your everyday life." intro="Our team can discuss support options for people with disability and help you understand the next step. NDIS-related services are provided in conjunction with a licensed provider." /><p>For official NDIS eligibility, plan and funding information, visit <a href="https://www.ndis.gov.au/" target="_blank" rel="noopener noreferrer">the NDIS website</a>.</p><Button href="#contact" variant="secondary">Ask about NDIS support</Button></div><img className="ndis-image" src="/images/hero/care-at-home-01.jpg" alt="An illustrative photograph showing compassionate personal support" loading="lazy" /></div></section>
      <section className="section" id="pricing"><div className="container"><div className="split-heading"><SectionHeading align="center" eyebrow="PRICING" title="Clear pricing, without the guesswork." intro="Selected support-worker services start at $76 per hour. Contact our team for pricing on nursing, allied health and other services, so you can plan care around your budget." /></div><p className="pricing-disclaimer">The $76/hr starting rate applies to eligible support-worker services only, not all clinical or allied health services. Actual rates, travel, time-of-day loadings, government funding rules and client contributions may vary. Please request a personalised quote.</p><div className="pricing-grid">{pricing.map((item) => <PricingCard key={item.title} {...item} />)}</div></div></section>
      <section className="section team-section" id="team"><div className="container"><SectionHeading align="center" eyebrow="MEET THE TEAM" title="Experienced people, thoughtful care." intro="Meet the people helping clients navigate care, coordinate services and stay connected with their communities. Individual photographs and biographies are being confirmed." /><div className="team-grid">{team.map((member) => <TeamCard key={member.id} {...member} />)}</div></div></section>
      <section className="section why-section" id="about"><div className="container why-grid"><div><SectionHeading eyebrow="WHY LOVE AT HOME" title="Support built around the person, not a standard package." intro="A warm, professional approach that keeps clients, families and carers informed and involved." /><Button href="#contact" variant="secondary">Talk to our team</Button></div><div className="trust-list">{trustReasons.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></section>
      <section className="section sydney-section"><div className="container sydney-grid"><div className="sydney-map"><img src="/images/locations/sydney-harbour.jpg" alt="Sydney Harbour landmark photograph" loading="lazy" /></div><div><SectionHeading eyebrow="SYDNEY-WIDE SUPPORT" title="Welcoming clients from all backgrounds across metropolitan Sydney." intro="Love At Home welcomes enquiries from people of all cultural and language backgrounds across Sydney. Our team supports culturally responsive conversations about your care needs." /><p className="availability-note">Service availability may depend on location, service type and staff availability.</p></div></div></section>
      <section className="section" id="faq"><div className="container">
        <SectionHeading align="center" eyebrow="COMMON QUESTIONS" title="Understanding your care options." intro="General guidance on Support at Home and NDIS services. Eligibility, funding and contribution decisions are made by the relevant government agencies." />
        <div className="faq-list">
          <details><summary>How do I apply for Support at Home?</summary><div><p>Start with My Aged Care to check eligibility and arrange an assessment. Our team can explain the services available and assist with next steps while eligibility and funding decisions remain with My Aged Care. <a href="https://www.myagedcare.gov.au/" target="_blank" rel="noopener noreferrer">Visit My Aged Care</a>.</p></div></details>
          <details><summary>How many hours of support will I receive?</summary><div><p>Available hours depend on your approved funding, individual care plan, service rates and any applicable contributions. Contact our team to discuss a tailored estimate.</p></div></details>
          <details><summary>Will I need to pay a contribution?</summary><div><p>Contributions can depend on the type of service and your assessed circumstances. Check current government guidance for the applicable rules and discuss service-specific fees with our team.</p></div></details>
          <details><summary>Can I request more support or home modifications?</summary><div><p>Funding reviews and assistive technology or home modification options depend on the relevant program and assessment. We can help you understand the next steps. For aged care information, consult <a href="https://www.myagedcare.gov.au/" target="_blank" rel="noopener noreferrer">My Aged Care</a>.</p></div></details>
          <details><summary>Where can I find official NDIS information?</summary><div><p>For eligibility, plan reviews and funding guidance, visit the <a href="https://www.ndis.gov.au/" target="_blank" rel="noopener noreferrer">official NDIS website</a>.</p></div></details>
          <details><summary>What types of home care and community support are available?</summary><div><p>Depending on your care plan and funding, services may include nursing, allied health, personal care, domestic assistance, transport, respite and supported community social outings. Ask our team which options are available in your area.</p></div></details>
          <details><summary>Can I request a worker who understands my language and culture?</summary><div><p>Tell us your preferred language and cultural needs. We will discuss suitable staff and availability. We welcome clients from diverse backgrounds.</p></div></details>
          <details><summary>How do I access NDIS or request a plan reassessment?</summary><div><p>Check eligibility and application guidance on the <a href="https://www.ndis.gov.au/" target="_blank" rel="noopener noreferrer">official NDIS website</a>. For changes to an existing plan, seek current reassessment guidance from the NDIA or your planner. We can discuss relevant service options.</p></div></details>
        </div>
      </div></section>
      <EnquiryForm />
      <section className="final-cta"><div className="container"><div><p className="eyebrow">START A CONVERSATION</p><h2>Not sure what support you need?</h2><p>Tell us what you would like to understand, and our team can help you explore the next step.</p></div><Button href="#contact" variant="secondary">Make an enquiry</Button></div></section>
    </main>
    <Footer />
  </>;
}


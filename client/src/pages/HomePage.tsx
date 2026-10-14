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
    const sections = document.querySelectorAll<HTMLElement>("main > section");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.06, rootMargin: "0px 0px -30px 0px" });
    sections.forEach(section => { section.classList.add("reveal-section"); observer.observe(section); });
    return () => { observer.disconnect(); sections.forEach(section => section.classList.remove("reveal-section", "is-visible")); };
  }, []);
  return <>
    <Header language={language} setLanguage={setLanguage} />
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">PERSONALISED HOME CARE ACROSS SYDNEY</p><h1><span className="hero-title-line">Care that feels</span><em className="hero-title-line">closer to home.</em></h1><p className="hero-intro">Qualified, personalised home care for older people and people with disability — supporting aged care clients through Support at Home and providing NDIS-related services with a licensed provider, with culturally responsive care shaped around individual needs, preferences and everyday life.</p><div className="button-row"><Button href="#contact">Make an enquiry</Button><Button href="#services" variant="secondary">Explore our services</Button></div></div><HeroCarousel /></div></section>
      <section className="trust-strip" aria-label="Love At Home trust points"><div className="container">{trustStrip.map((item) => <div key={item}><span aria-hidden="true">✓</span>{item}</div>)}</div></section>
      <section className="section" id="services"><div className="container"><SectionHeading align="center" eyebrow="OUR SERVICES" title="Practical support for everyday life." intro="Three clear areas of support for Support at Home and NDIS clients, shaped around each person's needs and circumstances." /><div className="services-grid">{services.map((service) => <ServiceCard key={service.title} {...service} />)}</div></div></section>
      <section className="section upgrade-section" id="support-at-home"><div className="container upgrade-grid"><div><SectionHeading eyebrow="SUPPORT AT HOME" title="Need more support at home?" intro="Whether you are new to Support at Home or already receiving services, Love At Home can help you understand the program, apply for support, explore package upgrades and answer questions about your options." /><Button href="#contact" variant="secondary">Ask about your options</Button></div><div className="upgrade-cards"><article><img className="upgrade-image" src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=700&auto=format&fit=crop" alt="Illustrative healthcare equipment" loading="lazy" /><h3>Assistive Technology</h3><p>Equipment and technology that can support safety and independence at home.</p></article><article><img className="upgrade-image" src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=700&auto=format&fit=crop" alt="Illustrative accessible home interior" loading="lazy" /><h3>Home Modifications</h3><p>Changes to the home environment that may improve accessibility, safety and everyday living.</p></article></div></div></section>
      <section className="section ndis-section" id="ndis"><div className="container ndis-layout"><div className="ndis-content"><SectionHeading eyebrow="NDIS SUPPORT" title="Support that fits your everyday life." intro="Our team can discuss support options for people with disability and help you understand the next step. NDIS-related services are provided in conjunction with a licensed provider." /><p>For official NDIS eligibility, plan and funding information, visit <a href="https://www.ndis.gov.au/" target="_blank" rel="noopener noreferrer">the NDIS website</a>.</p><Button href="#contact" variant="secondary">Ask about NDIS support</Button></div><img className="ndis-image" src="https://images.unsplash.com/photo-1584515933487-779824d29309?w=1000&auto=format&fit=crop" alt="An illustrative photograph showing compassionate personal support" loading="lazy" /></div></section>
      <section className="section" id="pricing"><div className="container"><div className="split-heading"><SectionHeading align="center" eyebrow="PRICING" title="Clear pricing, without the guesswork." intro="Support worker services start from $76 per hour. Contact our team for other rates and a personalised quote." /></div><div className="pricing-grid">{pricing.map((item) => <PricingCard key={item.title} {...item} />)}</div></div></section>
      <section className="section team-section" id="team"><div className="container"><SectionHeading align="center" eyebrow="MEET THE TEAM" title="Experienced people, thoughtful care." intro="Meet the people helping clients navigate care. Staff photography and further team details are being finalised." /><div className="team-grid">{team.map((member) => <TeamCard key={member.id} {...member} />)}</div></div></section>
      <section className="section why-section" id="about"><div className="container why-grid"><div><SectionHeading eyebrow="WHY LOVE AT HOME" title="Support built around the person, not a standard package." intro="A warm, professional approach that keeps clients, families and carers informed and involved." /><Button href="#contact" variant="secondary">Talk to our team</Button></div><div className="trust-list">{trustReasons.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></section>
      <section className="section sydney-section"><div className="container sydney-grid"><div className="sydney-map"><iframe title="Map of metropolitan Sydney" src="https://www.openstreetmap.org/export/embed.html?bbox=150.85%2C-34.10%2C151.37%2C-33.65&layer=mapnik&marker=-33.8688%2C151.2093" loading="lazy" referrerPolicy="no-referrer" /></div><div><SectionHeading eyebrow="SYDNEY-WIDE SUPPORT" title="Welcoming clients from all backgrounds across metropolitan Sydney." intro="Love At Home welcomes enquiries from people of all cultural and language backgrounds across Sydney. Our team supports culturally responsive conversations about your care needs." /><p className="availability-note">Service availability may depend on location, service type and staff availability.</p></div></div></section>
      <section className="section" id="faq"><div className="container">
        <SectionHeading align="center" eyebrow="COMMON QUESTIONS" title="Understanding your care options." intro="General guidance on Support at Home and NDIS services. Eligibility, funding and contribution decisions are made by the relevant government agencies." />
        <div className="faq-list">
          <details><summary>How do I apply for Support at Home?</summary><div><p>Start with My Aged Care to check eligibility and arrange an assessment. Our team can discuss care services once you understand your options. <a href="https://www.myagedcare.gov.au/" target="_blank" rel="noopener noreferrer">Visit My Aged Care</a>.</p></div></details>
          <details><summary>How many hours of support will I receive?</summary><div><p>Available hours depend on your approved funding, individual care plan, service rates and any applicable contributions. Contact our team to discuss a tailored estimate.</p></div></details>
          <details><summary>Will I need to pay a contribution?</summary><div><p>Contributions can depend on the type of service and your assessed circumstances. Check current government guidance for the applicable rules and discuss service-specific fees with our team.</p></div></details>
          <details><summary>Can I request more support or home modifications?</summary><div><p>Funding reviews and assistive technology or home modification options depend on the relevant program and assessment. We can help you understand the next steps.</p></div></details>
          <details><summary>Where can I find official NDIS information?</summary><div><p>For eligibility, plan reviews and funding guidance, visit the <a href="https://www.ndis.gov.au/" target="_blank" rel="noopener noreferrer">official NDIS website</a>.</p></div></details>
        </div>
      </div></section>
      <EnquiryForm />
      <section className="final-cta"><div className="container"><div><p className="eyebrow">START A CONVERSATION</p><h2>Not sure what support you need?</h2><p>Tell us what you would like to understand, and our team can help you explore the next step.</p></div><Button href="#contact" variant="secondary">Make an enquiry</Button></div></section>
    </main>
    <Footer />
  </>;
}


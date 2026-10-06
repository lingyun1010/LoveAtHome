import { Button } from "../components/Button";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PricingCard } from "../components/PricingCard";
import { SectionHeading } from "../components/SectionHeading";
import { ServiceCard } from "../components/ServiceCard";
import { TeamCard } from "../components/TeamCard";
import { pricing } from "../data/pricing";
import { services } from "../data/services";
import { team } from "../data/team";
import { trustReasons, trustStrip } from "../data/homepage";
import { EnquiryForm } from "../sections/EnquiryForm";

export function HomePage() {
  return <>
    <Header />
    <main id="top">
      <section className="hero"><div className="container hero-grid"><div className="hero-copy"><p className="eyebrow">PERSONALISED HOME CARE ACROSS SYDNEY</p><h1>Care that feels<br /><em>closer to home.</em></h1><p className="hero-intro">Qualified, personalised support for older people and families — with culturally responsive care shaped around individual needs, preferences and everyday life.</p><div className="button-row"><Button href="#contact">Make an enquiry</Button><Button href="#services" variant="secondary">Explore our services</Button></div></div><div className="hero-visual" role="img" aria-label="Approved Love At Home imagery placeholder"><div className="visual-frame"><span className="visual-heart">♥</span><p>Approved Love At Home<br />image placeholder</p></div><div className="hero-note"><span>Care, your way</span><strong>Warm. Personal. Close to home.</strong></div></div></div></section>
      <section className="trust-strip" aria-label="Love At Home trust points"><div className="container">{trustStrip.map((item) => <div key={item}><span aria-hidden="true">✓</span>{item}</div>)}</div></section>
      <section className="section" id="services"><div className="container"><SectionHeading eyebrow="OUR SERVICES" title="Practical support for everyday life." intro="Three clear areas of support, shaped around each client's needs and circumstances." /><div className="services-grid">{services.map((service) => <ServiceCard key={service.title} {...service} />)}</div></div></section>
      <section className="section upgrade-section"><div className="container upgrade-grid"><div><SectionHeading eyebrow="SUPPORT AT HOME" title="Need more support at home?" intro="Love At Home can help clients understand potential upgrades and additional funding pathways under Support at Home." /><Button href="#contact" variant="secondary">Ask about your options</Button></div><div className="upgrade-cards"><article><span aria-hidden="true">↗</span><h3>Assistive Technology</h3><p>Equipment and technology that can support safety and independence at home.</p></article><article><span aria-hidden="true">⌂</span><h3>Home Modifications</h3><p>Changes to the home environment that may improve accessibility, safety and everyday living.</p></article></div></div></section>
      <section className="section" id="pricing"><div className="container"><div className="split-heading"><SectionHeading eyebrow="PRICING" title="Clear pricing, without the guesswork." intro="A selection of key rates will be added here once the current pricing schedule is approved." /><Button href="#pricing" variant="text">View full pricing <span aria-hidden="true">→</span></Button></div><div className="pricing-grid">{pricing.map((item) => <PricingCard key={item.title} {...item} />)}</div></div></section>
      <section className="section team-section" id="team"><div className="container"><SectionHeading eyebrow="MEET THE TEAM" title="Experienced people, thoughtful care." intro="Approved team profiles will be added as details and photography are supplied by Love At Home." /><div className="team-grid">{team.map((member) => <TeamCard key={member.id} {...member} />)}</div></div></section>
      <section className="section why-section" id="about"><div className="container why-grid"><div><SectionHeading eyebrow="WHY LOVE AT HOME" title="Support built around the person, not a standard package." intro="A warm, professional approach that keeps clients, families and carers informed and involved." /><Button href="#contact" variant="secondary">Talk to our team</Button></div><div className="trust-list">{trustReasons.map((item, index) => <article key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div></section>
      <section className="section sydney-section"><div className="container sydney-grid"><div className="sydney-art" aria-hidden="true"><span className="ring ring--one"/><span className="ring ring--two"/><span className="ring ring--three"/><strong>SYDNEY</strong></div><div><SectionHeading eyebrow="SYDNEY-WIDE SUPPORT" title="Welcoming clients from all backgrounds across metropolitan Sydney." intro="Our bilingual English and Chinese website reflects part of our cultural capability, while Love At Home welcomes enquiries from people of all cultural and language backgrounds across Sydney." /><p className="availability-note">Service availability may depend on location, service type and staff availability.</p></div></div></section>
      <EnquiryForm />
      <section className="final-cta"><div className="container"><div><p className="eyebrow">START A CONVERSATION</p><h2>Not sure what support you need?</h2><p>Tell us what you would like to understand, and our team can help you explore the next step.</p></div><Button href="#contact" variant="secondary">Make an enquiry</Button></div></section>
    </main>
    <Footer />
  </>;
}


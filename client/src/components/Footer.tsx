import type { Copy } from "../i18n";

export function Footer({ t }: { t: Copy["footer"] }) {
  return <footer className="footer">
    <div className="container footer-grid">
      <div>
        <a className="brand brand--light footer-brand" href="#top" aria-label={t.backToTop}><span className="brand-icon"><img src="https://raw.githubusercontent.com/lingyun1010/LoveAtHome/main/logo.png" alt="" /></span><span className="brand-wordmark"><strong>LOVE AT HOME</strong><small>爱家 · Home Care</small></span></a>
        <p>{t.tagline}</p>
      </div>
      <div><h2>{t.explore}</h2><a href="#services">{t.links.services}</a><a href="#pricing">{t.links.pricing}</a><a href="#team">{t.links.team}</a></div>
      <div><h2>{t.getInTouch}</h2><a href="#contact">{t.enquiry}</a><p>{t.phone}: <a href="tel:+61422559527">0422 559 527</a></p><p>{t.email}: <a href="mailto:info@loveathome.com.au">info@loveathome.com.au</a></p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Love At Home</span><span><a href="https://drive.google.com/file/d/18ZRxlLqQywxnVmFWVbqedGJl1gZxIHAX/view" target="_blank" rel="noopener noreferrer">{t.privacy}</a></span></div>
  </footer>;
}

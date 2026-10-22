import { useEffect, useState } from "react";
import type { Copy, Language } from "../i18n";
import { Button } from "./Button";

const links = [
  { id: "services", en: "Services", zh: "服务" },
  { id: "support-at-home", en: "Support at Home", zh: "居家养老" },
  { id: "ndis", en: "NDIS", zh: "NDIS" },
  { id: "pricing", en: "Pricing", zh: "价格" },
  { id: "about", en: "About", zh: "关于我们" },
] as const;

export function Header({ language, setLanguage, t }: { language: Language; setLanguage: (value: Language) => void; t: Copy["header"] }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);
  return <header className="site-header">
    <div className="container header-inner">
      <a className="brand" href="#top" aria-label={t.home}>
        <span className="brand-icon"><img src="https://raw.githubusercontent.com/lingyun1010/LoveAtHome/main/logo.png" alt="" /></span><span className="brand-wordmark"><strong>LOVE AT HOME</strong><small>爱家 · Home Care</small></span>
      </a>
      <div className="header-actions">
        <Button href="#contact" onClick={() => setOpen(false)}>{t.enquire}</Button>
        <button className="language-control" type="button" aria-label={t.switchLabel} onClick={() => setLanguage(language === "en" ? "zh" : "en")}>{t.switchText}</button>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? t.closeMenu : t.openMenu}</span><span /><span /><span />
      </button>
      </div>
      <nav id="site-navigation" className={open ? "nav nav--open" : "nav"} aria-label={t.navLabel}>
        {links.map(link => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}>{link[language]}</a>)}
      </nav>
    </div>
  </header>;
}

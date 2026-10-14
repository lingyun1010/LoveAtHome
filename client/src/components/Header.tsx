import { useEffect, useState } from "react";
import { Button } from "./Button";

const links = [
  { id: "services", en: "Services", zh: "服务" },
  { id: "support-at-home", en: "Support at Home", zh: "居家养老" },
  { id: "ndis", en: "NDIS", zh: "NDIS" },
  { id: "pricing", en: "Pricing", zh: "价格" },
  { id: "about", en: "About", zh: "关于我们" },
] as const;

export function Header({ language, setLanguage }: { language: "en" | "zh"; setLanguage: (value: "en" | "zh") => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);
  return <header className="site-header">
    <div className="container header-inner">
      <a className="brand" href="#top" aria-label="Love At Home home">
        <span className="brand-icon"><img src="https://raw.githubusercontent.com/lingyun1010/LoveAtHome/main/logo.png" alt="" /></span><span className="brand-wordmark"><strong>LOVE AT HOME</strong><small>爱家 · Home Care</small></span>
      </a>
      <div className="header-actions">
        <Button href="#contact" onClick={() => setOpen(false)}>{language === "en" ? "Enquire" : "咨询"}</Button>
        <button className="language-control" type="button" aria-label={language === "en" ? "Switch to Chinese" : "切换为英文"} onClick={() => setLanguage(language === "en" ? "zh" : "en")}>{language === "en" ? "中文" : "EN"}</button>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? "Close" : "Open"} menu</span><span /><span /><span />
      </button>
      </div>
      <nav id="site-navigation" className={open ? "nav nav--open" : "nav"} aria-label="Primary navigation">
        {links.map(link => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}>{link[language]}</a>)}
      </nav>
    </div>
  </header>;
}

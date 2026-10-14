import { useEffect, useState } from "react";
import { Button } from "./Button";

const links = [
  { id: "top", en: "Home", zh: "首页" },
  { id: "services", en: "Services", zh: "服务" },
  { id: "support-at-home", en: "Support at Home", zh: "居家养老" },
  { id: "ndis", en: "NDIS", zh: "NDIS" },
  { id: "pricing", en: "Pricing", zh: "价格" },
  { id: "team", en: "Team", zh: "团队" },
  { id: "about", en: "About", zh: "关于我们" },
  { id: "faq", en: "FAQ", zh: "常见问题" },
  { id: "contact", en: "Contact", zh: "联系我们" },
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
        <span className="brand-lockup" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}brand-concept-a.png`} alt="" /></span>
      </a>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>
        <span className="sr-only">{open ? "Close" : "Open"} menu</span><span /><span /><span />
      </button>
      <nav id="site-navigation" className={open ? "nav nav--open" : "nav"} aria-label="Primary navigation">
        {links.map(link => <a key={link.id} href={`#${link.id}`} onClick={() => setOpen(false)}>{link[language]}</a>)}
        <button className="language-control" type="button" aria-label={language === "en" ? "Switch to Chinese" : "切换为英文"} onClick={() => setLanguage(language === "en" ? "zh" : "en")}>{language === "en" ? "中文" : "EN"}</button>
        <Button href="#contact" onClick={() => setOpen(false)}>{language === "en" ? "Enquire" : "咨询"}</Button>
      </nav>
    </div>
  </header>;
}

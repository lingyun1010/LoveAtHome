import { useEffect, useState } from "react";
import { Button } from "./Button";

const links = ["Home", "About", "Services", "Pricing", "Team", "Contact"];

export function Header() {
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
        {links.map((link) => <a key={link} href={link === "Home" ? "#top" : `#${link.toLowerCase()}`} onClick={() => setOpen(false)}>{link}</a>)}
        <button className="language-control" type="button" aria-label="Language selection placeholder">EN / 中文</button>
        <Button href="#contact" onClick={() => setOpen(false)}>Make an enquiry</Button>
      </nav>
    </div>
  </header>;
}

export function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div>
        <a className="brand brand--light" href="#top"><span className="brand-mark" aria-hidden="true"><span>♥</span></span><span><strong>LOVE AT HOME</strong><small>Home Care</small></span></a>
        <p>Personalised home care for people and families across metropolitan Sydney.</p>
      </div>
      <div><h2>Explore</h2><a href="#services">Services</a><a href="#pricing">Pricing</a><a href="#team">Team</a></div>
      <div><h2>Get in touch</h2><a href="#contact">Make an enquiry</a><p>Phone: To be confirmed</p><p>Email: To be confirmed</p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Love At Home</span><span>Privacy policy: To be supplied</span></div>
  </footer>;
}


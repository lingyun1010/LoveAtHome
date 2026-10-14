export function Footer() {
  return <footer className="footer">
    <div className="container footer-grid">
      <div>
        <a className="brand brand--light footer-brand" href="#top" aria-label="Love At Home — back to top"><span className="brand-icon"><img src="https://raw.githubusercontent.com/lingyun1010/LoveAtHome/main/logo.png" alt="" /></span><span className="brand-wordmark"><strong>LOVE AT HOME</strong><small>爱家 · Home Care</small></span></a>
        <p>Personalised home care for people and families across metropolitan Sydney.</p>
      </div>
      <div><h2>Explore</h2><a href="#services">Services</a><a href="#pricing">Pricing</a><a href="#team">Team</a></div>
      <div><h2>Get in touch</h2><a href="#contact">Make an enquiry</a><p>Phone: <a href="tel:+61422559527">0422 559 527</a></p><p>Email: <a href="mailto:info@loveathome.com.au">info@loveathome.com.au</a></p></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} Love At Home</span><span><a href="https://drive.google.com/file/d/18ZRxlLqQywxnVmFWVbqedGJl1gZxIHAX/view" target="_blank" rel="noopener noreferrer">Privacy policy</a></span></div>
  </footer>;
}


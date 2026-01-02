import "../../styles/landing.css";

function Landing() {
  return (
    <div className="landing">
      <div className="floating-elements">
        <div className="floating-element" style={{width: '100px', height: '100px', top: '10%', left: '5%'}}></div>
        <div className="floating-element" style={{width: '150px', height: '150px', top: '60%', right: '10%'}}></div>
        <div className="floating-element" style={{width: '80px', height: '80px', bottom: '20%', left: '20%'}}></div>
      </div>
      
      <div className="landing-content">
        <h1>WebShield</h1>
        <p className="landing-tagline">Your Cybersecurity Shield for Web Protection</p>
        <p className="landing-description">
          WebShield is an advanced cybersecurity tool that scans websites for common 
          vulnerabilities using professional security scanners like Nmap, Nikto, SQLMap, 
          and SSLScan. Get easy-to-understand vulnerability reports and protect your 
          web applications.
        </p>
        
        <a href="/signup" className="cta-button">
          Get Started Free
        </a>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Vulnerability Scanning</h3>
            <p>Scan websites for common security vulnerabilities using industry-standard tools</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Detailed Reports</h3>
            <p>Get comprehensive, easy-to-understand reports with actionable insights</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Secure</h3>
            <p>Perform scans quickly while maintaining the highest security standards</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
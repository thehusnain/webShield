import { useNavigate } from "react-router-dom";
import "../../styles/disclaimer.css"; // Add this import

const Disclaimer = () => {
  const navigate = useNavigate();

  const handleAgree = () => {
    navigate("/dashboard");
  };
  
  const handleDisagree = () => {
    navigate("/");
  };

  return (
    <div className="disclaimer-container">
      <div className="disclaimer-card">
        <div className="disclaimer-header">
          <div className="warning-icon">⚠️</div>
          <h2>Important Legal Disclaimer</h2>
          <p>Please read this carefully before proceeding</p>
        </div>
        
        <div className="disclaimer-content">
          <div className="disclaimer-section">
            <h3>Purpose of Tools</h3>
            <p>
              All tools and information provided on WebShield are intended strictly for 
              <strong> educational and ethical hacking purposes</strong> only. They are designed 
              to help users understand cybersecurity vulnerabilities, conduct authorized 
              penetration testing, and develop defensive security measures.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>Authorized Use Only</h3>
            <p>
              Users are strictly prohibited from using any tool or information on this site for 
              illegal, unauthorized, or malicious activities. This includes, but is not limited to:
            </p>
            <ul>
              <li>Accessing systems without explicit permission</li>
              <li>Data theft or unauthorized data access</li>
              <li>Causing damage to systems or networks</li>
              <li>Engaging in any form of cybercrime</li>
            </ul>
          </div>

          <div className="disclaimer-section">
            <h3>No Liability</h3>
            <p>
              We expressly disclaim any liability for any harm, damage, or legal consequences 
              resulting from the misuse of the provided tools or information. The software is 
              provided "as is" without any warranty of any kind, to the extent permitted by 
              applicable law.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>User Responsibility</h3>
            <p>
              By using WebShield, you agree that you are solely responsible for adhering to all 
              applicable local, national, and international laws and regulations. You must ensure 
              you have proper authorization before testing any system or network.
            </p>
          </div>

          <div className="disclaimer-section">
            <h3>Security Risks</h3>
            <p>
              Some security tools may be detected by antivirus software as potential threats. 
              Users must exercise due diligence and personal responsibility, ideally testing 
              within a contained virtual environment.
            </p>
          </div>
        </div>

        <div className="checkbox-container">
          <input type="checkbox" id="agree-checkbox" required />
          <label htmlFor="agree-checkbox">
            I have read, understood, and agree to the terms above
          </label>
        </div>

        <div className="disclaimer-actions">
          <button 
            className="disclaimer-button agree-button" 
            onClick={handleAgree}
          >
            I Agree & Continue
          </button>
          <button 
            className="disclaimer-button disagree-button" 
            onClick={handleDisagree}
          >
            I Do Not Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
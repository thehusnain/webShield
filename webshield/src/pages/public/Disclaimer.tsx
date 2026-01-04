import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/disclaimer.css";

const Disclaimer = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [error, setError] = useState("");
  const [checkboxError, setCheckboxError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAgree = async () => {
    // Clear ALL errors
    setError("");
    setCheckboxError("");

    // 1. Check the checkbox
    const checkbox = document.getElementById('agree-checkbox');
    if (!checkbox || !(checkbox as HTMLInputElement).checked) {
      // Show error RIGHT BELOW the checkbox
      setCheckboxError("Please check the agreement box to continue");
      
      // Visual feedback
      if (checkbox) {
        checkbox.style.outline = "2px solid #ff6b6b";
        checkbox.style.outlineOffset = "2px";
        setTimeout(() => {
          if (checkbox) {
            checkbox.style.outline = "";
            checkbox.style.outlineOffset = "";
          }
        }, 2000);
      }
      return;
    }

    // 2. Proceed with agreement
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:4000/user/accept-terms', {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        await checkAuth();
        // Show success message
        setError("✅ Terms accepted! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      } else {
        setError(data.error || 'Failed to accept terms. Please try again.');
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error('Error accepting terms:', error);
    } finally {
      setIsLoading(false);
    }
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
        
        {/* General error shows at top (for network/backend errors) */}
        {error && (
          <div className={`disclaimer-message ${error.includes("✅") ? "disclaimer-success" : "disclaimer-error"}`}>
            {error}
          </div>
        )}
        
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

        {/* Checkbox section with error below */}
        <div className="checkbox-container">
          <div className="checkbox-wrapper">
            <input 
              type="checkbox" 
              id="agree-checkbox" 
              required 
              disabled={isLoading}
            />
            <label htmlFor="agree-checkbox" className="checkbox-label">
              I have read, understood, and agree to the terms above
            </label>
          </div>
          
          {/* Checkbox error shows RIGHT BELOW the checkbox */}
          {checkboxError && (
            <div className="checkbox-error">
              {checkboxError}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="disclaimer-actions">
          <button 
            className="disclaimer-button agree-button" 
            onClick={handleAgree}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "I Agree & Continue"}
          </button>
          <button 
            className="disclaimer-button disagree-button" 
            onClick={handleDisagree}
            disabled={isLoading}
          >
            I Do Not Agree
          </button>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
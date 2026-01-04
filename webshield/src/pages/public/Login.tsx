// pages/public/Login.tsx - SIMPLIFIED VERSION
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../../api/auth-api";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState(""); // Only for "user not found"
  const [passwordError, setPasswordError] = useState(""); // Only for "wrong password"
  const [formError, setFormError] = useState(""); // For other errors

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear ALL previous errors
    setEmailError("");
    setPasswordError("");
    setFormError("");

    try {
      setLoading(true);

      const response = await LoginUser({ email, password });

      if (response.data.success) {
        // Show success message in UI
        setFormError("✅ Login successful! ");
        
        setTimeout(() => {
          if (response.data.user.agreedToTerms) {
            navigate("/dashboard");
          } else {
            navigate("/disclaimer");
          }
        }, 1500);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const backendError = error?.response?.data?.error || "";
      
      // Check backend error messages and show under correct field
      if (backendError.includes("not found") || 
          backendError.includes("no user") ||
          backendError.includes("User not found") ||
          backendError.includes("email not registered")) {
        // Show under email field
        setEmailError("This email is not registered. Please sign up first.");
      } 
      else if (backendError.includes("Invalid") || 
               backendError.includes("incorrect") ||
               backendError.includes("wrong password") ||
               backendError.includes("Invalid credentials")) {
        // Show under password field  
        setPasswordError("Incorrect password. Please try again.");
      }
      else if (backendError.includes("rate") || 
               backendError.includes("limit") ||
               backendError.includes("too many")) {
        setFormError("Too many login attempts. Please wait 5 minutes.");
      }
      else {
        setFormError(backendError || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        {/* General errors (rate limits, network) */}
        {formError && (
          <div className={`message ${formError.includes("✅") ? "success-message" : "error-message"}`}>
            {formError}
          </div>
        )}

        {/* Email field - NO real-time validation */}
        <div className="form-group">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={emailError ? "input-error" : ""}
            disabled={loading}
          />
          {/* Only show if user doesn't exist */}
          {emailError && <div className="field-error">{emailError}</div>}
        </div>

        {/* Password field - NO real-time validation */}
        <div className="form-group">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? "input-error" : ""}
            disabled={loading}
          />
          {/* Only show if password is wrong */}
          {passwordError && <div className="field-error">{passwordError}</div>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </button>

        <div className="auth-footer">
          <div style={{ marginBottom: '10px' }}>
            <a href="/forgot-password" style={{ fontSize: '0.9rem' }}>
              Forgot Password?
            </a>
          </div>
          New here? <a href="/signup">Create account</a>
        </div>
      </form>
    </div>
  );
}

export default Login;
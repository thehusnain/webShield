/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginUser } from "../../api/auth-api";
import { isValidEmail, isStrongPassword } from "../../utils/validators";
import "../../styles/auth.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      setError("Invalid email format");
      return;
    }

    if (!isStrongPassword(password)) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await LoginUser({ email, password });

      setError("Login successful");
      navigate("/disclaimer");
    } catch (error: any) {
      setError(error?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>

        <div className="auth-footer">
          New here? <a href="/signup">Create account</a>
        </div>
      </form>
    </div>
  );
}

export default Login;

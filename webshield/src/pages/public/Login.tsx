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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      alert("Invalid email format");
      return;
    }

    if (!isStrongPassword(password)) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await LoginUser({ email, password });

      alert("Login successful");
      navigate("/disclaimer");
    } catch (error: any) {
      alert(error?.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="auth-container">
    <form className="auth-card" onSubmit={handleSubmit}>
      <h2>Login</h2>

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

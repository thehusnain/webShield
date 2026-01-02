import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../api/auth-api.ts";
import {
  isValidEmail,
  isStrongPassword,
  isValidUsername,
} from "../../utils/validators";

 import "../../styles/auth.css";

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // FRONTEND VALIDATION
    if (!isValidUsername(username)) {
      alert("Username must be at least 3 characters");
      return;
    }

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

      const response = await signupUser({
        username,
        email,
        password,
      });

      alert("Account created successfully");
      navigate("/login"); // FLOW: signup → login
    } catch (error: any) {
      alert(error?.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="auth-container">
    <form className="auth-card" onSubmit={handleSubmit}>
      <h2>Create Account</h2>

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

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
        {loading ? "Creating..." : "Sign Up"}
      </button>

      <div className="auth-footer">
        Already have an account? <a href="/login">Login</a>
      </div>
    </form>
  </div>
);
}
export default Signup;

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail } from '../utils/validation';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // In Login.tsx, update the handleSubmit function:
  // In Login.tsx
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    try {
      // Get the response from login
      const response = await login(email, password);

      // Check if user is admin from the response
      if (response?.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />

      <div className="relative w-full max-w-md">
        <div className="card p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center cyber-glow">
              <span className="text-4xl">🛡️</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-center mb-2">
            <span className="text-gradient">Welcome Back</span>
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Login to your WebShield account
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              icon={<span className="text-xl">📧</span>}
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              icon={<span className="text-xl">🔒</span>}
              required
            />

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
              Login
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-3">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              <Link to="/forgot-password" className="text-primary hover:text-primary-dark">
                Forgot Password?
              </Link>
            </p>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary-dark font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

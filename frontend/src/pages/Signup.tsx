import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { validateEmail, validatePassword, validateUsername } from '../utils/validation';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    try {
      await signup(formData.username, formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      setErrors({ submit: error.message });
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
            <span className="text-gradient">Create Account</span>
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            Join WebShield and start securing websites
          </p>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              icon={<span className="text-xl">👤</span>}
              error={errors.username}
              required
            />

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              icon={<span className="text-xl">📧</span>}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={<span className="text-xl">🔒</span>}
              error={errors.password}
              required
            />

            <p className="text-xs text-gray-500 dark:  text-gray-500 -mt-4">
              8+ characters, uppercase, lowercase, number, special character
            </p>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              icon={<span className="text-xl">🔒</span>}
              error={errors.confirmPassword}
              required
            />

            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                <p className="text-sm text-red-500">{errors.submit}</p>
              </div>
            )}

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
              Sign Up
            </Button>
          </form>

          <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover: text-primary-dark font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, type FormEvent, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { HiLockClosed } from 'react-icons/hi';
import { validatePassword } from '../utils/validation';
import { authAPI } from '../services/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Reset token is missing');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      console.log('Resetting password with token');
      const response = await authAPI.resetPassword(token, newPassword);

      console.log('Reset password response:', response);

      if (response.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(response.error || 'Failed to reset password');
      }
    } catch (err: any) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="page-container min-h-screen flex items-center justify-center p-4">
        <div className="card p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2 text-red-500">Invalid Reset Link</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link to="/forgot-password">
            <Button variant="primary" className="w-full">
              Request New Reset Link
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

          {!success ? (
            <>
              {/* Title */}
              <h2 className="text-3xl font-bold text-center mb-2">
                <span className="text-gradient">Reset Password</span>
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
                Enter your new password
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  icon={<HiLockClosed className="w-5 h-5" />}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  icon={<HiLockClosed className="w-5 h-5" />}
                  required
                />

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
                    <p className="text-sm text-red-500">{error}</p>
                  </div>
                )}

                <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                    <li>One special character</li>
                  </ul>
                </div>

                <Button type="submit" variant="primary" isLoading={loading} className="w-full">
                  Reset Password
                </Button>
              </form>

              {/* Back to login */}
              <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:text-primary-dark font-semibold">
                  Login
                </Link>
              </p>
            </>
          ) : (
            <>
              {/* Success message */}
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold mb-2 text-gradient">Password Reset Successful</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Your password has been reset successfully. You will be redirected to login page
                  shortly.
                </p>
                <Link to="/login">
                  <Button variant="primary" className="w-full">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

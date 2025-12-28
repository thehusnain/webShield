// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain number';
  }
  if (!/[@$!%*?&]/.test(password)) {
    return 'Password must contain special character';
  }
  return null;
}

// Validate username
export function validateUsername(username: string): string | null {
  if (username.length < 3) {
    return 'Username must be at least 3 characters';
  }
  if (username.length > 30) {
    return 'Username must be less than 30 characters';
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return 'Username can only contain letters, numbers, underscore, hyphen';
  }
  return null;
}

// Validate URL format
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/* eslint-disable no-useless-escape */
export const isValidUsername = (username: string) => {
  return username.length >= 3;
};

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isStrongPassword = (password: string) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  let strength = 'weak';
  
  if (passed >= 4) strength = 'medium';
  if (passed === 5) strength = 'strong';
  
  return {
    isValid: checks.length && checks.uppercase && checks.lowercase && checks.number && checks.special,
    strength,
    details: checks
  };
};
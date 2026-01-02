export const isValidUsername = (username: string) => {
  return username.length >= 3;
};

export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isStrongPassword = (password: string) => {
  return password.length >= 8;
};

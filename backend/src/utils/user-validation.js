export async function userValidation(req, res, next) {
  const { email, password, username } = req.body;
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const validEmail = emailRegex.test(email);
  const passwordRegex= /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const validPassword = passwordRegex.test(password);
  const validUsername = username && username.length >= 3; 
  
  if (validEmail && validPassword && validUsername) {
    next();
  } else {
    res.status(400).json({ 
      error: "Invalid user data",
      details: {
        email: validEmail ? "Valid" : "Invalid email format",
        password: validPassword ? "Valid" : "Password must contain: 8+ chars, uppercase, lowercase, number, special character",
        username: validUsername ? "Valid" : "Username must be at least 3 characters"
      }
    });
  }
}
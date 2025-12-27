import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function checkAuth(req, res, next) {
  const cookies = req.cookies;

  // Check if token exists
  if (!cookies.token) {
    return res.status(401).json({ 
      success: false,
      error: "You are not logged in" 
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt. verify(cookies.token, process. env.JWT_SECRET);
    console.log("User Verified:", decoded.username); 

    req.user = decoded;
    next();

  } catch (error) {
    // Handle token expiration
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: "Session expired, please login again" 
      });
    }

    // Handle invalid token
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid session token" 
      });
    }

    // Handle other JWT errors
    console.error("Token verification failed:", error.message); 
    return res.status(401).json({ 
      success: false, 
      error: "Authentication failed" 
    });
  }
}
import express from "express";
import {
  loginValidation,
  signUpValidation,
} from "../utils/validations/user-validation.js";
import { checkUser, addUser } from "../controllers/users-controller.js";
import { checkAuth } from "../middlewares/user-auth.js";
import { User } from "../models/users-mongoose.js";

const userRouter = express.Router();

// SIGNUP ROUTE
userRouter.post("/signup", signUpValidation, async (req, res) => {
  try {
    const user = req. body;
    const response = await addUser(user);

    // Check if signup failed
    if (response.error) {
      return res.status(400).json({
        success: false,
        error: response.error
      });
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        username: response.username,
        email: response.email
      }
    });
  } catch (error) {
    console.error("Signup error:", error. message);
    res.status(500).json({
      success: false,
      error: "Failed to create account"
    });
  }
});

// LOGIN ROUTE
userRouter.post("/login", loginValidation, async (req, res) => {
  try {
    const user = req. body;
    const response = await checkUser(user);

    // Check if login failed
    if (response.error) {
      return res.status(401).json({
        success: false,
        error: response.error
      });
    }

    // Set secure cookie
    res.cookie("token", response.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:  'strict', // CSRF protection
      maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
      path: '/' // Available on all routes
    });

    res.json({
      success: true,
      message: "Logged in successfully",
      user: response.user // Include user info
    });
  } catch (error) {
    console.error("Login error:", error. message);
    res.status(500).json({
      success: false,
      error: "Login failed"
    });
  }
});

// PROFILE ROUTE
userRouter.get("/profile", checkAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
        scanLimit: user.scanLimit || 5,
        scansUsed: user.usedScan || 0,
        scansRemaining: (user.scanLimit || 5) - (user.usedScan || 0),
      },
    });
  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve profile"
    });
  }
});

// LOGOUT ROUTE
userRouter.post("/logout", (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      success: false,
      error: "Logout failed"
    });
  }
});

export default userRouter;
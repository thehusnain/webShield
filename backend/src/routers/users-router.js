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
    const user = req.body;

    console.log("=== SIGNUP REQUEST ===");
    console.log("Username:", user.username);
    console.log("Email:", user.email);

    const response = await addUser(user);

    // Check if signup failed
    if (response.error) {
      console.log("Signup failed:", response.error);
      return res.status(400).json({
        success: false,
        error: response.error,
      });
    }

    console.log("Signup successful for:", response.username);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: {
        username: response.username,
        email: response.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to create account",
    });
  }
});

// LOGIN ROUTE
userRouter.post("/login", loginValidation, async (req, res) => {
  try {
    const user = req.body;

    console.log("=== LOGIN REQUEST ===");
    console.log("Email/Username:", user.email || user.emailOrUsername);
    console.log("Request origin:", req.headers.origin);
    console.log("Request host:", req.headers.host);

    const response = await checkUser(user);

    if (!response.success || response.error) {
      console.log("Login failed:", response.error);
      return res.status(401).json({
        success: false,
        error: response.error,
      });
    }

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax", // LAX not strict
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    };

    res.cookie("token", response.token, cookieOptions);

    console.log("Login successful");
    console.log(
      " Cookie set:",
      "token=" + response.token.substring(0, 20) + "..."
    );
    console.log(" Cookie options:", JSON.stringify(cookieOptions));

    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        _id: response.user._id || response.user.userId,
        userId: response.user.userId || response.user._id,
        username: response.user.username,
        email: response.user.email,
        role: response.user.role,
        scanLimit: response.user.scanLimit,
        scansUsed: response.user.scansUsed || 0,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

// PROFILE ROUTE
userRouter.get("/profile", checkAuth, async (req, res) => {
  try {
    console.log("=== PROFILE REQUEST ===");
    console.log("User ID:", req.user.userId);

    const user = await User.findById(req.user.userId);

    if (!user) {
      console.log("User not found");
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("Profile retrieved for:", user.username);

    res.json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        _id: user._id,
        userId: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        scanLimit: user.scanLimit || 10,
        scansUsed: user.usedScan || 0,
        scansRemaining: (user.scanLimit || 10) - (user.usedScan || 0),
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error(" Profile error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve profile",
    });
  }
});

// LOGOUT ROUTE
userRouter.post("/logout", (req, res) => {
  try {
    console.log("=== LOGOUT REQUEST ===");

    // Clear cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    console.log(" Logout successful, cookie cleared");

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
  }
});
// Accept terms route
userRouter.post("/accept-terms", checkAuth, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's IP
    const userIP =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;

    // Update user
    await User.findByIdAndUpdate(userId, {
      agreedToTerms: true,
      termsAcceptedAt: new Date(),
      termsAcceptedIP: userIP,
    });

    console.log(` User ${userId} accepted terms from IP ${userIP}`);

    res.json({
      success: true,
      message: "Terms accepted successfully",
    });
  } catch (error) {
    console.error("Error accepting terms:", error);
    res.status(500).json({
      success: false,
      error: "Failed to accept terms",
    });
  }
});

export default userRouter;

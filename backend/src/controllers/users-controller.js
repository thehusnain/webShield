import { createUser, verifyUser } from "../models/users-model.js";
import { User } from "../models/users-mongoose.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
export async function addUser(user) {
  try {
    const result = await createUser(user);
    return result;
  } catch (error) {
    return { error: error.message };
  }
}

export async function checkUser(user) {
  try {
    // ✅ Accept both "email" and "emailOrUsername"
    const identifier = user.emailOrUsername || user.email || user.username;
    const password = user.password;

    if (!identifier) {
      return {
        success: false,
        error: "Email or username is required"
      };
    }

    if (!password) {
      return {
        success: false,
        error: "Password is required"
      };
    }

    const userExists = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!userExists) {
      return {
        success: false,
        error: "User does not exist",
      };
    }

    // COMPARING PASSWORD
    const isPasswordValid = await bcrypt.compare(password, userExists.password);

    if (isPasswordValid) {
      const token = jwt.sign(
        {
          username: userExists.username,
          email: userExists.email,
          role: userExists.role,
          userId: userExists._id,
        },
        process.env.JWT_SECRET,
        { expiresIn: "2d" }
      );
      return {
        success: true,
        message: "You are logged in",
        token:  token,
        user: {
          username: userExists.username,
          email: userExists. email,
          role: userExists.role
        },
      };
    } else {
      return {
        success:  false,
        error: "Your password is incorrect",
      };
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return {
      success: false,
      error: "Internal server error during verification",
    };
  }
}
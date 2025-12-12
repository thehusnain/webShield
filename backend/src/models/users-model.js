import bcrypt from "bcrypt";
import { User } from "./users-mongo.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// CREATING USER WHEN SIGN UP
export async function createUser(user) {
  try {
    const exsitingUser = await User.findOne({
      $or: [{ username: user.username }, { email: user.email }],
    });

    // CHECKING USER WITH USERNAME ARE THEY ALREADY EXISTS
    if (exsitingUser) {
      if (exsitingUser.username === user.username) {
        throw new Error("Username already exists");
      }
      if (exsitingUser.email === user.email) {
        throw new Error("Email already exists");
      }
    }

    // ENCRYPTING PASSWORD
    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(user.password, salt);

    const newUser = new User({
      username: user.username,
      email: user.email,
      password: hashedPass,
    });

    const savedUser = await newUser.save();
    return savedUser;
  } catch (error) {
    console.error("Error saving User:", error.message);
    throw error;
  }
}

// VERIFYING USE WHILE SIGNNING IN
export async function verifyUser(user) {
  try {
    const identifier = user.emailOrUsername;
    const password = user.password;

    const userExists = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!userExists) {
      return {
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
        token: token,
        user: {
          username: userExists.username,
          email: userExists.email,
        },
      };
    } else {
      return {
        success: false,
        error: "Your password is incorrect",
      };
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    return {
      error: "Internal server error during verification",
    };
  }
}

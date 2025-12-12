import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// import { User } from "../models/users-mongo.js";
dotenv.config();

export async function checkAuth(req, res, next) {
  const cookies = req.cookies;

  if (!cookies.token) {
    return res.status(401).json({ error: "you are not logged in" });
  }

  try {
    const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
    console.log("User Verified", decoded);

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token Verification failed: ", error);
    return res.status(401).json({ error: "Invalid token!" });
  }
}

import bcrypt from "bcrypt";
import { User } from "./users-mongo.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function createUser(user){
    try {
        const exsitingUser = await User.findOne({
            $or: [
                {username : user.username},
               { email : user.email  }
            ]
        });
        if (exsitingUser){
            if (exsitingUser.username === user.username){
                throw new Error("Username already exists");
            } 
             if (exsitingUser.email === user.email){
                throw new Error("Email already exists");
            } 
        }

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(user.password,salt);
        const newUser = new User({
            username : user.username,
            email : user.email,
            password : hash
        });
        const savedUser = await newUser.save();
        return savedUser;           
    } catch (error) {
    console.error("Error saving User:", error.message);
    throw error;
}
}

export async function verifyUser(user) {
    try {
        const email = user.email;
        const password = user.password;
        
        // Find user by email
        const userExists = await User.findOne({ email: email });
        
        if(!userExists){
            return {
                error: "User does not exist"
            };
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, userExists.password);
        
        if(isPasswordValid){
            const token = jwt.sign(
                {
                    username : userExists.username,
                    email : userExists.email,
                    role : userExists.role,
                    userId : userExists._id
                },
                process.env.JWT_SECRET,
                { expiresIn : '7d' }
            );
        return {
        success: true,  
        message: "You are logged in",
        token: token,
        user: {
            username: userExists.username,
            email: userExists.email
        }
    };
}
        else {
        return {
        success: false,  
        error: "Your password is incorrect"
    };
}
        
        } catch (error) {
            console.error("Error verifying user:", error);
            return {
                error: "Internal server error during verification"
            };
        }
    }

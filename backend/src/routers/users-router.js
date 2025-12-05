import express from "express";
import { userValidation } from "../utils/validations/user-validation.js";
import { checkUser,addUser } from "../controllers/users-controller.js";
import { checkAuth } from "../middlewares/auth.js";
import { User } from "../models/users-mongo.js";

const userRouter = express.Router();

userRouter.post("/signup",  userValidation,async (req,res) => {
    const user = req.body;
    const respose = await addUser(user);
    res.send({
        data : respose
    });
});
userRouter.post("/login",userValidation, async (req, res) => {
    const user = req.body;
    const response = await checkUser(user);
    if (response.error) {
    res.send({
      data: response,
    });
  } else {
    console.log("RESPONSE IS: ", response);
    res.cookie("token", response.token, {
      httpOnly: true,
    });
    res.send({
      data: response.message,
    });
  }
});

userRouter.get("/profile", checkAuth, async (req,res) => {
    const user = await User.findById(req.user.userId);
    
    res.json({
        message: "Welcome to your profile",
        user: {
            username: user.username,
            email: user.email,
            role: user.role,
            scanLimit: user.scanLimit || 5,
            scansUsed: user.usedScan || 0,  
            scansRemaining: (user.scanLimit || 5) - (user.usedScan || 0)
        }
    });
});

userRouter.get("/admin", checkAuth , (req,res) => {
  if(req.user.role === "admin"){
     res.json({message : "Welcome Admin! "});
  }else {
   res.json({error : "Admin access is required"});
  }
});

userRouter.post("/logout", (req,res) => {
  res.clearCookie("token");
  res.json({
    success : true,
    message : "Logged out Successfully"
  });
});



export default userRouter;
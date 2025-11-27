import express from "express";
import { userValidation } from "../utils/user-validation.js";
import { checkUser,addUser } from "../controllers/users-controller.js";
import { checkAuth } from "../middlewares/auth.js";

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

userRouter.get("/profile", checkAuth, (req,res) => {
  res.json({
    message : "welcome to your profile",
    user : req.user
  });
});

userRouter.get("/admin", checkAuth , (req,res) => {
  if(req.user.role === "admin"){
    res.json({message : "Welcome Admin! "});
  } else {
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
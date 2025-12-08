import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRouter from "./routers/users-router.js";
import cookieParser from "cookie-parser";
import scanRouter from "./routers/scans-router.js";
import authRouter from "./routers/auth-router.js";
import oauthRouter from "./routers/oAuth-router.js";
import { passport } from './utils/oAuth-config.js'; 
dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

connectDB();

app.use("/user", userRouter);
app.use("/scan",scanRouter);
app.use("/auth",authRouter);
app.use("/auth/oauth",oauthRouter);

app.get('/', (req,res) => {
    res.json({message : "WebSheild Backend server is running"});
});

app.listen(port, () => {
    console.log('server is runing in 4000')
})
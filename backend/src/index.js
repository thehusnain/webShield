import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import userRouter from "./routers/users-router.js";
import cookieParser from "cookie-parser";
import scanRouter from "./routers/scans-router.js";


dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

// DATABASE CONNECTIVITY
connectDB();

// ROUTES 
app.use("/user", userRouter);
app.use("/scan",scanRouter);

app.get('/', (req,res) => {
    res.json({message : "WebSheild Backend server is running"});
});

app.listen(port, () => {
    console.log('server is runing in 4000')
})
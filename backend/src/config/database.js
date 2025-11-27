import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";

const app = express();
dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DB_URL);
        console.log("Database is connected a successfully")
    } catch (error) {
        console.error("The error of connecting database is",error);
        setInterval(connectDB,30000);  
        app.use((req,res) => {
            res.status(503).json({message : "Service is temporarily Unavailable"});

        });

    };
};
export default connectDB;
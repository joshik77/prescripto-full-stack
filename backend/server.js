import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

// App config
const app = express();
const port = process.env.PORT || 4000;

// Database & Cloudinary
connectDB();
connectCloudinary();

// Middlewares
app.use(express.json());
app.use(cors());

// API endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

// Test API
app.get("/", (req, res) => {
    res.send("API Working");
});

// Start server
app.listen(port, () => {
    console.log(`Server started on PORT:${port}`);
});
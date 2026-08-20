import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";

const app = express();

const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(express.json());
app.use(cors());

app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);

app.get("/", (req, res) => {
    res.status(200).send("API Working");
});

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy"
    });
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server started on PORT:${port}`);
});
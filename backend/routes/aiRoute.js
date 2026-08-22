import express from "express";

import {
    aiChat
} from "../controllers/aiController.js";


const aiRouter =
    express.Router();


aiRouter.post(
    "/chat",
    aiChat
);


export default aiRouter;
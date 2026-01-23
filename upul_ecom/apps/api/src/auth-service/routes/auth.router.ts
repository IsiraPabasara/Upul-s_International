import { Router } from "express";
import { userRegistration } from "../src/auth-service.js";

export const authRouter = Router();

authRouter.post("/register", userRegistration);


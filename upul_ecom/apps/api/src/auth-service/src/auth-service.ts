import type { NextFunction, Request, Response } from "express";
import { checkOtpRestrictions, sendOtp, trackOtpRequests, validateRegistrationData } from "./utils/auth.helper.js";

import { ValidationError } from "../../../../../packages/error-handler/index.js";
import prisma from "../../../../../packages/libs/prisma/index.js";



export const userRegistration = async (req: Request, res: Response, next: NextFunction) => {

    /* #swagger.parameters['body'] = {
            in: 'body',
            description: 'User registration data',
            schema: {
                $name: 'saminu',
                $email: 'saminuhansaja.w@gmail.com',
                $password: '123456'
            }
    } */

    try {
        validateRegistrationData(req.body, "user");

        const {name, email} = req.body;

        const existingUser = await prisma.users.findUnique({where: {email}});

        if(existingUser) {
            throw new ValidationError("User already exists with this email!");
        }

        await checkOtpRestrictions(email); 
        await trackOtpRequests(email);
        await sendOtp(name, email, "user-activation-mail");

        res.status(200).json({
            message: "OTP sent to email. Please verify your account.",
        })

    } catch (error) {
        return next(error);
    }
}

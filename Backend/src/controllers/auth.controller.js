import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

/**
 * @desc Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export async function register(req, res) {
    try {

        console.log("========= REGISTER START =========");
        console.log(req.body);

        const { username, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        console.log("Existing user:", isUserAlreadyExists);

        const user = await userModel.create({
            username,
            email,
            password
        });

        console.log("User created:", user);

        return res.status(201).json({
            success: true,
            user
        });

    } catch (err) {

        console.log("REGISTER ERROR");
        console.log(err);

        return res.status(500).json({
            success: false,
            err: err.message
        });

    }
}

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export async function login(req, res) {

    try {

        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
            });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
                success: false,
            });
        }

        // Email verification temporarily disabled

        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            err: err.message,
        });

    }
}

/**
 * @desc Get current logged in user
 * @route GET /api/auth/get-me
 * @access Private
 */
export async function getMe(req, res) {
    try {
        console.log("TOKEN DATA:", req.user);

        const userId = req.user.id;
        console.log("USER ID:", userId);

        const user = await userModel.findById(userId).select("-password");
        console.log("DB USER:", user);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        return res.status(200).json({
            message: "User fetched successfully",
            success: true,
            user,
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            err: err.message,
        });
    }
}

/**
 * @desc Verify Email
 * @route GET /api/auth/verify-email
 * @access Public
 */
export async function verifyEmail(req, res) {

    try {

        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                message: "Token is required",
                success: false,
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({
            email: decoded.email,
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        user.verified = true;

        await user.save();

        return res.send(`
            <h1>Email Verified Successfully ✅</h1>

            <p>Your email has been verified.</p>

            <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/login">
                Go to Login
            </a>
        `);

    } catch (err) {

        console.error(err);

        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message,
        });

    }
}
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Validation check
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const user = await User.create({
            fullName,
            email,
            password,
        });

        const createdUser = await User.findById(user._id).select("-password");

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: createdUser
        });
    } catch (error) {
        console.error("REGISTER_ERROR:", error); 
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user || !(await user.isPasswordCorrect(password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Create JWT Token
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables.");
            return res.status(500).json({ message: "Internal server configuration error" });
        }

        const token = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );

        const loggedInUser = user.toObject();
        delete loggedInUser.password;

        res.status(200).json({
            success: true,
            token,
            user: loggedInUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
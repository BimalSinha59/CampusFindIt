import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        if (!process.env.JWT_SECRET) {
            console.error("CRITICAL ERROR: JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ message: "Internal server configuration error" });
        }

        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: Missing or malformed token" });
        }

        const token = authHeader.replace("Bearer ", "");

        // Verify token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decodedToken._id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User no longer exists" });
        }

        req.user = user; 
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired", expiredAt: error.expiredAt });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid access token" });
        }
        
        console.error("JWT Verification Middleware Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
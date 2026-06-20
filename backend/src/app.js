import express from "express";
import cors from "cors";
import itemRouter from "./routes/item.routes.js";
import claimRouter from "./routes/claim.routes.js";
import userRouter from "./routes/user.routes.js";
import chatRoutes from './routes/chat.routes.js';
import uploadRouter from './routes/upload.routes.js';
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config({
    path: './.env',
    quiet: true
})

const app = express();

// CORS handling
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// Create the HTTP Server
const server = http.createServer(app);

// Initialize Socket.io on the 'server' instance
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    },
    allowEIO3: true
});

// ─── Socket.io JWT Middleware ───────────────────────────────────────────────
// This runs before EVERY socket connection is accepted.
// It reads the token from socket.handshake.auth.token (sent by the frontend),
// verifies it, and attaches the decoded user to socket.user.
// If the token is missing or invalid, the connection is rejected immediately.
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
        // Allow connection without token but socket.user will be undefined.
        // This handles unauthenticated pages gracefully instead of hard-rejecting.
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; // now available inside all socket event handlers
        next();
    } catch (err) {
        // Token invalid or expired — reject the connection
        return next(new Error("Invalid or expired token"));
    }
});

// ─── Socket.io Connection Handler ───────────────────────────────────────────
io.on("connection", (socket) => {

    // If this socket belongs to an authenticated user,
    // join them into their personal notification room: "user:<userId>"
    // This is how we send targeted notifications to a specific user.
    if (socket.user?._id) {
        socket.join(`user:${socket.user._id}`);
    }

    // Chat room join — for item-specific chat rooms
    socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
    });

    // Chat message broadcast — emit to the specific chat room only
    socket.on("send_message", (data) => {
        io.to(data.conversationId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
        // Socket.io automatically removes the socket from all rooms on disconnect
    });
});

// Routes
app.get('/', (req, res) => {
    res.send("server is working");
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1/items", itemRouter);
app.use("/api/v1/claims", claimRouter);
app.use("/api/v1/chats", chatRoutes);
app.use('/api/v1', uploadRouter);

export { app, server, io };
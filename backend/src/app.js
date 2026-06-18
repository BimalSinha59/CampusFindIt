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
    quiet:true 
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
    // Adding this helps prevent some polling-related 404s
    allowEIO3: true 
});

io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded; 
        next();
    } catch (err) {
        next(new Error("Invalid token"));
    }
});

io.on("connection", (socket) => {
    
    socket.on("join_chat", (conversationId) => {
        socket.join(conversationId);
    });

    socket.on("send_message", (data) => {
        io.to(data.conversationId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
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
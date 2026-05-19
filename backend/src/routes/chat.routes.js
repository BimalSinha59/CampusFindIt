import express from "express";
import { 
    createConversation, 
    getMessages, 
    sendMessage, 
    getUserConversations 
} from "../controllers/chat.controller.js";

const router = express.Router();

// Initializes a chat between Reporter and Claimant using a Claim ID.
router.post("/conversation", createConversation);

// Fetches all chat rooms for a user
router.get("/user/:userId", getUserConversations);

// Retrieves message history for a specific chat room.
router.get("/messages/:conversationId", getMessages);

// Saves a new message and updates the "lastMessage" preview for the sidebar.
router.post("/message", sendMessage);

export default router;
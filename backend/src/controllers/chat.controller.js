import { Conversation, Message } from "../models/chat.model.js";
import { Claim } from "../models/claim.model.js";

export const createConversation = async (req, res) => {
    try {
        const { claimId } = req.body;

        if (!claimId) {
            return res.status(400).json({ success: false, message: "Claim ID is required" });
        }

        const claim = await Claim.findById(claimId).populate("item");

        if (!claim) {
            return res.status(404).json({ success: false, message: "Claim not found" });
        }

        // Participants: [Reporter, Claimant]
        const participants = [claim.item.owner, claim.claimant];

        // Check if a conversation already exists for this specific claim
        let conversation = await Conversation.findOne({ claimId })
            .populate("participants", "fullName profileImage")
            .populate("item", "title image");

        if (!conversation) {
            conversation = await Conversation.create({
                participants,
                item: claim.item._id,
                claimId: claim._id,
                lastMessage: "New claim conversation started"
            });
            
            // Re-populate for the frontend
            conversation = await Conversation.findById(conversation._id)
                .populate("participants", "fullName profileImage")
                .populate("item", "title image");
        }

        res.status(200).json(conversation);
    } catch (error) {
        console.error("Create Conversation Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Get all conversations for a specific user
export const getUserConversations = async (req, res) => {
    try {
        const { userId } = req.params;

        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        })
        .populate("participants", "fullName profileImage") 
        .populate("item", "title image")
        .sort({ updatedAt: -1 });

        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching conversations" });
    }
};

// Save a message and update conversation preview
export const sendMessage = async (req, res) => {
    try {
        const { conversationId, sender, text } = req.body;

        if (!sender || !text || !conversationId) {
            return res.status(400).json({ success: false, message: "Missing required message fields" });
        }

        const newMessage = await Message.create({
            conversationId,
            sender,
            text
        });

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text,
        }, { returnDocument: 'after', timestamps: true });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Send Message Error:", error);
        res.status(500).json({ success: false, message: "Error sending message" });
    }
};

// Get messages for a specific conversation
export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching messages" });
    }
};
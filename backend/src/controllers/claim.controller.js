import { Claim } from "../models/claim.model.js";
import { Item } from "../models/item.model.js";
import { Conversation, Message } from "../models/chat.model.js";
import { io } from "../app.js";

// Create a new claim request
export const createClaim = async (req, res) => {
    try {
        
        const { item, answer, proofImage } = req.body;
        const claimant = req.user._id;

        const targetItem = await Item.findById(item);
        if (!targetItem) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        if (targetItem.owner.toString() === claimant.toString()) {
            return res.status(400).json({ success: false, message: "You cannot claim your own reported item" });
        }

        const existingClaim = await Claim.findOne({ item, claimant });
        if (existingClaim) {
            return res.status(400).json({ success: false, message: "You have already submitted a claim for this item" });
        }

        const claim = await Claim.create({
            item,
            claimant,
            answer,
            proofImage
        });

        // Fire notification to the item owner's personal socket room.
        // The owner joined "user:<ownerId>" automatically in app.js when they connected.
        // req.user.fullName is available because verifyJWT fetches the full User document.
        io.to(`user:${targetItem.owner}`).emit("new_notification", {
            type: "NEW_CLAIM",
            message: `${req.user.fullName} submitted a claim for your item: "${targetItem.title}"`,
            claimId: claim._id,
            itemId: targetItem._id
        });

        res.status(201).json({ success: true, data: claim });
    } catch (error) {
        console.error("createClaim error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all claims received for items posted BY the current user (Reporter's Dashboard)
export const getMyItemsClaims = async (req, res) => {
    try {
        const { userId } = req.params;
        const myItems = await Item.find({ owner: userId }).select('_id');
        const itemIds = myItems.map(item => item._id);

        const claims = await Claim.find({ item: { $in: itemIds } })
            .populate("item", "title image itemType location")
            .populate("claimant", "fullName email avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: claims });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all claims submitted BY the current user (Claimant's Tracking Page)
export const getMySubmittedClaims = async (req, res) => {
    try {
        const { userId } = req.params;
        const claims = await Claim.find({ claimant: userId })
            .populate("item", "title image itemType status location")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: claims });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update claim status (APPROVED / REJECTED)
export const updateClaimStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedClaim = await Claim.findByIdAndUpdate(
            id,
            { status },
            { returnDocument: 'after' }
        );

        if (!updatedClaim) {
            return res.status(404).json({ message: "Claim not found" });
        }

        res.status(200).json(updatedClaim);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a claim and clean up associated conversation + messages
export const deleteClaim = async (req, res) => {
    try {
        const { claimId } = req.params;

        const conversation = await Conversation.findOneAndDelete({ claimId });
        if (conversation) {
            await Message.deleteMany({ conversationId: conversation._id });
        }

        const deletedClaim = await Claim.findByIdAndDelete(claimId);
        if (!deletedClaim) {
            return res.status(404).json({ success: false, message: "Claim not found" });
        }

        res.status(200).json({ success: true, message: "Claim and associated data deleted." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
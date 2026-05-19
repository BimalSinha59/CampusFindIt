import { Item } from "../models/item.model.js";
import { Claim } from "../models/claim.model.js";
import { Conversation } from "../models/chat.model.js"; 

// Create a new lost/found item
export const createItem = async (req, res) => {
    try {
        const { title, description, itemType, category, location, image, aiTags, owner, claimQuestion } = req.body;

        if (!title || !itemType || !image || !owner) {
            return res.status(400).json({ success: false, message: "Required fields are missing" });
        }

        const item = await Item.create({
            title,
            description,
            itemType,
            category,
            location,
            image,
            aiTags,
            owner,
            claimQuestion,
            status: "ACTIVE"
        });

        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all active items
export const getAllItems = async (req, res) => {
    try {
        // Only fetch items that are still ACTIVE
        const items = await Item.find({ status: "ACTIVE" })
            .populate("owner", "fullName email avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single item by ID
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate("owner", "fullName email avatar");
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });
        
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Item (Mark as Returned/Resolved) - Cascade Delete
export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        await Claim.deleteMany({ item: itemId });

        await Conversation.deleteMany({ item: itemId });

        await Item.findByIdAndDelete(itemId);

        res.status(200).json({ 
            success: true, 
            message: "Item resolved and all associated data deleted successfully." 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
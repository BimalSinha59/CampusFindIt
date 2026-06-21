import { Item } from "../models/item.model.js";
import { Claim } from "../models/claim.model.js";
import { Conversation } from "../models/chat.model.js";

// Create a new lost/found item
export const createItem = async (req, res) => {
    try {
        const { title, description, itemType, category, location, image, aiTags, claimQuestion } = req.body;
        const owner = req.user._id; // from verifyJWT — never from body

        if (!title || !itemType || !image) {
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
        const items = await Item.find({ status: "ACTIVE" })
            .populate("owner", "fullName email avatar")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Search items using MongoDB text index + optional filters
// GET /api/v1/items/search?q=blue+bag&itemType=FOUND&category=Electronics
export const searchItems = async (req, res) => {
    try {
        const { q, itemType, category } = req.query;

        // Base filter — only search ACTIVE items
        const filter = { status: "ACTIVE" };

        // Full-text search across title + description + aiTags
        // The text index in item.model.js makes this fast even at scale
        if (q && q.trim()) {
            filter.$text = { $search: q.trim() };
        }

        // Optional narrow-down filters
        if (itemType) filter.itemType = itemType;
        if (category) filter.category = category;

        // If text query provided, sort by relevance score (most relevant first)
        // Otherwise sort by newest first — same as getAllItems
        const sortOption = (q && q.trim())
            ? { score: { $meta: "textScore" } }
            : { createdAt: -1 };

        // Project textScore only when doing a text search
        const projection = (q && q.trim())
            ? { score: { $meta: "textScore" } }
            : {};

        const items = await Item.find(filter, projection)
            .populate("owner", "fullName email avatar")
            .sort(sortOption)
            .limit(30);

        res.status(200).json({ success: true, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single item by ID
export const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id)
            .populate("owner", "fullName email avatar");
        if (!item) return res.status(404).json({ success: false, message: "Item not found" });

        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete Item — cascade deletes all claims and conversations
export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found" });
        }

        // Authorization check — only the owner can delete
        if (item.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
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
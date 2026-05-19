import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            index: true 
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        itemType: {
            type: String,
            enum: ["LOST", "FOUND"],
            required: true,
            index: true
        },
        category: {
            type: String,
            required: true,
            index: true
        },
        location: {
            type: String,
            required: true
        },
        image: {
            type: String, // Cloudinary URL
            required: true
        },
        aiTags: {
            type: [String],
            default: []
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["ACTIVE", "RECOVERED", "ARCHIVED"],
            default: "ACTIVE"
        },
        claimQuestion: {
            type: String,
            // Only required if itemType is FOUND
            required: function() { return this.itemType === "FOUND"; },
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// High-performance search index
itemSchema.index({ title: 'text', description: 'text', aiTags: 'text' });

export const Item = mongoose.model("Item", itemSchema);
import mongoose, { Schema } from "mongoose";

// Conversation Schema
const conversationSchema = new Schema(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        item: {
            type: Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        claimId: {
            type: Schema.Types.ObjectId,
            ref: "Claim",
            required: true
        },
        lastMessage: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

conversationSchema.index({ claimId: 1 }, { unique: true });

export const Conversation = mongoose.model("Conversation", conversationSchema);

// Message Schema
const messageSchema = new Schema(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true
        },
        sender: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Message = mongoose.model("Message", messageSchema);
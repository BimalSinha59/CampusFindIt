import mongoose, { Schema } from "mongoose";

const claimSchema = new Schema(
    {
        item: {
            type: Schema.Types.ObjectId,
            ref: "Item",
            required: true
        },
        claimant: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        },
        proofImage: {
            type: String 
        }
    },
    {
        timestamps: true
    }
);

claimSchema.index({ item: 1, claimant: 1 }, { unique: true });

export const Claim = mongoose.model("Claim", claimSchema);
import express from 'express';
import { cloudinary, uploadMiddleware } from '../config/cloudinary.js';

const router = express.Router();

router.post('/upload-item-image', uploadMiddleware.single('image'), async (req, res) => {
    try {
        // Check if file was caught by multer middleware
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No image asset attached' });
        }

        // Convert the memory buffer file stream to a dataURI base64 string
        const fileBase64 = req.file.buffer.toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${fileBase64}`;

        // Execute secure signed upload to Cloudinary CDN
        const uploadResponse = await cloudinary.uploader.upload(dataURI, {
            folder: 'campus_find_it_items', // automatically creates/groups into this folder
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // enforces security at API tier

            categorization: 'google_tagging', // Employs Google's Cloud Vision AI model
            auto_tagging: 0.8 // Automatically accepts tags where the AI is at least 80% confident
        });

        // Send back the secure absolute cloud URL and structural assets to frontend
        return res.status(200).json({
            success: true,
            imageUrl: uploadResponse.secure_url,
            publicId: uploadResponse.public_id,
            aiTags: uploadResponse.tags || [],
        });

    } catch (error) {
        console.error('Cloudinary upload failure:', error);
        return res.status(500).json({ success: false, message: 'Internal media pipeline breakdown' });
    }
});

export default router;
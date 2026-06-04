import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Initialize Cloudinary SDK configuration using process.env
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer to temporarily store incoming files in server memory 
// This prevents writing heavy temporary clutter files to disk storage on Render
const storage = multer.memoryStorage();

export const uploadMiddleware = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Strict 5MB file upload ceiling
});

export { cloudinary };
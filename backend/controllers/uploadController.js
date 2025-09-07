import asyncHandler from '../middleware/asyncHandler.js';
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary v2
import env from '../config/env.js'; // Import environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

/**
 * Reusable function to upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file content as a Buffer.
 * @param {string} mimetype - The MIME type of the file (e.g., 'image/jpeg').
 * @returns {Promise<string>} A promise that resolves with the secure URL of the uploaded image.
 */
const uploadFileToCloudinary = (fileBuffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'bazzarnet', resource_type: 'auto' }, // Optional: specify a folder in Cloudinary
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error('Image upload to Cloudinary failed.'));
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Upload image file to Cloudinary (for /api/upload route)
// @route   POST /api/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  console.log('Backend: uploadImage controller hit.');
  if (!req.file) {
    console.error('Backend: No image file provided in request.');
    res.status(400);
    throw new Error('No image file provided');
  }

  if (!req.file.buffer) {
    console.error('Backend: File buffer is missing. Multer configuration issue?');
    res.status(400);
    throw new Error('File buffer is missing. Ensure Multer is configured for memory storage.');
  }

  console.log('Backend: Attempting to upload to Cloudinary...');
  const filePath = await uploadFileToCloudinary(req.file.buffer, req.file.mimetype);
  console.log('Backend: Cloudinary upload successful. FilePath:', filePath);
  res.json({ message: 'Image uploaded successfully', filePath });
});

export { uploadImage, uploadFileToCloudinary }; // Export both
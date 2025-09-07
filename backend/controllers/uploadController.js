import asyncHandler from '../middleware/asyncHandler.js';
import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary v2
import env from '../config/env.js'; // Import environment variables

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// @desc    Upload image file to Cloudinary
// @route   POST /api/upload
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  console.log('Backend: uploadImage controller hit.'); // NEW LOG
  if (!req.file) {
    console.error('Backend: No image file provided in request.'); // NEW LOG
    res.status(400);
    throw new Error('No image file provided');
  }

  // Check if the file buffer exists
  if (!req.file.buffer) {
    console.error('Backend: File buffer is missing. Multer configuration issue?'); // NEW LOG
    res.status(400);
    throw new Error('File buffer is missing. Ensure Multer is configured for memory storage.');
  }

  console.log('Backend: Attempting to upload to Cloudinary...'); // NEW LOG
  // Upload image to Cloudinary
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: 'bazzarnet' }, // Optional: specify a folder in Cloudinary
    async (error, result) => {
      if (error) {
        console.error('Backend: Cloudinary upload error:', error); // EXISTING LOG, but good to re-emphasize
        res.status(500);
        throw new Error('Image upload to Cloudinary failed.');
      }
      console.log('Backend: Cloudinary upload successful. Result:', result); // NEW LOG
      // result.secure_url contains the URL of the uploaded image
      res.json({ message: 'Image uploaded successfully', filePath: result.secure_url });
    }
  );

  // Pipe the buffer to the upload stream
  uploadStream.end(req.file.buffer);
});

export { uploadImage };
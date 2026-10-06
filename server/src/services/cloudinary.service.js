import { v2 as cloudinary } from 'cloudinary';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Cloudinary Client if credentials are provided
const isCloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Upload file buffer (from Multer memoryStorage) to Cloudinary (or local fallback)
 * @param {Object} file - Multer file object (in memory buffer)
 * @param {string} folder - Folder/prefix in Cloudinary (e.g., 'avatars', 'projects')
 * @returns {Promise<string>} Public URL of uploaded image
 */
export const uploadFileToCloudinary = async (file, folder = 'avatars') => {
  if (!file || !file.buffer) {
    throw new Error('No file buffer provided for upload.');
  }

  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `devtinder/${folder}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      uploadStream.end(file.buffer);
    });
  } else {
    // Fallback: Save buffer to local disk under server/uploads/
    const uploadsDir = path.join(__dirname, '../../uploads', folder);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const fileExtension = path.extname(file.originalname) || '.jpg';
    const localFileName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${fileExtension}`;
    const localFilePath = path.join(uploadsDir, localFileName);

    await fs.promises.writeFile(localFilePath, file.buffer);

    // Return relative URL for static Express serving
    return `/uploads/${folder}/${localFileName}`;
  }
};

/**
 * Delete file from Cloudinary or local disk
 * @param {string} fileUrl - Public URL or relative path of the file
 */
export const deleteFileFromCloudinary = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    if (isCloudinaryConfigured && fileUrl.includes('cloudinary.com')) {
      const parts = fileUrl.split('/upload/');
      if (parts.length > 1) {
        let publicIdPath = parts[1];
        // Remove version string if present (e.g. v1234567890/)
        publicIdPath = publicIdPath.replace(/^v\d+\//, '');
        // Remove file extension
        const lastDotIndex = publicIdPath.lastIndexOf('.');
        const publicId = lastDotIndex !== -1 ? publicIdPath.substring(0, lastDotIndex) : publicIdPath;

        await cloudinary.uploader.destroy(publicId);
      }
    } else if (fileUrl.startsWith('/uploads/')) {
      // Delete local fallback file
      const relativePath = fileUrl.replace('/uploads/', '');
      const localFilePath = path.join(__dirname, '../../uploads', relativePath);
      if (fs.existsSync(localFilePath)) {
        await fs.promises.unlink(localFilePath);
      }
    }
  } catch (error) {
    console.error('Failed to delete file from storage:', error.message);
  }
};

// Aliases for backward compatibility
export const uploadFileToS3 = uploadFileToCloudinary;
export const deleteFileFromS3 = deleteFileFromCloudinary;

/**
 * Cloudinary service for image storage and processing
 */

import { v2 as cloudinary } from 'cloudinary';
import logger from '../utils/logger.js';

let cloudinaryConfig = null;

/**
 * Initialize Cloudinary
 */
export async function initCloudinary() {
  try {
    const config = {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    };

    // Validate configuration
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      logger.warn('⚠️ Cloudinary configuration incomplete, using local storage fallback');
      return false;
    }

    cloudinary.config(config);
    cloudinaryConfig = config;

    // Test connection
    await cloudinary.api.ping();
    logger.info('✅ Cloudinary initialized successfully');
    return true;
  } catch (error) {
    logger.error('❌ Cloudinary initialization failed:', error);
    return false;
  }
}

/**
 * Upload image to Cloudinary
 */
export async function uploadImage(imageBuffer, options = {}) {
  try {
    if (!cloudinaryConfig) {
      throw new Error('Cloudinary not configured');
    }

    const {
      folder = 'proprscout',
      public_id = null,
      transformation = {},
      tags = ['proprscout']
    } = options;

    const uploadOptions = {
      folder,
      tags,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      ...transformation
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    logger.info(`☁️ Uploading image to Cloudinary...`);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(imageBuffer);
    });

    logger.info(`✅ Image uploaded successfully: ${result.public_id}`);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    };

  } catch (error) {
    logger.error('❌ Cloudinary upload failed:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

/**
 * Upload image from URL
 */
export async function uploadImageFromUrl(imageUrl, options = {}) {
  try {
    if (!cloudinaryConfig) {
      throw new Error('Cloudinary not configured');
    }

    const {
      folder = 'proprscout',
      public_id = null,
      transformation = {},
      tags = ['proprscout']
    } = options;

    const uploadOptions = {
      folder,
      tags,
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      ...transformation
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    logger.info(`☁️ Uploading image from URL: ${imageUrl}`);

    const result = await cloudinary.uploader.upload(imageUrl, uploadOptions);

    logger.info(`✅ Image uploaded from URL: ${result.public_id}`);
    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    };

  } catch (error) {
    logger.error('❌ Cloudinary upload from URL failed:', error);
    throw new Error(`Image upload from URL failed: ${error.message}`);
  }
}

/**
 * Transform image
 */
export async function transformImage(publicId, transformation = {}) {
  try {
    if (!cloudinaryConfig) {
      throw new Error('Cloudinary not configured');
    }

    const defaultTransformation = {
      quality: 'auto',
      fetch_format: 'auto',
      width: 800,
      height: 600,
      crop: 'fill',
      gravity: 'auto'
    };

    const finalTransformation = { ...defaultTransformation, ...transformation };

    const url = cloudinary.url(publicId, finalTransformation);
    
    logger.info(`✅ Image transformation URL generated: ${url}`);
    return url;

  } catch (error) {
    logger.error('❌ Image transformation failed:', error);
    throw new Error(`Image transformation failed: ${error.message}`);
  }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteImage(publicId) {
  try {
    if (!cloudinaryConfig) {
      throw new Error('Cloudinary not configured');
    }

    logger.info(`🗑️ Deleting image: ${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      logger.info(`✅ Image deleted successfully: ${publicId}`);
      return true;
    } else {
      logger.warn(`⚠️ Image deletion result: ${result.result}`);
      return false;
    }

  } catch (error) {
    logger.error('❌ Image deletion failed:', error);
    throw new Error(`Image deletion failed: ${error.message}`);
  }
}

/**
 * Get image info
 */
export async function getImageInfo(publicId) {
  try {
    if (!cloudinaryConfig) {
      throw new Error('Cloudinary not configured');
    }

    const result = await cloudinary.api.resource(publicId);

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at,
      tags: result.tags,
      context: result.context
    };

  } catch (error) {
    logger.error('❌ Get image info failed:', error);
    throw new Error(`Get image info failed: ${error.message}`);
  }
}

/**
 * List images in folder
 */
export async function listImages(folder = 'proprscout', options = {}) {
  try {
    if (!cloudinaryConfig) {
      throw new Error('Cloudinary not configured');
    }

    const {
      max_results = 100,
      next_cursor = null
    } = options;

    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results,
      next_cursor
    });

    return {
      resources: result.resources,
      next_cursor: result.next_cursor,
      total_count: result.total_count
    };

  } catch (error) {
    logger.error('❌ List images failed:', error);
    throw new Error(`List images failed: ${error.message}`);
  }
}

/**
 * Get Cloudinary service info
 */
export function getServiceInfo() {
  return {
    name: 'Cloudinary',
    version: '1.0.0',
    description: 'Cloud-based image storage and processing',
    configured: !!cloudinaryConfig,
    capabilities: [
      'Image upload',
      'Image transformation',
      'Image deletion',
      'URL upload',
      'Batch operations'
    ],
    status: cloudinaryConfig ? 'ready' : 'not_configured'
  };
}

export default {
  initCloudinary,
  uploadImage,
  uploadImageFromUrl,
  transformImage,
  deleteImage,
  getImageInfo,
  listImages,
  getServiceInfo
};

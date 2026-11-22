/**
 * Image compression utility for campaign uploads
 * Compresses images before upload to stay under request size limits
 */

import imageCompression from 'browser-image-compression';

/**
 * Compress a single image file
 * @param {File} file - Image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} Compressed file
 */
export const compressImage = async (file, options = {}) => {
  // Validation
  if (!file || !(file instanceof File)) {
    throw new Error('Invalid file: must be a File object');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type: must be an image');
  }

  const maxSizeMB = options.maxSizeMB || 1.5;
  const maxWidthOrHeight = options.maxWidthOrHeight || 1920;
  const useWebWorker = options.useWebWorker !== false;
  const fileType = options.fileType || 'image/jpeg';
  const quality = options.quality || 0.8;

  try {
    const compressed = await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker,
      fileType,
      initialQuality: quality,
      alwaysKeepResolution: false,
      onProgress: (progress) => {
        if (options.onProgress) {
          options.onProgress(progress);
        }
      },
    });

    return compressed;
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
};

/**
 * Compress multiple images in parallel (max 3 at a time)
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} Array of compressed files
 */
export const compressImagesParallel = async (files, options = {}) => {
  if (!Array.isArray(files)) {
    throw new Error('Files must be an array');
  }

  const maxConcurrent = options.maxConcurrent || 3;
  const compressed = [];
  const fileSize = options.fileSize || {};

  for (let i = 0; i < files.length; i += maxConcurrent) {
    const batch = files.slice(i, i + maxConcurrent);
    const promises = batch.map((file, batchIndex) =>
      compressImage(file, {
        ...options,
        onProgress: (progress) => {
          if (options.onProgress) {
            options.onProgress({
              fileIndex: i + batchIndex,
              totalFiles: files.length,
              progress,
            });
          }
        },
      }).catch(error => ({
        error: true,
        originalFile: file,
        message: error.message,
      }))
    );

    const results = await Promise.all(promises);
    compressed.push(...results);
  }

  return compressed;
};

/**
 * Validate image file before compression
 * @param {File} file - Image file to validate
 * @returns {Object} { valid: boolean, error: string | null }
 */
export const validateImageFile = (file) => {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!(file instanceof File)) {
    return { valid: false, error: 'Invalid file object' };
  }

  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image (JPG, PNG, WebP, etc.)' };
  }

  // Check MIME type against whitelist
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedMimes.includes(file.type)) {
    return { valid: false, error: `Image type not supported: ${file.type}. Supported: JPG, PNG, WebP, GIF` };
  }

  const maxSizeBytes = 50 * 1024 * 1024; // 50MB before compression
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum: 50MB` };
  }

  return { valid: true, error: null };
};

/**
 * Check if file size is acceptable after compression
 * @param {File} file - Compressed file to check
 * @returns {Object} { acceptable: boolean, sizeMB: number, maxMB: number, error: string | null }
 */
export const checkCompressedFileSize = (file, maxMB = 2.5) => {
  const sizeMB = file.size / 1024 / 1024;
  const acceptable = sizeMB <= maxMB;

  return {
    acceptable,
    sizeMB: parseFloat(sizeMB.toFixed(2)),
    maxMB,
    error: acceptable ? null : `Compressed file is still too large (${sizeMB.toFixed(2)}MB). Maximum: ${maxMB}MB`
  };
};

/**
 * Process images for upload with validation and compression
 * @param {File[]} files - Array of image files
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} { successful: File[], failed: Array<{file, error}> }
 */
export const processImagesForUpload = async (files, options = {}) => {
  const successful = [];
  const failed = [];

  // Validate each file
  const validatedFiles = files.map(file => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      failed.push({ file, error: validation.error });
      return null;
    }
    return file;
  }).filter(Boolean);

  // Compress valid files in parallel
  if (validatedFiles.length > 0) {
    const compressed = await compressImagesParallel(validatedFiles, options);

    for (const result of compressed) {
      if (result.error) {
        failed.push({
          file: result.originalFile,
          error: result.message,
        });
      } else {
        // Check final size
        const sizeCheck = checkCompressedFileSize(result, options.maxMB || 2.5);
        if (sizeCheck.acceptable) {
          successful.push(result);
        } else {
          failed.push({
            file: result,
            error: sizeCheck.error,
          });
        }
      }
    }
  }

  return { successful, failed };
};

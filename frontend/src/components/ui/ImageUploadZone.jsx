/**
 * Image Upload Zone with Compression, Progress, and Error Handling
 * Handles: validation, compression, parallel uploads, retry logic
 */

import React, { useCallback, useEffect, useState } from 'react';
import { X, ImageIcon, AlertCircle, Loader, CheckCircle, RotateCcw } from 'lucide-react';
import { compressImage, validateImageFile, checkCompressedFileSize, processImagesForUpload } from '../../utils/imageCompression';

const ImageUploadZone = ({ 
  value = null, 
  onChange, 
  onRemove, 
  multiple = false, 
  compact = false,
  onUpload = null, // For tracking uploads
  maxImages = 8,
  campaignId = null, // If provided, can retry uploads
}) => {
  const [objectUrls, setObjectUrls] = React.useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [isCompressing, setIsCompressing] = useState(false);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length) {
      handleFiles(multiple ? files : [files[0]]);
    }
  }, [multiple]);

  /**
   * Handle file input/drop
   * Validates, compresses, creates preview URLs
   */
  const handleFiles = async (files) => {
    setIsCompressing(true);
    setUploadErrors({});

    try {
      const { successful, failed } = await processImagesForUpload(files, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1920,
        quality: 0.8,
      });

      // Show errors for failed files
      if (failed.length > 0) {
        const errorMap = {};
        failed.forEach((item, idx) => {
          errorMap[`failed-${idx}`] = item.error;
        });
        setUploadErrors(errorMap);
      }

      if (successful.length > 0) {
        onChange(multiple ? successful : successful[0]);
      }
    } catch (error) {
      setUploadErrors({ general: error.message });
    } finally {
      setIsCompressing(false);
    }
  };

  // Create object URL only once per File
  const src = (item) => {
    if (typeof item === 'string') {
      return item; // Already a URL
    }
    if (item && typeof item === 'object' && item.url) {
      return item.url; // Existing image object { id, url }
    }
    if (item instanceof File) {
      const key = item.name + item.size + item.lastModified;
      if (!objectUrls[key]) {
        const url = URL.createObjectURL(item);
        setObjectUrls(prev => ({ ...prev, [key]: url }));
        return url;
      }
      return objectUrls[key];
    }
    return '';
  };

  // Revoke object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(objectUrls).forEach(url => URL.revokeObjectURL(url));
    };
  }, [objectUrls]);

  const handleRemove = (index) => {
    setUploadErrors({});
    onRemove(index);
  };

  const handleRetry = async (index) => {
    if (!onUpload || !campaignId) return;
    setUploadProgress(prev => ({ ...prev, [index]: 'uploading' }));
    
    try {
      await onUpload(value[index], campaignId, true); // true = isGallery
      setUploadProgress(prev => ({ ...prev, [index]: 'success' }));
      setTimeout(() => {
        setUploadProgress(prev => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }, 2000);
    } catch (error) {
      setUploadErrors(prev => ({ ...prev, [index]: error.message }));
      setUploadProgress(prev => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* General errors */}
      {uploadErrors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Upload Error</p>
            <p className="text-xs text-red-700 mt-0.5">{uploadErrors.general}</p>
          </div>
        </div>
      )}

      {/* Previews */}
      {!multiple && value && (
        <div className="relative inline-block group">
          <img src={src(value)} alt="" className="h-48 w-auto max-w-full rounded-2xl object-cover border border-gray-100 shadow-sm" />
          <button 
            type="button" 
            onClick={() => handleRemove(0)}
            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((item, i) => (
            <div key={i} className="relative group">
              <div className="relative">
                <img src={src(item)} alt="" className="h-24 w-24 rounded-xl object-cover border border-gray-100" />
                
                {/* Upload status overlay */}
                {uploadProgress[i] && (
                  <div className="absolute inset-0 rounded-xl bg-black/60 flex items-center justify-center">
                    {uploadProgress[i] === 'uploading' && (
                      <Loader className="h-5 w-5 text-white animate-spin" />
                    )}
                    {uploadProgress[i] === 'success' && (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    )}
                  </div>
                )}

                {/* Error state */}
                {uploadErrors[i] && (
                  <div className="absolute inset-0 rounded-xl bg-red-600/80 flex flex-col items-center justify-center gap-1 p-1">
                    <AlertCircle className="h-4 w-4 text-white" />
                    <p className="text-xs text-white text-center leading-tight">Failed</p>
                  </div>
                )}
              </div>

              <button 
                type="button" 
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 bg-black/60 text-white p-1 opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>

              {/* Retry button for failed uploads */}
              {uploadErrors[i] && onUpload && (
                <button
                  type="button"
                  onClick={() => handleRetry(i)}
                  className="absolute bottom-1 left-1 bg-blue-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition hover:bg-blue-700 flex items-center gap-1 text-xs"
                  title={uploadErrors[i]}
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <label 
        onDragOver={e => e.preventDefault()} 
        onDrop={onDrop}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all
          hover:border-primary-400 hover:bg-primary-50/50 group
          ${compact ? 'h-24' : 'h-40'}
          ${(!multiple && value) || (multiple && value?.length >= maxImages) ? 'border-gray-100 bg-gray-50 cursor-not-allowed' : 'border-gray-200 bg-white'}
          ${isCompressing ? 'opacity-50' : ''}`}
      >
        {isCompressing ? (
          <>
            <Loader className="h-7 w-7 text-primary-500 animate-spin mb-1.5" />
            <span className="text-sm text-primary-600 font-medium">Compressing images...</span>
          </>
        ) : (
          <>
            <ImageIcon className="h-7 w-7 text-gray-300 group-hover:text-primary-500 transition mb-1.5" />
            <span className="text-sm text-gray-400 group-hover:text-primary-600 transition">
              Drop here or <span className="font-medium underline underline-offset-2">browse</span>
            </span>
            <span className="text-xs text-gray-300 mt-1">JPG, PNG, WebP · max 1.5 MB (compressed)</span>
          </>
        )}
        
        <input 
          type="file" 
          className="hidden" 
          accept="image/*" 
          multiple={multiple}
          disabled={isCompressing || (!multiple && value) || (multiple && value?.length >= maxImages)}
          onChange={e => { 
            handleFiles(multiple ? Array.from(e.target.files) : [e.target.files[0]]);
            e.target.value = ''; 
          }} 
        />
      </label>

      {/* Error messages */}
      {Object.entries(uploadErrors).map(([key, error]) => {
        if (key === 'general') return null;
        return (
          <div key={key} className="p-2 bg-red-50 border border-red-200 rounded flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        );
      })}

      {/* Info */}
      {multiple && (
        <p className="text-xs text-gray-500">
          {value?.length || 0}/{maxImages} images · Images are automatically compressed before upload
        </p>
      )}
    </div>
  );
};

export default ImageUploadZone;

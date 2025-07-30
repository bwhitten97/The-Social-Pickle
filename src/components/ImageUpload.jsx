import { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ currentImage, onImageChange, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const MAX_ORIGINAL_FILE_SIZE = 50 * 1024 * 1024; // 50MB - very generous for original files
  const MAX_COMPRESSED_FILE_SIZE = 1 * 1024 * 1024; // 1MB - final compressed size
  const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  const validateOriginalFile = (file) => {
    if (!file) return false;
    
    // Allow very large original files since we'll compress them
    if (file.size > MAX_ORIGINAL_FILE_SIZE) {
      setError('File is too large to process (max 50MB)');
      return false;
    }
    
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, WebP, or HEIC image');
      return false;
    }
    
    setError('');
    return true;
  };

  const validateCompressedFile = (file) => {
    if (file.size > MAX_COMPRESSED_FILE_SIZE) {
      setError('Unable to compress image small enough. Please try a different photo.');
      return false;
    }
    return true;
  };

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // More aggressive sizing for large files
        const originalSize = file.size;
        let maxSize = 800; // Start larger for better quality
        let quality = 0.9; // Start with high quality
        
        // Adjust compression based on original file size
        if (originalSize > 10 * 1024 * 1024) { // > 10MB
          maxSize = 600;
          quality = 0.7;
        } else if (originalSize > 5 * 1024 * 1024) { // > 5MB
          maxSize = 700;
          quality = 0.8;
        }
        
        let { width, height } = img;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try compression with adaptive quality
        const tryCompress = (currentQuality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const file = new File([blob], `profile-${Date.now()}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              // If still too large and quality can be reduced, try again
              if (file.size > MAX_COMPRESSED_FILE_SIZE && currentQuality > 0.3) {
                tryCompress(currentQuality - 0.1);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            currentQuality
          );
        };
        
        tryCompress(quality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFile = async (file) => {
    // First validate the original file (very permissive)
    if (!validateOriginalFile(file)) return;
    
    setIsUploading(true);
    setError('');
    
    try {
      // Compress image first
      const compressedFile = await compressImage(file);
      
      // Then validate the compressed result
      if (!validateCompressedFile(compressedFile)) {
        return;
      }
      
      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
      
      // Call parent callback
      onImageChange(compressedFile, previewUrl);
      
      console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    } catch (err) {
      console.error('Image compression error:', err);
      setError('Failed to process image. Please try a different photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    onImageChange(null, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      {preview ? (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={preview} alt="Profile preview" />
            <div className="image-overlay">
              <button
                type="button"
                onClick={handleClick}
                className="image-action-btn change-btn"
                disabled={isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="image-action-btn remove-btn"
                disabled={isUploading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3,6 5,6 21,6"/>
                  <path d="M19,6V20a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6M8,6V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2V6"/>
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`image-upload-area ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
        >
          <div className="upload-content">
            {isUploading ? (
              <div className="upload-spinner">
                <div className="spinner"></div>
                <p>Processing image...</p>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21,15 16,10 5,21"/>
                  </svg>
                </div>
                <div className="upload-text">
                  <p className="upload-primary">Click to upload or drag and drop</p>
                  <p className="upload-secondary">Any photo from your camera roll - we'll optimize it automatically</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
        onChange={handleFileSelect}
        className="file-input"
        disabled={isUploading}
      />
      
      {error && (
        <div className="upload-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
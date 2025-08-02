/**
 * Image Utilities for Photo Cropping and Manipulation
 * 
 * Handles image loading, cropping, resizing, and canvas operations
 * for the photo crop interface.
 */

/**
 * Load an image file and return as HTMLImageElement
 */
export const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      // Don't revoke URL immediately - keep it for the image element
      // We'll revoke it when the component unmounts
      const imageWithCleanup = Object.assign(img, {
        cleanup: () => URL.revokeObjectURL(url),
        originalUrl: url
      });
      resolve(imageWithCleanup);
    };
    
    img.onerror = (error) => {
      URL.revokeObjectURL(url);
      console.error('Image load error:', error);
      reject(new Error('Failed to load image. Please try a different image.'));
    };
    
    // Add crossOrigin to handle potential CORS issues
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
};

/**
 * Create a canvas with the cropped image
 */
export const cropImage = (image, cropData, outputDimensions) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set output dimensions
  canvas.width = outputDimensions.width;
  canvas.height = outputDimensions.height;
  
  // Calculate source coordinates and dimensions
  const sourceX = cropData.x * (image.naturalWidth / cropData.imageDisplayWidth);
  const sourceY = cropData.y * (image.naturalHeight / cropData.imageDisplayHeight);
  const sourceWidth = cropData.width * (image.naturalWidth / cropData.imageDisplayWidth);
  const sourceHeight = cropData.height * (image.naturalHeight / cropData.imageDisplayHeight);
  
  // Draw the cropped portion
  ctx.drawImage(
    image,
    sourceX, sourceY, sourceWidth, sourceHeight, // Source rectangle
    0, 0, canvas.width, canvas.height // Destination rectangle
  );
  
  return canvas;
};

/**
 * Convert canvas to blob for upload
 */
export const canvasToBlob = (canvas, quality = 0.9) => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
};

/**
 * Convert canvas to data URL
 */
export const canvasToDataURL = (canvas, quality = 0.9) => {
  return canvas.toDataURL('image/jpeg', quality);
};

/**
 * Get optimal image display size to fit within container while maintaining aspect ratio
 */
export const getOptimalDisplaySize = (imageWidth, imageHeight, containerWidth, containerHeight) => {
  const imageAspectRatio = imageWidth / imageHeight;
  const containerAspectRatio = containerWidth / containerHeight;
  
  let displayWidth, displayHeight;
  
  if (imageAspectRatio > containerAspectRatio) {
    // Image is wider than container - fit to height
    displayHeight = containerHeight;
    displayWidth = displayHeight * imageAspectRatio;
  } else {
    // Image is taller than container - fit to width
    displayWidth = containerWidth;
    displayHeight = displayWidth / imageAspectRatio;
  }
  
  return { width: displayWidth, height: displayHeight };
};

/**
 * Calculate initial crop position to center the image
 */
export const getInitialCropPosition = (imageDisplaySize, cropFrameSize) => {
  return {
    x: Math.max(0, (imageDisplaySize.width - cropFrameSize.width) / 2),
    y: Math.max(0, (imageDisplaySize.height - cropFrameSize.height) / 2),
    width: cropFrameSize.width,
    height: cropFrameSize.height
  };
};

/**
 * Constrain crop position to keep it within image bounds
 */
export const constrainCropPosition = (cropData, imageDisplaySize, minCropSize) => {
  const maxX = Math.max(0, imageDisplaySize.width - cropData.width);
  const maxY = Math.max(0, imageDisplaySize.height - cropData.height);
  
  return {
    ...cropData,
    x: Math.max(0, Math.min(cropData.x, maxX)),
    y: Math.max(0, Math.min(cropData.y, maxY)),
    width: Math.max(minCropSize.width, Math.min(cropData.width, imageDisplaySize.width)),
    height: Math.max(minCropSize.height, Math.min(cropData.height, imageDisplaySize.height))
  };
};

/**
 * Detect faces in image (basic implementation - can be enhanced with ML)
 */
export const suggestFacePosition = async (imageElement) => {
  // Basic implementation: assume face is in upper center third
  // This can be enhanced with face detection libraries like face-api.js
  const width = imageElement.naturalWidth;
  const height = imageElement.naturalHeight;
  
  return {
    x: width * 0.25,
    y: height * 0.1,
    width: width * 0.5,
    height: height * 0.6
  };
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  if (!file) {
    throw new Error('No file selected');
  }

  // More permissive file type checking - check if it starts with 'image/'
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select a valid image file');
  }
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (file.size > maxSize) {
    throw new Error('Image file is too large. Please select an image under 10MB.');
  }
  
  if (file.size === 0) {
    throw new Error('Image file appears to be empty. Please select a different image.');
  }
  
  console.log('File validation passed:', {
    name: file.name,
    type: file.type,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`
  });
  
  return true;
};
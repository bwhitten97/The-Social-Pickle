import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DISCOVER_CARD_CONFIG } from '../config/cardDimensions';
import {
  loadImage,
  cropImage,
  canvasToBlob,
  getOptimalDisplaySize,
  getInitialCropPosition,
  constrainCropPosition,
  validateImageFile
} from '../utils/imageUtils';
import './PhotoCropModal.css';

const PhotoCropModal = ({ 
  isOpen, 
  onClose, 
  onCropComplete, 
  file,
  title = "Crop Your Profile Photo"
}) => {
  const [image, setImage] = useState(null);
  const [imageDisplaySize, setImageDisplaySize] = useState({ width: 0, height: 0 });
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const cropStartPos = useRef({ x: 0, y: 0 });

  // Get current card dimensions
  const cardDimensions = DISCOVER_CARD_CONFIG.getCurrentDimensions();
  const cropFrameSize = {
    width: 160, // Larger crop frame to better match actual profile card size
    height: 160 * (cardDimensions.height / cardDimensions.width)
  };

  // Load image when file changes
  useEffect(() => {
    if (file && isOpen) {
      loadImageFile();
    }
  }, [file, isOpen]);

  const loadImageFile = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      console.log('Loading image file:', file?.name, file?.type, file?.size);
      
      validateImageFile(file);
      const img = await loadImage(file);
      
      console.log('Image loaded successfully:', {
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        src: img.src?.substring(0, 50) + '...'
      });
      
      setImage(img);
      
      // Calculate optimal display size
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();
        console.log('Container size:', containerRect.width, containerRect.height);
        
        const displaySize = getOptimalDisplaySize(
          img.naturalWidth,
          img.naturalHeight,
          Math.min(containerRect.width - 40, 200), // Much smaller max width so image doesn't take over
          Math.min(containerRect.height - 80, 120) // Much smaller max height to leave room for UI
        );
        
        console.log('Display size calculated:', displaySize);
        setImageDisplaySize(displaySize);
        
        // Set initial crop position (centered)
        const initialCrop = getInitialCropPosition(displaySize, cropFrameSize);
        console.log('Initial crop position:', initialCrop);
        setCropData(initialCrop);
      }
    } catch (err) {
      console.error('Error loading image:', err);
      setError(`Error loading image: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Mouse/Touch handlers for dragging crop area
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    
    // Prevent scrolling on the modal overlay while dragging
    if (overlayRef.current) {
      overlayRef.current.classList.add('no-scroll');
    }
    
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    cropStartPos.current = { x: cropData.x, y: cropData.y };
  }, [cropData]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !imageRef.current) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const currentPos = {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
    
    const deltaX = currentPos.x - dragStartPos.current.x;
    const deltaY = currentPos.y - dragStartPos.current.y;
    
    const newCropData = {
      ...cropData,
      x: cropStartPos.current.x + deltaX,
      y: cropStartPos.current.y + deltaY
    };
    
    // Constrain to image bounds
    const constrainedCrop = constrainCropPosition(
      newCropData,
      imageDisplaySize,
      { width: 50, height: 50 } // Minimum crop size
    );
    
    setCropData(constrainedCrop);
  }, [isDragging, cropData, imageDisplaySize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    // Re-enable scrolling when dragging stops
    if (overlayRef.current) {
      overlayRef.current.classList.remove('no-scroll');
    }
  }, []);

  // Set up global mouse/touch listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove);
      document.addEventListener('touchend', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup image URL when component unmounts or image changes
  useEffect(() => {
    return () => {
      if (image && image.cleanup) {
        image.cleanup();
      }
      // Re-enable scrolling when component unmounts
      if (overlayRef.current) {
        overlayRef.current.classList.remove('no-scroll');
      }
    };
  }, [image]);

  const handleCrop = async () => {
    if (!image) return;
    
    try {
      setIsLoading(true);
      
      // Create crop data with actual image coordinates
      const cropDataWithScale = {
        ...cropData,
        imageDisplayWidth: imageDisplaySize.width,
        imageDisplayHeight: imageDisplaySize.height
      };
      
      // Crop the image
      const canvas = cropImage(image, cropDataWithScale, cardDimensions);
      const blob = await canvasToBlob(canvas);
      
      // Create preview URL
      const previewUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      onCropComplete({
        blob,
        previewUrl,
        dimensions: cardDimensions
      });
      
      onClose();
    } catch (err) {
      setError('Failed to crop image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={overlayRef} className="photo-crop-modal-overlay">
      <div className="photo-crop-modal">
        <div className="photo-crop-header">
          <h2>{title}</h2>
          <button 
            onClick={onClose}
            className="photo-crop-close-btn"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="photo-crop-error">
            {error}
          </div>
        )}

        <div className="photo-crop-instructions">
          Drag the highlighted area to position your photo. This preview shows exactly how you'll appear on player cards.
        </div>

        <div 
          ref={containerRef}
          className="photo-crop-container"
        >
          {isLoading ? (
            <div className="photo-crop-loading">
              <div className="loading-spinner"></div>
              <p>Loading image...</p>
            </div>
          ) : image ? (
            <div className="photo-crop-workspace">
              <div 
                className="photo-crop-image-container"
                style={{
                  width: imageDisplaySize.width,
                  height: imageDisplaySize.height
                }}
              >
                <img
                  ref={imageRef}
                  src={image.originalUrl || image.src}
                  alt="Crop preview"
                  className="photo-crop-image"
                  draggable={false}
                  onError={(e) => {
                    console.error('Image display error:', e);
                    setError('Failed to display image. Please try again.');
                  }}
                  onLoad={() => {
                    console.log('Image displayed successfully in DOM');
                  }}
                  style={{
                    width: imageDisplaySize.width,
                    height: imageDisplaySize.height
                  }}
                />
                
                {/* Crop frame overlay */}
                <div
                  className="photo-crop-frame"
                  style={{
                    left: cropData.x,
                    top: cropData.y,
                    width: cropData.width,
                    height: cropData.height
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleMouseDown}
                >
                  <div className="photo-crop-frame-border"></div>
                  <div className="photo-crop-handle"></div>
                </div>
                
                {/* Darkened overlay outside crop area */}
                <div className="photo-crop-overlay">
                  <div className="photo-crop-overlay-top" style={{
                    height: cropData.y
                  }}></div>
                  <div className="photo-crop-overlay-middle" style={{
                    top: cropData.y,
                    height: cropData.height
                  }}>
                    <div className="photo-crop-overlay-left" style={{
                      width: cropData.x
                    }}></div>
                    <div className="photo-crop-overlay-right" style={{
                      left: cropData.x + cropData.width,
                      width: imageDisplaySize.width - cropData.x - cropData.width
                    }}></div>
                  </div>
                  <div className="photo-crop-overlay-bottom" style={{
                    top: cropData.y + cropData.height,
                    height: imageDisplaySize.height - cropData.y - cropData.height
                  }}></div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="photo-crop-actions">
          <button 
            onClick={onClose}
            className="photo-crop-cancel-btn"
          >
            Cancel
          </button>
          <button 
            onClick={handleCrop}
            className="photo-crop-save-btn"
            disabled={!image || isLoading}
          >
            {isLoading ? 'Processing...' : 'Use This Photo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoCropModal;
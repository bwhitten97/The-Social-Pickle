import React, { useState } from 'react';
import PhotoCropModal from './PhotoCropModal';
import DiscoverCardPreview from './DiscoverCardPreview';
import { validateImageFile } from '../utils/imageUtils';

/**
 * Demo component showing how to integrate the photo crop interface
 * This would be integrated into your actual onboarding/profile setup flow
 */
const PhotoUploadDemo = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [error, setError] = useState('');

  // Mock profile data for preview
  const mockProfileData = {
    name: 'Alex Johnson',
    age: '28',
    gender: 'male',
    skillLevel: 'intermediate',
    duprRating: '3.5',
    availability: ['Morning', 'Evening', 'Weekend'],
    bio: 'Love playing pickleball and meeting new people! Always up for a good match.'
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setSelectedFile(file);
      setShowCropModal(true);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCropComplete = (cropResult) => {
    setCroppedImageUrl(cropResult.previewUrl);
    setShowCropModal(false);
    
    // In a real app, you would upload cropResult.blob to your server here
    console.log('Cropped image ready for upload:', cropResult);
  };

  const handleRetake = () => {
    setCroppedImageUrl('');
    setSelectedFile(null);
    // Reset file input
    const fileInput = document.getElementById('photo-upload-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      background: '#F1F2F4',
      minHeight: '100vh'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '2rem',
          color: '#2C3E50'
        }}>
          Photo Upload Demo
        </h1>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        {!croppedImageUrl ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{ 
              marginBottom: '1.5rem',
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              Upload a photo to see the crop interface in action.
              You'll be able to position it exactly how you want it to appear in Discover.
            </p>
            
            <label 
              htmlFor="photo-upload-input"
              style={{
                display: 'inline-block',
                background: '#3E5D45',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'background 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#2a4030'}
              onMouseOut={(e) => e.target.style.background = '#3E5D45'}
            >
              Choose Photo
            </label>
            
            <input
              id="photo-upload-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div>
            <h3 style={{ 
              textAlign: 'center',
              marginBottom: '1.5rem',
              color: '#2C3E50'
            }}>
              Preview: How You'll Appear in Discover
            </h3>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center',
              marginBottom: '2rem'
            }}>
              <DiscoverCardPreview 
                imageUrl={croppedImageUrl}
                profileData={mockProfileData}
                size="normal"
              />
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center'
            }}>
              <button
                onClick={handleRetake}
                style={{
                  background: '#f9fafb',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
              >
                Retake Photo
              </button>
              
              <button
                onClick={() => alert('In a real app, this would save the photo and continue onboarding!')}
                style={{
                  background: '#3E5D45',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'background 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#2a4030'}
                onMouseOut={(e) => e.target.style.background = '#3E5D45'}
              >
                Use This Photo
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photo Crop Modal */}
      <PhotoCropModal
        isOpen={showCropModal}
        onClose={() => setShowCropModal(false)}
        onCropComplete={handleCropComplete}
        file={selectedFile}
        title="Position Your Profile Photo"
      />
    </div>
  );
};

export default PhotoUploadDemo;
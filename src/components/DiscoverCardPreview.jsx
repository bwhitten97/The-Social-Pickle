import React from 'react';
import { DISCOVER_CARD_CONFIG } from '../config/cardDimensions';
import './DiscoverCardPreview.css';

const DiscoverCardPreview = ({ 
  imageUrl, 
  profileData = {}, 
  showFullCard = true,
  size = 'normal' // 'normal', 'small', 'large'
}) => {
  const {
    name = 'Your Name',
    age = '25',
    gender = 'male',
    skillLevel = 'intermediate',
    duprRating = null,
    availability = ['Morning', 'Evening'],
    bio = 'This is how your bio will appear in the discover card.'
  } = profileData;

  const cardDimensions = DISCOVER_CARD_CONFIG.getCurrentDimensions();
  
  // Size multipliers
  const sizeMultipliers = {
    small: 0.7,
    normal: 1.0,
    large: 1.3
  };
  
  const multiplier = sizeMultipliers[size] || 1.0;
  const cardWidth = 300 * multiplier; // Preview size
  const imageHeight = (cardWidth * cardDimensions.height) / cardDimensions.width;

  return (
    <div className="discover-card-preview-container">
      <div 
        className={`discover-card-preview ${size}`}
        style={{
          width: cardWidth,
          '--image-height': `${imageHeight}px`
        }}
      >
        {/* Image Section */}
        <div className="discover-card-preview-image-section">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Profile preview"
              className="discover-card-preview-image"
            />
          ) : (
            <div className="discover-card-preview-placeholder">
              <div className="discover-card-preview-initials">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
            </div>
          )}
          
          {/* Distance Badge (mock) */}
          <div className="discover-card-preview-distance">
            <svg className="discover-card-preview-distance-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            2.5 mi
          </div>
        </div>

        {showFullCard && (
          <div className="discover-card-preview-details">
            {/* Header: Name, Age + Gender */}
            <div className="discover-card-preview-header">
              <h3 className="discover-card-preview-name">
                {name}, {age}
              </h3>
              <span className="discover-card-preview-gender">
                {gender === 'male' ? 'Male' : 
                 gender === 'female' ? 'Female' : 
                 gender === 'non-binary' ? 'Non-binary' : 
                 'Prefer not to say'}
              </span>
            </div>

            {/* Skill Row */}
            <div className="discover-card-preview-skill-row">
              <svg className="discover-card-preview-info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <span className="discover-card-preview-skill-badge">
                {skillLevel ? skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1).toLowerCase() : 'Not Specified'}
              </span>
              {duprRating && (
                <span className="discover-card-preview-dupr-badge">
                  DUPR {duprRating}
                </span>
              )}
            </div>

            {/* Availability */}
            {availability && availability.length > 0 && (
              <div className="discover-card-preview-availability">
                <svg className="discover-card-preview-info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <div className="discover-card-preview-availability-tags">
                  {availability.slice(0, 3).map((time, index) => (
                    <span key={index} className="discover-card-preview-availability-tag">
                      {time}
                    </span>
                  ))}
                  {availability.length > 3 && (
                    <span className="discover-card-preview-availability-tag more">
                      +{availability.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Bio Preview */}
            {bio && bio.trim() !== '' && (
              <div className="discover-card-preview-bio">
                <p>{bio.length > 80 ? `${bio.slice(0, 80)}...` : bio}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="discover-card-preview-actions">
              <button className="discover-card-preview-dislike-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
              
              <button className="discover-card-preview-like-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverCardPreview;
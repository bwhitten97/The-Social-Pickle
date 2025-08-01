import { useState, useRef, useCallback, memo, useEffect } from 'react';
import './SwipeableCard.css';

// Animation and display constants
const SWIPE_THRESHOLD = 100;
const ROTATION_MULTIPLIER = 0.1;
const BIO_PREVIEW_LENGTH = 80;
const MAX_AVAILABILITY_DISPLAY = 3;

const SwipeableCard = memo(({ profile, onSwipe, isTop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

  // Reset card position when profile changes (only for bottom cards becoming top cards)
  useEffect(() => {
    if (isTop) {
      // Disable transitions temporarily for instant positioning
      setIsTransitioning(false);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
      setIsDragging(false);
      
      // Re-enable transitions after a brief delay
      const timer = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(timer);
    }
  }, [profile?.id, isTop]);

  // Handle swipe completion with cleanup
  const handleSwipeCompleteWithCleanup = useCallback((direction) => {
    // Reset position immediately to prevent indicators showing on new card
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setIsTransitioning(false);
    
    if (onSwipe) {
      onSwipe(direction);
    }
  }, [onSwipe]);


  // Mouse event handlers
  const handleMouseDown = (e) => {
    if (!isTop || !onSwipe) return;
    
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isTop) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;
    
    setPosition({ x: deltaX, y: deltaY });
    setRotation(deltaX * ROTATION_MULTIPLIER);
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return;
    
    setIsDragging(false);
    
    if (Math.abs(position.x) > SWIPE_THRESHOLD) {
      const direction = position.x > 0 ? 'right' : 'left';
      // Enable transitions for smooth exit animation
      setIsTransitioning(true);
      // Animate card completely off screen
      const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
      setPosition({ x: exitX, y: position.y });
      setRotation(direction === 'right' ? 30 : -30);
      
      // Call swipe complete after animation
      setTimeout(() => handleSwipeCompleteWithCleanup(direction), 300);
    } else {
      setIsTransitioning(true);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    if (!isTop || !onSwipe) return;
    
    setIsDragging(true);
    const touch = e.touches[0];
    startPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isTop) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.current.x;
    const deltaY = touch.clientY - startPos.current.y;
    
    setPosition({ x: deltaX, y: deltaY });
    setRotation(deltaX * ROTATION_MULTIPLIER);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isTop) return;
    
    setIsDragging(false);
    
    if (Math.abs(position.x) > SWIPE_THRESHOLD) {
      const direction = position.x > 0 ? 'right' : 'left';
      // Enable transitions for smooth exit animation
      setIsTransitioning(true);
      // Animate card completely off screen
      const exitX = direction === 'right' ? window.innerWidth : -window.innerWidth;
      setPosition({ x: exitX, y: position.y });
      setRotation(direction === 'right' ? 30 : -30);
      
      // Call swipe complete after animation
      setTimeout(() => handleSwipeCompleteWithCleanup(direction), 300);
    } else {
      setIsTransitioning(true);
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  };

  // Button click handlers for accessibility
  const handleLikeClick = useCallback(() => {
    if (!isTop) return;
    // Enable transitions for smooth exit animation
    setIsTransitioning(true);
    // Animate card off screen to the right
    setPosition({ x: window.innerWidth, y: 0 });
    setRotation(30);
    setTimeout(() => handleSwipeCompleteWithCleanup('right'), 300);
  }, [isTop, handleSwipeCompleteWithCleanup]);

  const handleDislikeClick = useCallback(() => {
    if (!isTop) return;
    // Enable transitions for smooth exit animation
    setIsTransitioning(true);
    // Animate card off screen to the left
    setPosition({ x: -window.innerWidth, y: 0 });
    setRotation(-30);
    setTimeout(() => handleSwipeCompleteWithCleanup('left'), 300);
  }, [isTop, handleSwipeCompleteWithCleanup]);

  const cardStyle = {
    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
    opacity: isTop ? 1 - Math.abs(position.x) / 500 : 0.9,
    zIndex: isTop ? 10 : 5,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isTransitioning ? 'transform 0.3s ease, opacity 0.3s ease' : 'none'
  };

  return (
    <div
      ref={cardRef}
      className={`swipeable-card ${isTop ? 'top-card' : 'bottom-card'}`}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label={`Player card: ${profile.name}`}
    >
      {/* Profile Image Section */}
      <div className="swipeable-card-image-section">
        <div className="swipeable-card-image-container">
          {profile.image || profile.avatar ? (
            <img 
              src={profile.image || profile.avatar} 
              alt={`Portrait of ${profile.name}`}
              className="swipeable-card-image"
            />
          ) : (
            <div className="swipeable-card-placeholder">
              <span className="swipeable-card-initials">
                {profile.name?.split(' ').map(n => n[0]).join('') || '?'}
              </span>
            </div>
          )}
        </div>
        
        {/* Distance Badge - Only show if not placeholder */}
        {profile.distance && 
         profile.distance !== '-- miles away' && 
         profile.distance !== '--' && 
         !profile.distance.includes('--') && (
          <div className="swipeable-card-distance">
            <svg xmlns="http://www.w3.org/2000/svg" className="swipeable-card-distance-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {profile.distance}
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="swipeable-card-details">
        {/* Name and Age */}
        <div className="swipeable-card-header">
          <h2 className="swipeable-card-name">
            {profile.name}, {profile.age}
          </h2>
        </div>

        {/* Gender */}
        <div className="swipeable-card-gender-info">
          <span className="swipeable-card-gender-label">Gender:</span>
          <span className="swipeable-card-gender-value">
            {profile.gender === 'male' ? 'Male' : 
             profile.gender === 'female' ? 'Female' : 
             profile.gender === 'non-binary' ? 'Non-binary' : 
             'Prefer not to say'}
          </span>
        </div>

        {/* Skills and Ratings */}
        <div className="swipeable-card-skills">
          <div className="swipeable-card-skill-item">
            <span className="swipeable-card-skill-label">Skill:</span>
            <span className="swipeable-card-skill-badge">
              {profile.skillLevel || 'Not specified'}
            </span>
          </div>
          
          {profile.duprRating && 
           profile.duprRating !== 'unrated' && 
           profile.duprRating !== '' && (
            <div className="swipeable-card-skill-item">
              <span className="swipeable-card-skill-label">DUPR:</span>
              <span className="swipeable-card-dupr-badge">
                {profile.duprRating}
              </span>
            </div>
          )}
        </div>

        {/* Availability */}
        {profile.availability && profile.availability.length > 0 && (
          <div className="swipeable-card-availability">
            <span className="swipeable-card-availability-label">Available:</span>
            <div className="swipeable-card-availability-tags">
              {profile.availability.slice(0, MAX_AVAILABILITY_DISPLAY).map((time, index) => (
                <span key={index} className="swipeable-card-availability-tag">
                  {time}
                </span>
              ))}
              {profile.availability.length > MAX_AVAILABILITY_DISPLAY && (
                <span className="swipeable-card-availability-tag more">
                  +{profile.availability.length - MAX_AVAILABILITY_DISPLAY} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bio Preview */}
        {profile.bio && (
          <div className="swipeable-card-bio">
            <p>{profile.bio.length > BIO_PREVIEW_LENGTH ? `${profile.bio.slice(0, BIO_PREVIEW_LENGTH)}...` : profile.bio}</p>
          </div>
        )}

        {/* Action Buttons - Only show for top card */}
        {isTop && (
          <div className="swipeable-card-actions">
            <button 
              className="swipeable-card-dislike-btn"
              onClick={handleDislikeClick}
              aria-label="Pass"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
            
            <button 
              className="swipeable-card-like-btn"
              onClick={handleLikeClick}
              aria-label="Like"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Swipe Indicators - Only show for top card when actively dragging */}
      {isTop && isDragging && (
        <>
          <div className={`swipe-indicator left ${position.x < -50 ? 'active' : ''}`}>
            PASS
          </div>
          <div className={`swipe-indicator right ${position.x > 50 ? 'active' : ''}`}>
            LIKE
          </div>
        </>
      )}
    </div>
  );
});

SwipeableCard.displayName = 'SwipeableCard';

export default SwipeableCard;
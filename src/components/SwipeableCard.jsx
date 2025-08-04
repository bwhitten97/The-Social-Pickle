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
  const handleLikeClick = useCallback((e) => {
    if (!isTop) return;
    
    // Force reset button state to correct filled style
    const button = e.currentTarget;
    button.blur();
    button.style.background = '#3E5D45';
    button.style.color = 'white';
    button.style.transform = 'scale(1)';
    
    // Enable transitions for smooth exit animation
    setIsTransitioning(true);
    // Animate card off screen to the right
    setPosition({ x: window.innerWidth, y: 0 });
    setRotation(30);
    setTimeout(() => handleSwipeCompleteWithCleanup('right'), 300);
  }, [isTop, handleSwipeCompleteWithCleanup]);

  const handleDislikeClick = useCallback((e) => {
    if (!isTop) return;
    
    // Force reset button state to correct filled style
    const button = e.currentTarget;
    button.blur();
    button.style.background = '#f87171';
    button.style.color = 'white';
    button.style.transform = 'scale(1)';
    
    // Enable transitions for smooth exit animation
    setIsTransitioning(true);
    // Animate card off screen to the left
    setPosition({ x: -window.innerWidth, y: 0 });
    setRotation(-30);
    setTimeout(() => handleSwipeCompleteWithCleanup('left'), 300);
  }, [isTop, handleSwipeCompleteWithCleanup]);

  // Reset button states when profile changes
  useEffect(() => {
    if (cardRef.current) {
      const likeBtn = cardRef.current.querySelector('.swipeable-card-like-btn');
      const dislikeBtn = cardRef.current.querySelector('.swipeable-card-dislike-btn');
      
      if (likeBtn) {
        likeBtn.style.background = '#3E5D45';
        likeBtn.style.color = 'white';
        likeBtn.style.transform = 'scale(1)';
        likeBtn.style.outline = 'none';
        likeBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        likeBtn.style.border = '2px solid #3E5D45';
        likeBtn.blur();
        likeBtn.removeAttribute('data-focus');
      }
      
      if (dislikeBtn) {
        dislikeBtn.style.background = '#f87171';
        dislikeBtn.style.color = 'white';
        dislikeBtn.style.transform = 'scale(1)';
        dislikeBtn.style.outline = 'none';
        dislikeBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        dislikeBtn.style.border = '2px solid #f87171';
        dislikeBtn.blur();
        dislikeBtn.removeAttribute('data-focus');
      }
      
      // Force remove focus from any focused elements
      if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
      }
    }
  }, [profile.id, profile.name]); // Reset when profile changes

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
        {/* Header: Name, Age (left) + Skill Level or DUPR (right) */}
        <div className="swipeable-card-header">
          <h2 className="swipeable-card-name">
            <span className="swipeable-card-name-bold">{profile.name}</span>, {profile.age}
          </h2>
          <span className="swipeable-card-skill-text">
            {profile.duprRating && profile.duprRating !== 'unrated' && profile.duprRating !== '' 
              ? `DUPR: ${profile.duprRating}`
              : profile.skillLevel 
                ? profile.skillLevel.charAt(0).toUpperCase() + profile.skillLevel.slice(1).toLowerCase() 
                : 'Not Specified'}
          </span>
        </div>


        {/* Availability */}
        {profile.availability && profile.availability.length > 0 && (
          <div className="swipeable-card-availability">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="swipeable-card-info-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span className="swipeable-card-availability-colon">:</span>
            <div className="swipeable-card-availability-tags">
              {profile.availability.map((time, index) => (
                <span key={index} className="swipeable-card-availability-tag">
                  {time.charAt(0).toUpperCase() + time.slice(1).toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio Section */}
        <div className="swipeable-card-bio-section">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="swipeable-card-info-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <span className="swipeable-card-bio-colon">:</span>
          <div className="swipeable-card-bio-content">
            {profile.bio && profile.bio.trim() !== '' ? (
              <p className="swipeable-card-bio-text">{profile.bio}</p>
            ) : (
              <p className="swipeable-card-bio-fallback">
                {profile.name?.split(' ')[0] || 'User'} is new to The Social Pickle
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons - Only show for top card */}
        {isTop && (
          <div className="swipeable-card-actions">
            <button 
              className="swipeable-card-dislike-btn"
              onClick={handleDislikeClick}
              aria-label="Pass"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width: '17px', height: '17px', minWidth: '17px', minHeight: '17px'}}>
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
            
            <button 
              className="swipeable-card-like-btn"
              onClick={handleLikeClick}
              aria-label="Like"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width: '17px', height: '17px', minWidth: '17px', minHeight: '17px'}}>
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
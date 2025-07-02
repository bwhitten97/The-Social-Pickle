import { useState, useRef } from 'react';
import './SwipeableCard.css';

const SwipeableCard = ({ profile, onSwipe, isTop }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const cardRef = useRef(null);
  const startPos = useRef({ x: 0, y: 0 });

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
    setRotation(deltaX * 0.1);
  };

  const handleMouseUp = () => {
    if (!isDragging || !isTop) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(position.x) > threshold) {
      const direction = position.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    } else {
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  };

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
    setRotation(deltaX * 0.1);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isTop) return;
    
    setIsDragging(false);
    
    const threshold = 100;
    if (Math.abs(position.x) > threshold) {
      const direction = position.x > 0 ? 'right' : 'left';
      onSwipe(direction);
    } else {
      setPosition({ x: 0, y: 0 });
      setRotation(0);
    }
  };

  const cardStyle = {
    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
    opacity: isTop ? 1 - Math.abs(position.x) / 300 : 0.8,
    zIndex: isTop ? 10 : 5,
    cursor: isDragging ? 'grabbing' : 'grab'
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
    >
      <div className="card-content">
        <div className="profile-image">
          <div className="image-placeholder">
            {profile.name.charAt(0)}
          </div>
        </div>
        
        <div className="profile-info">
          <h2 className="name">{profile.name}</h2>
          <div className="details">
            <div className="detail-item">
              <span className="label">Gender:</span>
              <span className="value">{profile.gender}</span>
            </div>
            <div className="detail-item">
              <span className="label">Skill:</span>
              <span className="value">{profile.skill}</span>
            </div>
            <div className="detail-item">
              <span className="label">Available:</span>
              <span className="value">{profile.availability}</span>
            </div>
          </div>
        </div>
      </div>
      
      {isTop && (
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
};

export default SwipeableCard;
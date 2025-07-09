import { useState } from 'react';
import './DiscoverCard.css';

const DiscoverCard = ({ profile, onLike, onDislike }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLike = () => {
    setIsAnimating(true);
    onLike();
    setTimeout(() => setIsAnimating(false), 350);
  };

  const handleDislike = () => {
    setIsAnimating(true);
    onDislike();
    setTimeout(() => setIsAnimating(false), 350);
  };

  const getSkillColor = (skill) => {
    switch (skill?.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getPlayStyleIcon = (playStyle) => {
    return '';
  };

  return (
    <article className="discover-card" aria-label={`Player card: ${profile.name}`}>
      {/* Profile Image Section - Made Larger */}
      <div className="discover-card-image-section">
        <div className="discover-card-image-container">
          {profile.image || profile.avatar ? (
            <img 
              src={profile.image || profile.avatar} 
              alt={`Portrait of ${profile.name}`}
              className="discover-card-image"
            />
          ) : (
            <div className="discover-card-placeholder">
              <span className="discover-card-initials">
                {profile.name?.split(' ').map(n => n[0]).join('') || '?'}
              </span>
            </div>
          )}
        </div>
        
        {/* Distance Badge */}
        <div className="discover-card-distance-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {profile.distance || '5 miles away'}
        </div>
      </div>

      {/* Details Section */}
      <div className="discover-card-details">
        {/* Name and Age */}
        <div className="discover-card-header">
          <h2 className="discover-card-name">
            {profile.name}, {profile.age}
          </h2>
          {profile.gender && (
            <span className="discover-card-gender">
              {profile.gender === 'male' ? '♂' : profile.gender === 'female' ? '♀' : '⚧'}
            </span>
          )}
        </div>

        {/* Gender */}
        <div className="discover-card-gender-info">
          <span className="discover-card-gender-label">Gender:</span>
          <span className="discover-card-gender-value">
            {profile.gender === 'male' ? 'Male' : 
             profile.gender === 'female' ? 'Female' : 
             profile.gender === 'non-binary' ? 'Non-binary' : 
             'Prefer not to say'}
          </span>
        </div>

        {/* Skills and Ratings */}
        <div className="discover-card-skills">
          <div className="discover-card-skill-item">
            <span className="discover-card-skill-label">Skill:</span>
            <span 
              className="discover-card-skill-badge"
              style={{ backgroundColor: getSkillColor(profile.skillLevel) }}
            >
              {profile.skillLevel || 'Not specified'}
            </span>
          </div>
          
          {profile.duprRating && profile.duprRating !== 'unrated' && (
            <div className="discover-card-skill-item">
              <span className="discover-card-skill-label">DUPR:</span>
              <span className="discover-card-dupr-badge">
                {profile.duprRating}
              </span>
            </div>
          )}
        </div>

        {/* Play Style and Experience */}
        <div className="discover-card-info-grid">
          <div className="discover-card-info-item">
            <span className="discover-card-info-icon">
              {getPlayStyleIcon(profile.playStyle)}
            </span>
            <span className="discover-card-info-text">
              {profile.playStyle || 'Casual'}
            </span>
          </div>
          
          <div className="discover-card-info-item">
            <span className="discover-card-info-text">
              {profile.playingExperience || profile.experience || 'New player'}
            </span>
          </div>
        </div>

        {/* Availability */}
        {profile.availability && profile.availability.length > 0 && (
          <div className="discover-card-availability">
            <span className="discover-card-availability-label">Available:</span>
            <div className="discover-card-availability-tags">
              {profile.availability.slice(0, 3).map((time, index) => (
                <span key={index} className="discover-card-availability-tag">
                  {time}
                </span>
              ))}
              {profile.availability.length > 3 && (
                <span className="discover-card-availability-tag more">
                  +{profile.availability.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Bio Preview */}
        {profile.bio && (
          <div className="discover-card-bio">
            <p>{profile.bio.length > 80 ? `${profile.bio.slice(0, 80)}...` : profile.bio}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="discover-card-actions">
          <button 
            className={`discover-card-dislike-btn ${isAnimating ? 'discover-card-btn-animate' : ''}`}
            onClick={handleDislike}
            aria-label="Pass"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          
          <button 
            className={`discover-card-like-btn ${isAnimating ? 'discover-card-btn-animate' : ''}`}
            onClick={handleLike}
            aria-label="Like"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};

export default DiscoverCard; 
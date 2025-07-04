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

  return (
    <article className="discover-card" aria-label={`Player card: ${profile.name}`}>
      {/* Avatar Section */}
      <div className="discover-card-avatar-section">
        <img 
          src={profile.image} 
          alt={`Portrait of ${profile.name}`}
          className="discover-card-avatar"
        />
        <span className="discover-card-distance">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="discover-card-map-icon">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {profile.distance}
        </span>
      </div>

      {/* Details Section */}
      <div className="discover-card-details">
        <h2 className="discover-card-name discover-fade-in">
          {profile.name}, {profile.age}
        </h2>

        <p className="discover-card-experience discover-fade-in">
          <span>🏓</span>
          {profile.experience}
        </p>

        <div className="discover-card-tags discover-fade-in">
          <span className="discover-card-tag">{profile.skillLevel}</span>
          <span className="discover-card-tag">{profile.availability}</span>
        </div>

        {/* Divider */}
        <div className="discover-card-divider"></div>

        {/* Action Buttons */}
        <div className="discover-card-actions discover-fade-in">
          <button 
            className={`discover-card-dislike-btn ${isAnimating ? 'discover-card-btn-animate' : ''}`}
            onClick={handleDislike}
            aria-label="Dislike"
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
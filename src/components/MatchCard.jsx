import React, { memo, useCallback } from 'react';
import './MatchCard.css';

const MatchCard = memo(({ player, onPass, onConnect, isConnecting }) => {
  const getSkillColor = useCallback((skill) => {
    switch (skill.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }, []);

  const getAvailabilityIcon = useCallback((availability) => {
    switch (availability.toLowerCase()) {
      case 'mornings':
        return '🌅';
      case 'afternoons':
        return '☀️';
      case 'evenings':
        return '🌆';
      case 'weekends':
        return '📅';
      default:
        return '⏰';
    }
  }, []);

  return (
    <div className="swipe-card-container">
      <div className={`swipe-card ${isConnecting ? 'connecting' : ''}`}>
        {isConnecting && (
          <div className="success-overlay">
            <div className="success-message">
              ✅ Connected!
            </div>
          </div>
        )}
        
        <div className="card-content">
          <div className="player-avatar">
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
          
          <div className="player-info">
            <h2 className="player-name">{player.name}</h2>
            <p className="player-gender">{player.gender}</p>
          </div>
          
          <div className="player-stats">
            <div className="stat-item">
              <span className="stat-label">Skill Level</span>
              <span 
                className="skill-badge"
                style={{ backgroundColor: getSkillColor(player.skillLevel) }}
              >
                {player.skillLevel}
              </span>
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Available</span>
              <span className="availability">
                {getAvailabilityIcon(player.availability)} {player.availability}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="swipe-actions">
        <button 
          className="action-btn pass-btn" 
          onClick={onPass}
          disabled={isConnecting}
        >
          <span className="btn-icon">❌</span>
          <span className="btn-text">Pass</span>
        </button>
        <button 
          className="action-btn connect-btn" 
          onClick={onConnect}
          disabled={isConnecting}
        >
          <span className="btn-icon">✅</span>
          <span className="btn-text">{isConnecting ? 'Connecting...' : 'Connect'}</span>
        </button>
      </div>
    </div>
  );
});

MatchCard.displayName = 'MatchCard';

export default MatchCard;
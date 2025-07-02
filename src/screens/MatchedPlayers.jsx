import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import './MatchedPlayers.css';

const MatchedPlayers = () => {
  const { matchedPlayers } = useGameContext();
  const [filter, setFilter] = useState('all');

  const filteredMatches = matchedPlayers.filter(player => {
    if (filter === 'all') return true;
    return player.skillLevel.toLowerCase() === filter;
  });

  const getSkillColor = (skill) => {
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
  };

  const getAvailabilityIcon = (availability) => {
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
  };

  const formatMatchDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Connected today';
    } else if (diffDays <= 7) {
      return `Connected ${diffDays} days ago`;
    } else {
      return `Connected on ${date.toLocaleDateString()}`;
    }
  };

  return (
    <div className="matched-players-screen">
      <div className="screen-header">
        <h1>Your Connections</h1>
        <p>Players you've connected with for pickleball games</p>
      </div>

      {matchedPlayers.length > 0 && (
        <div className="stats-banner">
          <div className="stat-item">
            <span className="stat-number">{matchedPlayers.length}</span>
            <span className="stat-label">Total Connections</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {matchedPlayers.filter(p => p.skillLevel.toLowerCase() === 'advanced').length}
            </span>
            <span className="stat-label">Advanced Players</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {matchedPlayers.filter(p => p.availability.toLowerCase() === 'weekends').length}
            </span>
            <span className="stat-label">Weekend Players</span>
          </div>
        </div>
      )}

      {matchedPlayers.length > 0 && (
        <div className="filter-bar">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({matchedPlayers.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'beginner' ? 'active' : ''}`}
            onClick={() => setFilter('beginner')}
          >
            Beginner ({matchedPlayers.filter(p => p.skillLevel.toLowerCase() === 'beginner').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'intermediate' ? 'active' : ''}`}
            onClick={() => setFilter('intermediate')}
          >
            Intermediate ({matchedPlayers.filter(p => p.skillLevel.toLowerCase() === 'intermediate').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'advanced' ? 'active' : ''}`}
            onClick={() => setFilter('advanced')}
          >
            Advanced ({matchedPlayers.filter(p => p.skillLevel.toLowerCase() === 'advanced').length})
          </button>
        </div>
      )}

      <div className="matched-players-content">
        {filteredMatches.length > 0 ? (
          <div className="players-grid">
            {filteredMatches.map((player, index) => (
              <div key={`${player.id}-${index}`} className="matched-player-card">
                <div className="connection-badge">
                  ✅ Connected
                </div>
                
                <div className="player-avatar">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </div>
                
                <div className="player-info">
                  <h3 className="player-name">{player.name}</h3>
                  <span className="player-gender">{player.gender}</span>
                </div>
                
                <div className="player-details">
                  <div className="detail-row">
                    <span className="detail-label">Skill Level:</span>
                    <span 
                      className="skill-badge"
                      style={{ backgroundColor: getSkillColor(player.skillLevel) }}
                    >
                      {player.skillLevel}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Available:</span>
                    <span className="availability">
                      {getAvailabilityIcon(player.availability)} {player.availability}
                    </span>
                  </div>
                  
                  <div className="detail-row">
                    <span className="detail-label">Connected:</span>
                    <span className="match-date">
                      {formatMatchDate(player.matchedAt)}
                    </span>
                  </div>
                </div>
                
                <div className="player-actions">
                  <button className="action-btn message-btn">
                    💬 Message
                  </button>
                  <button className="action-btn invite-btn">
                    🏓 Invite to Game
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : matchedPlayers.length === 0 ? (
          <div className="no-connections">
            <div className="no-connections-icon">🤝</div>
            <h3>No Connections Yet</h3>
            <p>Start connecting with players in the Match Feed to see them here!</p>
            <div className="connection-tips">
              <h4>Tips for making connections:</h4>
              <ul>
                <li>Browse through player profiles in the Match Feed</li>
                <li>Look for players with similar skill levels</li>
                <li>Check availability that matches your schedule</li>
                <li>Click "Connect" to start building your network</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="no-filtered-matches">
            <div className="no-matches-icon">🔍</div>
            <h3>No {filter} players found</h3>
            <p>Try adjusting your filter or connect with more players!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchedPlayers;
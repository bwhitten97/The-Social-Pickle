import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import './GameFeed.css';

const GameFeed = () => {
  const { games, requestToJoinGame, hasUserApplied } = useGameContext();
  const [filter, setFilter] = useState('all');

  const filteredGames = games.filter(game => {
    if (filter === 'all') return true;
    return game.skillLevel === filter;
  });

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      case 'mixed':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const handleRequestToJoin = (gameId) => {
    const result = requestToJoinGame(gameId, "Looking forward to playing!");
    
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="game-feed">
      <div className="feed-header">
        <h1>Available Games</h1>
        <p>Find and join pickleball games in your area</p>
      </div>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Games
        </button>
        <button 
          className={`filter-btn ${filter === 'beginner' ? 'active' : ''}`}
          onClick={() => setFilter('beginner')}
        >
          Beginner
        </button>
        <button 
          className={`filter-btn ${filter === 'intermediate' ? 'active' : ''}`}
          onClick={() => setFilter('intermediate')}
        >
          Intermediate
        </button>
        <button 
          className={`filter-btn ${filter === 'advanced' ? 'active' : ''}`}
          onClick={() => setFilter('advanced')}
        >
          Advanced
        </button>
        <button 
          className={`filter-btn ${filter === 'mixed' ? 'active' : ''}`}
          onClick={() => setFilter('mixed')}
        >
          Mixed
        </button>
      </div>

      <div className="games-list">
        {filteredGames.map(game => (
          <div key={game.id} className="game-card">
            <div className="game-header">
              <div className="game-info">
                <h3 className="game-location">{game.location}</h3>
                <p className="game-host">Hosted by {game.createdBy}</p>
              </div>
              <span 
                className="skill-badge"
                style={{ backgroundColor: getSkillColor(game.skillLevel) }}
              >
                {game.skillLevel}
              </span>
            </div>

            <div className="game-details">
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{formatDate(game.date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span>{formatTime(game.time)}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-item">
                  <span className="detail-icon">👥</span>
                  <span>{game.openSpots} spots open</span>
                </div>
              </div>

              {game.description && (
                <p className="game-description">{game.description}</p>
              )}
            </div>

            <div className="game-actions">
              <button 
                className={`join-btn ${hasUserApplied(game.id) ? 'applied' : ''}`}
                onClick={() => handleRequestToJoin(game.id)}
                disabled={game.openSpots === 0 || hasUserApplied(game.id)}
              >
                {game.openSpots === 0 
                  ? 'Game Full' 
                  : hasUserApplied(game.id) 
                    ? 'Applied' 
                    : 'Request to Join'
                }
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="no-games">
          <div className="no-games-icon">🏓</div>
          <h3>No games found</h3>
          <p>Try adjusting your filters or check back later for new games.</p>
        </div>
      )}
    </div>
  );
};

export default GameFeed;
import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import './Games.css';

const Games = () => {
  const { games, applications, applyToGame } = useGameContext();
  const [showPostForm, setShowPostForm] = useState(false);
  const [newGame, setNewGame] = useState({
    title: '',
    location: '',
    date: '',
    time: '',
    maxPlayers: 4,
    skillLevel: 'all',
    description: ''
  });

  // Mock current user ID
  const currentUserId = 1;

  const myGames = games.filter(game => game.hostId === currentUserId);
  const otherGames = games.filter(game => game.hostId !== currentUserId);

  const getApplicationCount = (gameId) => {
    return applications.filter(app => app.gameId === gameId).length;
  };

  const hasApplied = (gameId) => {
    return applications.some(app => app.gameId === gameId && app.playerId === currentUserId);
  };

  const handlePostGame = (e) => {
    e.preventDefault();
    // This would normally be handled by the context
    console.log('Posting new game:', newGame);
    setShowPostForm(false);
    setNewGame({
      title: '',
      location: '',
      date: '',
      time: '',
      maxPlayers: 4,
      skillLevel: 'all',
      description: ''
    });
  };

  const handleRequestToJoin = (gameId) => {
    applyToGame(gameId, currentUserId);
  };

  return (
    <div className="games-screen">
      <div className="games-header">
        <div className="header-content">
          <h1>🏓 Games</h1>
          <button 
            className="post-game-btn"
            onClick={() => setShowPostForm(true)}
          >
            <span className="btn-icon">➕</span>
            <span className="btn-text">Post a Game</span>
          </button>
        </div>
      </div>

      {showPostForm && (
        <div className="post-form-overlay">
          <div className="post-form-modal">
            <div className="modal-header">
              <h2>Post a New Game</h2>
              <button 
                className="close-btn"
                onClick={() => setShowPostForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handlePostGame} className="post-form">
              <div className="form-group">
                <label>Game Title</label>
                <input
                  type="text"
                  value={newGame.title}
                  onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                  placeholder="e.g., Casual Pickleball at Central Park"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={newGame.location}
                  onChange={(e) => setNewGame({...newGame, location: e.target.value})}
                  placeholder="e.g., Central Park Courts"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={newGame.date}
                    onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newGame.time}
                    onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Max Players</label>
                  <select
                    value={newGame.maxPlayers}
                    onChange={(e) => setNewGame({...newGame, maxPlayers: parseInt(e.target.value)})}
                  >
                    <option value={2}>2 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={6}>6 Players</option>
                    <option value={8}>8 Players</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Skill Level</label>
                  <select
                    value={newGame.skillLevel}
                    onChange={(e) => setNewGame({...newGame, skillLevel: e.target.value})}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newGame.description}
                  onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                  placeholder="Add any additional details about the game..."
                  rows={3}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowPostForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Post Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="games-content">
        {/* My Games Section */}
        <section className="games-section">
          <div className="section-header">
            <h2>My Games</h2>
            <span className="game-count">{myGames.length}</span>
          </div>
          
          {myGames.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏓</div>
              <h3>No games posted yet</h3>
              <p>Click "Post a Game" to organize your first pickleball game!</p>
            </div>
          ) : (
            <div className="games-grid">
              {myGames.map(game => (
                <div key={game.id} className="game-card my-game">
                  <div className="game-header">
                    <h3 className="game-title">{game.title}</h3>
                    <span className="host-badge">Host</span>
                  </div>
                  
                  <div className="game-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{game.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{game.date} at {game.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">👥</span>
                      <span>{game.maxPlayers} players max</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🏅</span>
                      <span className="skill-level">{game.skillLevel}</span>
                    </div>
                  </div>
                  
                  {game.description && (
                    <p className="game-description">{game.description}</p>
                  )}
                  
                  <div className="game-actions">
                    <button className="applicants-btn">
                      👥 View Applicants ({getApplicationCount(game.id)})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Find a Game Section */}
        <section className="games-section">
          <div className="section-header">
            <h2>Find a Game</h2>
            <span className="game-count">{otherGames.length}</span>
          </div>
          
          {otherGames.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No games available</h3>
              <p>Check back later for new games in your area!</p>
            </div>
          ) : (
            <div className="games-grid">
              {otherGames.map(game => (
                <div key={game.id} className="game-card">
                  <div className="game-header">
                    <h3 className="game-title">{game.title}</h3>
                    <span className="host-name">by {game.hostName}</span>
                  </div>
                  
                  <div className="game-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>{game.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <span>{game.date} at {game.time}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">👥</span>
                      <span>{game.maxPlayers} players max</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🏅</span>
                      <span className="skill-level">{game.skillLevel}</span>
                    </div>
                  </div>
                  
                  {game.description && (
                    <p className="game-description">{game.description}</p>
                  )}
                  
                  <div className="game-actions">
                    <button 
                      className={`join-btn ${hasApplied(game.id) ? 'applied' : ''}`}
                      onClick={() => handleRequestToJoin(game.id)}
                      disabled={hasApplied(game.id)}
                    >
                      {hasApplied(game.id) ? '✓ Applied' : '🙋‍♂️ Request to Join'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Games;
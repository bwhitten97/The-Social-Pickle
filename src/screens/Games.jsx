import React, { useState, memo } from 'react';
import { useGameContext } from '../context/GameContext';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import Notification from '../components/Notification';
import './Games.css';

const Games = memo(({ addAppNotification }) => {
  const [activeTab, setActiveTab] = useState('find');
  
  // Get data from GameContext
  const { 
    games, 
    applications,
    currentUserName,
    currentUserId,
    isInitialized,
    hasUserApplied,
    getUserApplications,
    addGame,
    requestToJoinGame
  } = useGameContext();
  
  // Component state
  const [showPostForm, setShowPostForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [notification, setNotification] = useState(null);
  const [requestData, setRequestData] = useState({
    playerCount: 1,
    message: ''
  });
  const [newGame, setNewGame] = useState({
    location: '',
    date: '',
    time: '',
    skillLevel: 'beginner',
    duprRating: 'unrated',
    gameType: 'doubles',
    openSpots: 4,
    description: ''
  });
  
  // Use context games if initialized, otherwise show loading
  const displayGames = isInitialized ? games : [];
  
  // Filter games for "Find" tab (exclude user's own games and applied games)
  const findGames = displayGames.filter(game => 
    game.createdBy !== currentUserName && !hasUserApplied(game.id)
  );
  
  // Get user's own games
  const myGames = displayGames.filter(game => game.createdBy === currentUserName);
  
  // Get user's applications
  const myApplications = getUserApplications ? getUserApplications() : [];

  // Handler functions
  const handlePostGame = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newGame.location || !newGame.date || !newGame.time) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      // Add the game using context
      const result = await addGame({
        ...newGame,
        totalSpots: newGame.openSpots
      });
      
      if (result.success) {
        // Reset form and close modal
        setShowPostForm(false);
        setNewGame({
          location: '',
          date: '',
          time: '',
          skillLevel: 'beginner',
          duprRating: 'unrated',
          gameType: 'doubles',
          openSpots: 4,
          description: ''
        });
        
        // Switch to "My Games" tab to show the newly created game
        setActiveTab('mygames');
        
        setNotification({
          message: 'Game posted successfully!',
          name: 'Success',
          emoji: '✅'
        });
      } else {
        setNotification({
          message: result.message || 'Failed to post game',
          name: 'Error',
          emoji: '❌'
        });
      }
    } catch (error) {
      console.error('Error posting game:', error);
      setNotification({
        message: 'Failed to post game',
        name: 'Error',
        emoji: '❌'
      });
    }
  };

  const handleRequestToJoin = (game) => {
    setSelectedGame(game);
    setShowRequestModal(true);
  };

  const submitJoinRequest = async () => {
    if (!selectedGame) return;
    
    try {
      const message = requestData.message || `I'd like to join this game with ${requestData.playerCount} player${requestData.playerCount > 1 ? 's' : ''}!`;
      const result = await requestToJoinGame(selectedGame.id, message, requestData.playerCount);
      
      if (result.success) {
        setNotification({
          message: 'Application submitted successfully!',
          name: selectedGame.createdBy || 'Game Host',
          emoji: '✅'
        });
        setShowRequestModal(false);
        setRequestData({ playerCount: 1, message: '' });
        setSelectedGame(null);
      } else {
        setNotification({
          message: result.message,
          name: 'Error',
          emoji: '❌'
        });
      }
    } catch (error) {
      console.error('Error submitting join request:', error);
      setNotification({
        message: 'Failed to submit application',
        name: 'Error',
        emoji: '❌'
      });
    }
  };

  const cancelJoinRequest = () => {
    setShowRequestModal(false);
    setRequestData({ playerCount: 1, message: '' });
    setSelectedGame(null);
  };

  return (
    <div className="games-container">
      <main className="games-main">
        <div className="games-content-wrapper">
          <section className="games-header-section">
            <h1 className="games-title">Games</h1>
            <div className="games-actions">
              <div className="games-nav-section">
                <button 
                  className={`games-nav-btn ${activeTab === 'find' ? 'active' : ''}`}
                  onClick={() => setActiveTab('find')}
                >
                  Find
                </button>
                <button 
                  className={`games-nav-btn ${activeTab === 'mygames' ? 'active' : ''}`}
                  onClick={() => setActiveTab('mygames')}
                >
                  My Games ({myGames.length})
                </button>
                
                <button 
                  className={`games-nav-btn ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  My Requests ({myApplications.length})
                </button>
              </div>

              {activeTab === 'find' && (
                <button 
                  className="games-post-btn"
                  onClick={() => setShowPostForm(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Post a Game
                </button>
              )}
            </div>
          </section>

          <h2 className="games-section-title">
            {activeTab === 'find' && `Available Games (${findGames.length})`}
            {activeTab === 'mygames' && 'My Games'}
            {activeTab === 'requests' && 'My Requests'}
          </h2>

          <section className="games-cards-section">
            {!isInitialized && (
              <div className="games-empty-state">
                <h3>Loading games...</h3>
              </div>
            )}
            
            {isInitialized && activeTab === 'find' && findGames.map((game) => (
              <article key={game.id} className="games-card">
                <h3 className="games-card-title">{game.location}</h3>
                <div className="games-card-content">
                  <div className="games-datetime">{game.date} • {game.time}</div>
                  <div className="games-players">{game.totalSpots - game.openSpots} / {game.totalSpots} players</div>
                  <div className="games-details-row">
                    <span className="games-type-badge">{game.gameType}</span>
                    <span className="games-type-badge">{game.skillLevel}</span>
                  </div>
                </div>
                <button 
                  className="games-join-btn"
                  onClick={() => handleRequestToJoin(game)}
                >
                  Request to Join
                </button>
              </article>
            ))}
            
            {/* My Games Tab */}
            {isInitialized && activeTab === 'mygames' && (
              myGames.length > 0 ? (
                myGames.map((game) => (
                  <article key={game.id} className="games-card">
                    <h3 className="games-card-title">{game.location}</h3>
                    <div className="games-card-content">
                      <div className="games-datetime">{game.date} • {game.time}</div>
                      <div className="games-players">{game.totalSpots - game.openSpots} / {game.totalSpots} players</div>
                      <div className="games-details-row">
                        <span className="games-type-badge">{game.gameType}</span>
                        <span className="games-type-badge">{game.skillLevel}</span>
                      </div>
                    </div>
                    <button className="games-join-btn">Manage Game</button>
                  </article>
                ))
              ) : (
                <div className="games-empty-state">
                  <h3>No games posted yet</h3>
                  <p>Click "Post a Game" to create your first game!</p>
                </div>
              )
            )}
            
            {/* My Requests Tab */}
            {isInitialized && activeTab === 'requests' && (
              myApplications.length > 0 ? (
                myApplications.map((application) => {
                  const game = games.find(g => g.id === application.gameId);
                  if (!game) return null;
                  
                  return (
                    <article key={application.id} className="games-card">
                      <h3 className="games-card-title">{game.location}</h3>
                      <div className="games-card-content">
                        <div className="games-datetime">{game.date} • {game.time}</div>
                        <div className="games-players">{game.totalSpots - game.openSpots} / {game.totalSpots} players</div>
                        <div className="games-details-row">
                          <span className="games-type-badge">{game.gameType}</span>
                          <span className="games-type-badge">{game.skillLevel}</span>
                          <span className="games-type-badge" style={{ 
                            backgroundColor: application.status === 'accepted' ? '#3E5D45' : 
                                           application.status === 'rejected' ? '#F25C5C' : '#F39C12' 
                          }}>
                            {application.status}
                          </span>
                        </div>
                      </div>
                      <button className="games-join-btn">View Application</button>
                    </article>
                  );
                })
              ) : (
                <div className="games-empty-state">
                  <h3>No requests yet</h3>
                  <p>Apply to games to see your requests here!</p>
                </div>
              )
            )}
          </section>
        </div>
      </main>

      {/* Post Game Modal */}
      {showPostForm && (
        <div className="games-modal-overlay" onClick={() => setShowPostForm(false)}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Post a New Game</h2>
              <button 
                className="games-close-btn"
                onClick={() => setShowPostForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handlePostGame} className="games-form">
              <div className="games-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={newGame.location}
                  onChange={(e) => setNewGame({...newGame, location: e.target.value})}
                  placeholder="e.g., Central Park Courts"
                  required
                />
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Date *</label>
                  <DatePicker
                    value={newGame.date}
                    onChange={(date) => setNewGame({...newGame, date})}
                    className="games-form-input"
                  />
                </div>
                
                <div className="games-form-group">
                  <label>Time *</label>
                  <TimePicker
                    value={newGame.time}
                    onChange={(time) => setNewGame({...newGame, time})}
                    className="games-form-input"
                  />
                </div>
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Game Type</label>
                  <select
                    value={newGame.gameType}
                    onChange={(e) => setNewGame({...newGame, gameType: e.target.value})}
                    className="games-form-select"
                  >
                    <option value="singles">Singles</option>
                    <option value="doubles">Doubles</option>
                    <option value="mixed-doubles">Mixed Doubles</option>
                    <option value="round-robin">Round Robin</option>
                  </select>
                </div>
                
                <div className="games-form-group">
                  <label>Skill Level</label>
                  <select
                    value={newGame.skillLevel}
                    onChange={(e) => setNewGame({...newGame, skillLevel: e.target.value})}
                    className="games-form-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="mixed">Mixed (All Levels)</option>
                  </select>
                </div>
              </div>
              
              <div className="games-form-group">
                <label>Players Needed</label>
                <select
                  value={newGame.openSpots}
                  onChange={(e) => setNewGame({...newGame, openSpots: parseInt(e.target.value)})}
                  className="games-form-select"
                >
                  <option value={1}>1 Player</option>
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                  <option value={5}>5 Players</option>
                  <option value={6}>6 Players</option>
                </select>
              </div>
              
              <div className="games-form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newGame.description}
                  onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                  placeholder="Add any additional details about the game..."
                  rows={3}
                  className="games-form-textarea"
                />
              </div>
              
              <div className="games-form-actions">
                <button 
                  type="button" 
                  className="games-cancel-btn"
                  onClick={() => setShowPostForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="games-submit-btn">
                  Post Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request to Join Modal */}
      {showRequestModal && selectedGame && (
        <div className="games-modal-overlay" onClick={cancelJoinRequest}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Request to Join Game</h2>
              <button className="games-close-btn" onClick={cancelJoinRequest}>
                ✕
              </button>
            </div>
            
            <div className="games-form">
              {/* Game Info Display */}
              <div className="games-request-game-info">
                <h3 className="games-request-game-title">{selectedGame.location}</h3>
                <div className="games-request-game-details">
                  <div className="games-datetime">{selectedGame.date} • {selectedGame.time}</div>
                  <div className="games-request-badges">
                    <span className="games-type-badge">{selectedGame.gameType || 'Doubles'}</span>
                    <span className="games-type-badge">{selectedGame.skillLevel}</span>
                  </div>
                  <div className="games-request-host">Hosted by {selectedGame.createdBy}</div>
                </div>
              </div>

              {/* Request Form */}
              <div className="games-form-group">
                <label>How many players?</label>
                <select
                  value={requestData.playerCount}
                  onChange={(e) => setRequestData(prev => ({ ...prev, playerCount: parseInt(e.target.value) }))}
                  className="games-form-select"
                >
                  <option value={1}>1 Player (Just me)</option>
                  <option value={2}>2 Players</option>
                  <option value={3}>3 Players</option>
                  <option value={4}>4 Players</option>
                </select>
              </div>
              
              <div className="games-form-group">
                <label>Message (Optional)</label>
                <textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Add a message for the game host..."
                  rows={3}
                  className="games-form-textarea"
                  maxLength={200}
                />
              </div>
              
              <div className="games-form-actions">
                <button 
                  type="button" 
                  className="games-cancel-btn"
                  onClick={cancelJoinRequest}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="games-submit-btn"
                  onClick={submitJoinRequest}
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification
          message={notification.message}
          name={notification.name}
          emoji={notification.emoji}
          onClose={() => setNotification(null)}
          duration={2000}
        />
      )}
    </div>
  );
});

Games.displayName = 'Games';

export default Games;
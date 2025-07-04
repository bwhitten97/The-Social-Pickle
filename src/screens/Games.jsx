import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import './Games.css';

const Games = () => {
  const { 
    games, 
    applications, 
    currentUserId, 
    currentUserName, 
    addGame, 
    requestToJoinGame, 
    getUserApplications,
    getGameApplications,
    hasUserApplied
  } = useGameContext();
  
  const [showPostForm, setShowPostForm] = useState(false);
  const [activeTab, setActiveTab] = useState('find'); // 'find', 'mygames', 'requests'
  const [newGame, setNewGame] = useState({
    location: '',
    date: '',
    time: '',
    skillLevel: 'beginner',
    openSpots: 4,
    description: ''
  });

  const myGames = games.filter(game => game.createdBy === currentUserName);
  const otherGames = games.filter(game => game.createdBy !== currentUserName);
  const myApplications = getUserApplications();

  const getApplicationCount = (gameId) => {
    return applications.filter(app => app.gameId === gameId).length;
  };

  const hasApplied = (gameId) => {
    return applications.some(app => app.gameId === gameId && app.playerId === currentUserId);
  };

  const handlePostGame = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!newGame.location || !newGame.date || !newGame.time) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Add the game using context
    addGame(newGame);
    
    // Reset form and close modal
    setShowPostForm(false);
    setNewGame({
      location: '',
      date: '',
      time: '',
      skillLevel: 'beginner',
      openSpots: 4,
      description: ''
    });
    
    // Switch to "My Games" tab to show the newly created game
    setActiveTab('mygames');
  };

  const handleRequestToJoin = (gameId) => {
    const result = requestToJoinGame(gameId, "I'd like to join this game!");
    if (result.success) {
      alert('Application submitted successfully!');
    } else {
      alert(result.message);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Helper function to get host avatar
  const getHostAvatar = (hostName) => {
    const avatars = ['👩‍🦰', '🧑‍🦱', '👩‍🎓', '👨‍💼', '👩‍💻', '🧑‍🎨'];
    const index = hostName.length % avatars.length;
    return avatars[index];
  };

  const getSkillLevelColor = (level) => {
    switch(level.toLowerCase()) {
      case 'beginner': return { bg: '#3E5D45', color: '#F5EEDC' };
      case 'intermediate': return { bg: '#F39C12', color: '#F5EEDC' };
      case 'advanced': return { bg: '#F25C5C', color: '#F5EEDC' };
      default: return { bg: '#3E5D45', color: '#F5EEDC' };
    }
  };

  return (
    <div className="games-container">
      <main className="games-main">
        <div className="games-content-wrapper">
          
          {/* Page Title + Actions */}
          <section className="games-header-section">
            <h1 className="games-title">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-title-icon">
                <path d="M8 2v4"></path>
                <path d="M16 2v4"></path>
                <rect width="18" height="18" x="3" y="4" rx="2"></rect>
                <path d="M3 10h18"></path>
              </svg>
              Games
            </h1>

            <div className="games-actions">
              <div className="games-nav-section">
                <button 
                  className={`games-nav-btn ${activeTab === 'find' ? 'active' : ''}`}
                  onClick={() => setActiveTab('find')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="10" r="7"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  Find a Game
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
            </div>
          </section>

          {/* Section Title */}
          <h2 className="games-section-title">
            {activeTab === 'find' && 'Available Games'}
            {activeTab === 'mygames' && 'My Games'}
            {activeTab === 'requests' && 'My Requests'}
          </h2>

          {/* Game Cards */}
          <section className="games-cards-section">
            {activeTab === 'find' && otherGames.map((game, index) => {
              const skillColors = getSkillLevelColor(game.skillLevel);
              const hasApplied = hasUserApplied(game.id);
              const applicationCount = getApplicationCount(game.id);
              const occupiedSpots = 4 - game.openSpots; // Assuming max 4 players
              
              return (
                <article key={game.id} className="games-card">
                  <h3 className="games-card-title">{game.location}</h3>

                  <div className="games-card-content">
                    {/* Host */}
                    <div className="games-host-row">
                      <span className="games-avatar" aria-hidden="true">{getHostAvatar(game.createdBy)}</span>
                      <span className="games-host-name">{game.createdBy}</span>
                      <button className="games-profile-btn" onClick={() => alert(`View ${game.createdBy}'s profile`)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-profile-icon">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile
                      </button>
                      <span 
                        className="games-skill-badge"
                        style={{ backgroundColor: skillColors.bg, color: skillColors.color }}
                      >
                        {game.skillLevel}
                      </span>
                    </div>

                    <div className="games-datetime">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-datetime-icon">
                        <path d="M16 14v2.2l1.6 1"></path>
                        <path d="M16 2v4"></path>
                        <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                        <path d="M3 10h5"></path>
                        <path d="M8 2v4"></path>
                        <circle cx="16" cy="16" r="6"></circle>
                      </svg>
                      {formatDate(game.date)} • {formatTime(game.time)}
                    </div>

                    <div className="games-location">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-location-icon">
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {game.location}
                    </div>

                    <div className="games-details-row">
                      <span className="games-type-badge">Pickleball</span>
                      <div className="games-players">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-players-icon">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        {occupiedSpots} / 4 players • {game.openSpots} spots left
                      </div>
                    </div>

                    {game.description && (
                      <div className="games-description">
                        <p>{game.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {hasApplied ? (
                    <button disabled className="games-applied-btn">
                      Applied
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-check-icon">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                    </button>
                  ) : game.openSpots > 0 ? (
                    <button 
                      className="games-join-btn"
                      onClick={() => handleRequestToJoin(game.id)}
                    >
                      Request to Join
                    </button>
                  ) : (
                    <button disabled className="games-applied-btn">
                      Game Full
                    </button>
                  )}
                </article>
              );
            })}

            {/* My Games Tab Content */}
            {activeTab === 'mygames' && (
              myGames.length > 0 ? (
                myGames.map((game) => {
                  const skillColors = getSkillLevelColor(game.skillLevel);
                  const applicationCount = getApplicationCount(game.id);
                  const occupiedSpots = 4 - game.openSpots;
                  
                  return (
                    <article key={game.id} className="games-card">
                      <h3 className="games-card-title">{game.location}</h3>

                      <div className="games-card-content">
                        <div className="games-host-row">
                          <span className="games-avatar" aria-hidden="true">{getHostAvatar(game.createdBy)}</span>
                          <span className="games-host-name">{game.createdBy} (You)</span>
                          <span 
                            className="games-skill-badge"
                            style={{ backgroundColor: skillColors.bg, color: skillColors.color }}
                          >
                            {game.skillLevel}
                          </span>
                        </div>

                        <div className="games-datetime">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-datetime-icon">
                            <path d="M16 14v2.2l1.6 1"></path>
                            <path d="M16 2v4"></path>
                            <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                            <path d="M3 10h5"></path>
                            <path d="M8 2v4"></path>
                            <circle cx="16" cy="16" r="6"></circle>
                          </svg>
                          {formatDate(game.date)} • {formatTime(game.time)}
                        </div>

                        <div className="games-location">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-location-icon">
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {game.location}
                        </div>

                        <div className="games-details-row">
                          <span className="games-type-badge">Pickleball</span>
                          <div className="games-players">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-players-icon">
                              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                              <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                              <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            {occupiedSpots} / 4 players • {applicationCount} applications
                          </div>
                        </div>

                        {game.description && (
                          <div className="games-description">
                            <p>{game.description}</p>
                          </div>
                        )}
                      </div>

                      <button 
                        className="games-join-btn"
                        onClick={() => alert('Manage game applications (feature coming soon)')}
                      >
                        Manage Applications ({applicationCount})
                      </button>
                    </article>
                  );
                })
              ) : (
                <div className="games-empty-state">
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏓</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No games posted yet</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>Click "Post a Game" to create your first game!</p>
                </div>
              )
            )}

            {/* My Requests Tab Content */}
            {activeTab === 'requests' && (
              myApplications.length > 0 ? (
                myApplications.map((application) => {
                  const game = games.find(g => g.id === application.gameId);
                  if (!game) return null;
                  
                  const skillColors = getSkillLevelColor(game.skillLevel);
                  const statusColor = application.status === 'accepted' ? '#22c55e' : 
                                    application.status === 'rejected' ? '#ef4444' : '#f59e0b';
                  
                  return (
                    <article key={application.id} className="games-card">
                      <h3 className="games-card-title">{game.location}</h3>

                      <div className="games-card-content">
                        <div className="games-host-row">
                          <span className="games-avatar" aria-hidden="true">{getHostAvatar(game.createdBy)}</span>
                          <span className="games-host-name">{game.createdBy}</span>
                          <span 
                            className="games-skill-badge"
                            style={{ backgroundColor: skillColors.bg, color: skillColors.color }}
                          >
                            {game.skillLevel}
                          </span>
                        </div>

                        <div className="games-datetime">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-datetime-icon">
                            <path d="M16 14v2.2l1.6 1"></path>
                            <path d="M16 2v4"></path>
                            <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                            <path d="M3 10h5"></path>
                            <path d="M8 2v4"></path>
                            <circle cx="16" cy="16" r="6"></circle>
                          </svg>
                          {formatDate(game.date)} • {formatTime(game.time)}
                        </div>

                        <div className="games-location">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-location-icon">
                            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {game.location}
                        </div>

                        <div className="games-details-row">
                          <span 
                            className="games-type-badge"
                            style={{ backgroundColor: statusColor, color: 'white' }}
                          >
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          <div className="games-players">
                            <span>Applied: {formatDate(application.applicationDate)}</span>
                          </div>
                        </div>

                        {application.message && (
                          <div className="games-description">
                            <p><strong>Your message:</strong> {application.message}</p>
                          </div>
                        )}
                      </div>

                      {application.status === 'pending' && (
                        <button 
                          className="games-applied-btn"
                          onClick={() => {
                            if (confirm('Are you sure you want to withdraw your application?')) {
                              // withdrawApplication(application.id); // Uncomment when function is available
                              alert('Application withdrawn');
                            }
                          }}
                        >
                          Withdraw Application
                        </button>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="games-empty-state">
                  <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No requests yet</h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>Apply to games to see your requests here!</p>
                </div>
              )
            )}
          </section>
        </div>
      </main>

      {/* Post Game Modal */}
      {showPostForm && (
        <div className="games-modal-overlay">
          <div className="games-modal">
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
                <label>Location</label>
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
                  <label>Date</label>
                  <input
                    type="date"
                    value={newGame.date}
                    onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="games-form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    value={newGame.time}
                    onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Skill Level</label>
                  <select
                    value={newGame.skillLevel}
                    onChange={(e) => setNewGame({...newGame, skillLevel: e.target.value})}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="mixed">Mixed (All Levels)</option>
                  </select>
                </div>
                
                <div className="games-form-group">
                  <label>Open Spots</label>
                  <select
                    value={newGame.openSpots}
                    onChange={(e) => setNewGame({...newGame, openSpots: parseInt(e.target.value)})}
                  >
                    <option value={1}>1 Player</option>
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                  </select>
                </div>
              </div>
              
              <div className="games-form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={newGame.description}
                  onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                  placeholder="Add any additional details about the game..."
                  rows={3}
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
    </div>
  );
};

export default Games;
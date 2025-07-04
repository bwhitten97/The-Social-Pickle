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

  // Mock additional game data for display
  const mockGames = [
    {
      id: 1,
      title: "Advanced Doubles",
      host: { name: "Sarah Chen", avatar: "👩‍🦰", gamesHosted: 23 },
      skillLevel: "Advanced",
      date: "Dec 17, 2024",
      time: "7:00 AM",
      location: "Tennis Club",
      type: "Doubles",
      currentPlayers: 3,
      maxPlayers: 4,
      applied: true
    },
    {
      id: 2,
      title: "Beginner Friendly",
      host: { name: "Mike Rodriguez", avatar: "🧑‍🦱", gamesHosted: 8 },
      skillLevel: "Beginner", 
      date: "Dec 17, 2024",
      time: "2:00 PM",
      location: "Community Center",
      type: "Singles",
      currentPlayers: 1,
      maxPlayers: 4,
      applied: false
    },
    {
      id: 3,
      title: "Intermediate Mixed Doubles",
      host: { name: "Jessica Martinez", avatar: "👩‍🎓", gamesHosted: 15 },
      skillLevel: "Intermediate",
      date: "Dec 18, 2024", 
      time: "6:00 PM",
      location: "Recreation Center",
      type: "Doubles",
      currentPlayers: 2,
      maxPlayers: 4,
      applied: false
    }
  ];

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
              <button 
                className="games-find-btn"
                onClick={() => setShowPostForm(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-btn-icon">
                  <path d="m21 21-4.34-4.34"></path>
                  <circle cx="11" cy="11" r="8"></circle>
                </svg>
                Post a Game
              </button>

              <div className="games-nav-links">
                <a href="#" className="games-nav-link">My Games ({myGames.length})</a>
                <a href="#" className="games-nav-link">My Requests ({applications.length})</a>
              </div>
            </div>
          </section>

          {/* Available Games Heading */}
          <h2 className="games-section-title">Available Games</h2>

          {/* Game Cards */}
          <section className="games-cards-section">
            {mockGames.map((game, index) => {
              const skillColors = getSkillLevelColor(game.skillLevel);
              
              return (
                <article key={game.id} className="games-card">
                  <h3 className="games-card-title">{game.title}</h3>

                  <div className="games-card-content">
                    {/* Host */}
                    <div className="games-host-row">
                      <span className="games-avatar" aria-hidden="true">{game.host.avatar}</span>
                      <span className="games-host-name">{game.host.name}</span>
                      <span 
                        className="games-skill-badge"
                        style={{ backgroundColor: skillColors.bg, color: skillColors.color }}
                      >
                        {game.skillLevel}
                      </span>
                      <button className="games-profile-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-profile-icon">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile
                      </button>
                    </div>

                    <div className="games-host-stats">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-stats-icon">
                        <line x1="6" x2="10" y1="11" y2="11"></line>
                        <line x1="8" x2="8" y1="9" y2="13"></line>
                        <line x1="15" x2="15.01" y1="12" y2="12"></line>
                        <line x1="18" x2="18.01" y1="10" y2="10"></line>
                        <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
                      </svg>
                      {game.host.gamesHosted} games hosted
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
                      {game.date} • {game.time}
                    </div>

                    <div className="games-location">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-location-icon">
                        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {game.location}
                    </div>

                    <div className="games-details-row">
                      <span className="games-type-badge">{game.type}</span>
                      <div className="games-players">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-players-icon">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                          <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                        </svg>
                        {game.currentPlayers} / {game.maxPlayers} players
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {game.applied ? (
                    <button disabled className="games-applied-btn">
                      Applied
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-check-icon">
                        <path d="M20 6 9 17l-5-5"></path>
                      </svg>
                    </button>
                  ) : (
                    <button 
                      className="games-join-btn"
                      onClick={() => handleRequestToJoin(game.id)}
                    >
                      Request to Join
                    </button>
                  )}
                </article>
              );
            })}
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
                <label>Game Title</label>
                <input
                  type="text"
                  value={newGame.title}
                  onChange={(e) => setNewGame({...newGame, title: e.target.value})}
                  placeholder="e.g., Casual Pickleball at Central Park"
                  required
                />
              </div>
              
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
                
                <div className="games-form-group">
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
import React, { useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import Notification from '../components/Notification';
import { testFirebaseConnection } from '../services/gameService';
import './Games.css';

const Games = memo(({ addAppNotification }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('find');
  
  // Get data from GameContext
  const { 
    games, 
    applications,
    hostApplications,
    currentUserName,
    currentUserId,
    isInitialized,
    hasUserApplied,
    getUserApplications,
    getGameApplications,
    addGame,
    requestToJoinGame,
    updateGame,
    removeGame,
    updateApplicationStatus,
    withdrawApplication
  } = useGameContext();
  
  // Component state
  const [showPostForm, setShowPostForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
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
    description: '',
    price: ''
  });
  const [filters, setFilters] = useState({
    location: '',
    date: '',
    time: '',
    skillLevel: 'all',
    gameType: 'all',
    playersNeeded: 'all',
    duprMin: '',
    duprMax: ''
  });
  
  // Use context games if initialized, otherwise show loading
  const displayGames = isInitialized ? games : [];
  
  // Helper function to format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const options = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // fallback to original
    }
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'pm' : 'am';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes}${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString; // fallback to original
    }
  };

  // Helper function to capitalize badge text
  const capitalizeBadge = (text) => {
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };
  
  // Helper function to check if a game is in the past
  const isGameInPast = (game) => {
    try {
      const gameDateTime = new Date(`${game.date}T${game.time}`);
      const now = new Date();
      const isPast = gameDateTime < now;
      
      console.log('Games: isGameInPast check', {
        gameLocation: game.location,
        gameDate: game.date,
        gameTime: game.time,
        gameDateTime: gameDateTime.toISOString(),
        now: now.toISOString(),
        isPast
      });
      
      return isPast;
    } catch (error) {
      console.error('Games: Error checking if game is past', { game, error });
      return false; // If error, don't filter out the game
    }
  };

  // Helper function to check if a game is expired by more than 1 hour
  const isGameExpired = (game) => {
    try {
      const gameDateTime = new Date(`${game.date}T${game.time}`);
      const now = new Date();
      const oneHourAfterGame = new Date(gameDateTime.getTime() + (60 * 60 * 1000)); // Add 1 hour
      return now > oneHourAfterGame;
    } catch (error) {
      console.error('Games: Error checking if game is expired', { game, error });
      return false; // If error, don't filter out the game
    }
  };

  // Filter games for "Find" tab (exclude user's own games, applied games, past games, and apply filters)
  const findGames = displayGames.filter(game => {
    // Basic filters
    if (game.createdBy === currentUserName) return false;
    if (hasUserApplied(game.id)) return false;
    if (isGameInPast(game)) {
      console.log('Games: Filtering out past game', { 
        location: game.location, 
        date: game.date, 
        time: game.time 
      });
      return false;
    }
    
    // Apply additional filters
    if (filters.date && game.date !== filters.date) {
      return false;
    }
    
    if (filters.skillLevel !== 'all' && game.skillLevel !== filters.skillLevel) {
      return false;
    }
    
    if (filters.gameType !== 'all' && game.gameType !== filters.gameType) {
      return false;
    }
    
    if (filters.time && filters.time !== '') {
      const gameTime = game.time;
      if (gameTime) {
        const hour = parseInt(gameTime.split(':')[0]);
        
        if (filters.time === 'morning' && (hour < 6 || hour >= 11)) {
          return false;
        } else if (filters.time === 'afternoon' && (hour < 11 || hour >= 16)) {
          return false;
        } else if (filters.time === 'evening' && (hour < 16 || hour >= 24)) {
          return false;
        }
      }
    }
    
    if (filters.playersNeeded !== 'all') {
      const needed = parseInt(filters.playersNeeded);
      const gameOpenSpots = game.openSpots || 0;
      
      if (needed === 4) {
        // 4+ players needed
        if (gameOpenSpots < 4) return false;
      } else {
        // Exact number of players needed
        if (gameOpenSpots !== needed) return false;
      }
    }
    
    return true;
  });
  
  // Get user's own games (exclude games expired by more than 1 hour)
  const myGames = displayGames.filter(game => 
    game.createdBy === currentUserName && 
    !isGameExpired(game)
  );
  
  // Get user's applications (exclude applications for games expired by more than 1 hour)
  const myApplications = getUserApplications ? 
    getUserApplications().filter(application => {
      const game = games.find(g => g.id === application.gameId);
      return game && !isGameExpired(game);
    }) : [];
  

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
          description: '',
          price: ''
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
    console.log('Games: handleRequestToJoin called', { gameId: game.id, game });
    setSelectedGame(game);
    setShowRequestModal(true);
  };

  const submitJoinRequest = async () => {
    console.log('Games: submitJoinRequest called', { 
      selectedGame,
      requestData,
      currentUserId,
      currentUserName,
      isInitialized,
      applicationsCount: applications.length,
      hasUserAppliedFunction: typeof hasUserApplied,
      requestToJoinGameFunction: typeof requestToJoinGame
    });
    
    if (!selectedGame) {
      console.log('Games: No selected game');
      setNotification({
        message: 'No game selected',
        name: 'Error',
        emoji: '❌'
      });
      return;
    }
    
    if (!isInitialized) {
      console.log('Games: Context not initialized');
      setNotification({
        message: 'Please wait for the game data to load',
        name: 'Error',
        emoji: '❌'
      });
      return;
    }
    
    try {
      const message = requestData.message || `I'd like to join this game with ${requestData.playerCount} player${requestData.playerCount > 1 ? 's' : ''}!`;
      console.log('Games: About to call requestToJoinGame', { 
        gameId: selectedGame.id, 
        message, 
        playerCount: requestData.playerCount,
        requestToJoinGame: typeof requestToJoinGame
      });
      
      // Add a check to see if requestToJoinGame exists
      if (!requestToJoinGame || typeof requestToJoinGame !== 'function') {
        console.error('Games: requestToJoinGame is not a function', requestToJoinGame);
        setNotification({
          message: 'Application service not available',
          name: 'Error',
          emoji: '❌'
        });
        return;
      }
      
      const result = await requestToJoinGame(selectedGame.id, message, requestData.playerCount);
      console.log('Games: requestToJoinGame result', result);
      
      if (result && result.success) {
        console.log('Games: Application submitted successfully, checking applications state...', {
          applicationsCount: applications.length,
          myApplicationsCount: getUserApplications ? getUserApplications().length : 'getUserApplications not available'
        });
        
        setNotification({
          message: 'Application submitted successfully!',
          name: selectedGame.createdBy || 'Game Host',
          emoji: '✅'
        });
        setShowRequestModal(false);
        setRequestData({ playerCount: 1, message: '' });
        setSelectedGame(null);
        
        // Switch to My Requests tab to show the new application
        setActiveTab('requests');
        
        // Debug: Check applications again after a short delay
        setTimeout(() => {
          console.log('Games: Applications check after 2 seconds:', {
            applicationsCount: applications.length,
            myApplicationsCount: getUserApplications ? getUserApplications().length : 'getUserApplications not available',
            applications: applications
          });
        }, 2000);
      } else {
        const errorMessage = result?.message || 'Failed to submit application';
        console.error('Games: Application failed', { result, errorMessage });
        setNotification({
          message: errorMessage,
          name: 'Error',
          emoji: '❌'
        });
      }
    } catch (error) {
      console.error('Games: Error submitting join request', { 
        error, 
        errorMessage: error.message,
        errorStack: error.stack 
      });
      setNotification({
        message: error.message || 'Failed to submit application',
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

  // Test Firebase connection on component mount (temporary debug)
  useEffect(() => {
    const runTest = async () => {
      console.log('Running Firebase connection test...');
      const result = await testFirebaseConnection();
      console.log('Firebase connection test result:', result);
    };
    runTest();
  }, []);

  return (
    <div className="games-container">
      <main className="games-main">
        <div className="games-content-wrapper">
          {/* Temporary Debug Panel */}
          <div style={{ 
            background: '#f0f0f0', 
            padding: '10px', 
            margin: '10px 0', 
            border: '1px solid #ccc',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <strong>Debug Info:</strong><br/>
            User ID: {currentUserId}<br/>
            User Name: {currentUserName}<br/>
            Is Initialized: {isInitialized ? 'Yes' : 'No'}<br/>
            Games Count: {games.length}<br/>
            Applications Count: {applications.length}<br/>
          </div>
          
          <section className="games-header-section">
            <h1 className="games-title">
              <svg className="games-title-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Games
            </h1>
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
                
                {/* Action Buttons - moved inline with nav tabs */}
                {activeTab === 'find' && (
                  <>
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
                    <button 
                      className="games-filter-toggle"
                      onClick={() => setShowFilter(!showFilter)}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                      </svg>
                      Filters
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>


          {/* Filter Panel */}
          {showFilter && activeTab === 'find' && (
            <div className="games-filter-panel">
              <div className="games-filter-header">
                <h3 className="games-filter-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46"></polygon>
                  </svg>
                  Filter Games
                </h3>
                <button 
                  className="games-filter-clear"
                  onClick={() => setFilters({
                    location: '',
                    date: '',
                    time: '',
                    skillLevel: 'all',
                    gameType: 'all',
                    playersNeeded: 'all',
                    duprMin: '',
                    duprMax: ''
                  })}
                >
                  Clear
                </button>
              </div>
              
              <div className="games-filter-grid">
                <div className="games-filter-group">
                  <label className="games-filter-label">Date</label>
                  <input 
                    type="date"
                    className="games-filter-input"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                  />
                </div>
                
                <div className="games-filter-group">
                  <label className="games-filter-label">Time</label>
                  <select 
                    className="games-filter-select"
                    value={filters.time}
                    onChange={(e) => setFilters({...filters, time: e.target.value})}
                  >
                    <option value="">Any Time</option>
                    <option value="morning">Morning (6am - 11am)</option>
                    <option value="afternoon">Afternoon (11am - 4pm)</option>
                    <option value="evening">Evening (4pm - 12am)</option>
                  </select>
                </div>
                
                <div className="games-filter-group">
                  <label className="games-filter-label">Skill Level</label>
                  <select 
                    className="games-filter-select"
                    value={filters.skillLevel}
                    onChange={(e) => setFilters({...filters, skillLevel: e.target.value})}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                
                <div className="games-filter-group">
                  <label className="games-filter-label">Game Type</label>
                  <select 
                    className="games-filter-select"
                    value={filters.gameType}
                    onChange={(e) => setFilters({...filters, gameType: e.target.value})}
                  >
                    <option value="all">All Types</option>
                    <option value="singles">Singles</option>
                    <option value="doubles">Doubles</option>
                  </select>
                </div>
                
                <div className="games-filter-group">
                  <label className="games-filter-label">Players Needed</label>
                  <select 
                    className="games-filter-select"
                    value={filters.playersNeeded}
                    onChange={(e) => setFilters({...filters, playersNeeded: e.target.value})}
                  >
                    <option value="all">Any</option>
                    <option value="1">1 Player</option>
                    <option value="2">2 Players</option>
                    <option value="3">3 Players</option>
                    <option value="4">4+ Players</option>
                  </select>
                </div>
              </div>
              
              <div className="games-filter-actions-bottom">
                <button 
                  className="games-clear-filters-btn"
                  onClick={() => setShowFilter(false)}
                >
                  Cancel
                </button>
                <button 
                  className="games-apply-filters-btn"
                  onClick={() => setShowFilter(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Debug Panel - Remove this in production */}
          <div style={{
            background: '#f0f0f0', 
            padding: '1rem', 
            margin: '1rem 0', 
            borderRadius: '8px',
            fontSize: '0.8rem',
            border: '1px solid #ccc'
          }}>
            <strong>🐛 DEBUG INFO:</strong><br/>
            Current User ID: {currentUserId || 'null'}<br/>
            Current User Name: {currentUserName || 'null'}<br/>
            Is Initialized: {isInitialized ? 'true' : 'false'}<br/>
            Total Games: {games.length}<br/>
            Find Games: {findGames.length}<br/>
            My Games: {myGames.length}<br/>
            My Applications: {myApplications.length}<br/>
            requestToJoinGame Type: {typeof requestToJoinGame}<br/>
            Past Games in Find: {findGames.filter(g => isGameInPast(g)).length}
          </div>

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
                <h3 className="games-card-title">
                  <svg className="games-location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {game.location}
                </h3>
                <div className="games-card-content">
                  <div className="games-datetime">
                    <svg className="games-datetime-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(game.date)} • {formatTime(game.time)}
                  </div>
                  <div className="games-players">
                    <svg className="games-players-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {game.totalSpots - game.openSpots} / {game.totalSpots} players
                  </div>
                  <div className="games-details-row">
                    <span className="games-type-badge">{capitalizeBadge(game.gameType)}</span>
                    <span className="games-type-badge">{capitalizeBadge(game.skillLevel)}</span>
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
                    <h3 className="games-card-title">
                      <svg className="games-location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                      {game.location}
                    </h3>
                    <div className="games-card-content">
                      <div className="games-datetime">
                        <svg className="games-datetime-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(game.date)} • {formatTime(game.time)}
                      </div>
                      <div className="games-players">
                        <svg className="games-players-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                        {game.totalSpots - game.openSpots} / {game.totalSpots} players
                      </div>
                      <div className="games-details-row">
                        <span className="games-type-badge">{capitalizeBadge(game.gameType)}</span>
                        <span className="games-type-badge">{capitalizeBadge(game.skillLevel)}</span>
                      </div>
                    </div>
                    <button 
                      className="games-join-btn"
                      onClick={() => {
                        console.log('Games: Manage Game clicked', { gameId: game.id, game });
                        setSelectedGame(game);
                        setShowManageModal(true);
                      }}
                    >
                      Manage Game
                    </button>
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
                      <h3 className="games-card-title">
                        <svg className="games-location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {game.location}
                      </h3>
                      <div className="games-card-content">
                        <div className="games-datetime">
                          <svg className="games-datetime-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatDate(game.date)} • {formatTime(game.time)}
                        </div>
                        <div className="games-players">
                          <svg className="games-players-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                          </svg>
                          {game.totalSpots - game.openSpots} / {game.totalSpots} players
                        </div>
                        <div className="games-details-row">
                          <span className="games-type-badge">{capitalizeBadge(game.gameType)}</span>
                          <span className="games-type-badge">{capitalizeBadge(game.skillLevel)}</span>
                        </div>
                      </div>
                      <div className="games-button-group">
                        <button 
                          className={`games-status-btn ${application.status}`}
                          disabled={application.status !== 'pending'}
                        >
                          {application.status === 'pending' && (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                              Pending
                            </>
                          )}
                          {application.status === 'accepted' && (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="20,6 9,17 4,12"/>
                              </svg>
                              Accepted
                            </>
                          )}
                          {application.status === 'rejected' && (
                            <>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                              </svg>
                              Rejected
                            </>
                          )}
                        </button>
                        
                        {application.status === 'pending' && (
                          <button 
                            className="games-withdraw-btn"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to withdraw this application?')) {
                                try {
                                  console.log('Games: Withdrawing application', { 
                                    applicationId: application.id,
                                    gameId: application.gameId 
                                  });
                                  
                                  const result = await withdrawApplication(application.id);
                                  
                                  if (result.success) {
                                    setNotification({
                                      message: 'Application withdrawn successfully!',
                                      name: '',
                                      emoji: '✅'
                                    });
                                  } else {
                                    setNotification({
                                      message: result.message || 'Failed to withdraw application',
                                      name: 'Error',
                                      emoji: '❌'
                                    });
                                  }
                                } catch (error) {
                                  console.error('Games: Error withdrawing application', error);
                                  setNotification({
                                    message: 'Failed to withdraw application',
                                    name: 'Error',
                                    emoji: '❌'
                                  });
                                }
                              }
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <line x1="15" y1="9" x2="9" y2="15"/>
                              <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            Withdraw Request
                          </button>
                        )}
                        
                        {application.status === 'accepted' && (
                          <button 
                            className="games-message-btn"
                            onClick={() => {
                              // TODO: Implement messaging functionality
                              console.log('Message host clicked', { 
                                gameId: application.gameId, 
                                hostName: game.createdBy 
                              });
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/>
                            </svg>
                            Message Host
                          </button>
                        )}
                      </div>
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
                <label>Price (Optional)</label>
                <input
                  type="text"
                  value={newGame.price}
                  onChange={(e) => setNewGame({...newGame, price: e.target.value})}
                  placeholder="e.g., Free, $5, $10 per person"
                  className="games-form-input"
                />
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
                  <div className="games-datetime">{formatDate(selectedGame.date)} • {formatTime(selectedGame.time)}</div>
                  <div className="games-request-badges">
                    <span className="games-type-badge">{capitalizeBadge(selectedGame.gameType || 'Doubles')}</span>
                    <span className="games-type-badge">{capitalizeBadge(selectedGame.skillLevel)}</span>
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

      {/* Manage Game Modal */}
      {showManageModal && selectedGame && (
        <div className="games-modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Manage Game</h2>
              <button 
                className="games-close-btn" 
                onClick={() => setShowManageModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="games-modal-content">
              {/* Game Details Section */}
              <div className="manage-game-section">
                <div className="game-info">
                  <h4>{selectedGame.location}</h4>
                  <p>{formatDate(selectedGame.date)} • {formatTime(selectedGame.time)}</p>
                  <p>{selectedGame.totalSpots - selectedGame.openSpots} / {selectedGame.totalSpots} players</p>
                  <div className="game-badges">
                    <span className="games-type-badge">{capitalizeBadge(selectedGame.gameType)}</span>
                    <span className="games-type-badge">{capitalizeBadge(selectedGame.skillLevel)}</span>
                    {selectedGame.price && <span className="games-type-badge">${selectedGame.price}</span>}
                  </div>
                  {selectedGame.description && (
                    <p className="game-description">{selectedGame.description}</p>
                  )}
                </div>
                
                <div className="manage-actions">
                  <button 
                    className="manage-btn edit-btn"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      console.log('Edit game clicked');
                    }}
                  >
                    Edit Details
                  </button>
                  <button 
                    className="manage-btn remove-btn"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to remove this game? This action cannot be undone.')) {
                        try {
                          const result = await removeGame(selectedGame.id);
                          if (result.success) {
                            setNotification({
                              message: 'Game removed successfully!',
                              name: '',
                              emoji: '✅'
                            });
                            setShowManageModal(false);
                          } else {
                            alert(result.message || 'Failed to remove game');
                          }
                        } catch (error) {
                          console.error('Error removing game:', error);
                          alert('Failed to remove game');
                        }
                      }
                    }}
                  >
                    Remove Listing
                  </button>
                </div>
              </div>

              {/* Applicants Section */}
              <div className="manage-game-section">
                <h3>Applicants ({getGameApplications(selectedGame.id)?.length || 0})</h3>
                <div className="applicants-list">
                  {getGameApplications(selectedGame.id)?.length > 0 ? (
                    getGameApplications(selectedGame.id).map((application) => (
                      <div key={application.id} className="applicant-item">
                        <div className="applicant-info">
                          <div className="applicant-avatar">
                            {application.applicantName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="applicant-details">
                            <span className="applicant-name">{application.applicantName}</span>
                            {application.message && (
                              <span className="applicant-message">"{application.message}"</span>
                            )}
                            <span className="applicant-meta">
                              {application.playerCount} player{application.playerCount > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="applicant-status">
                            <span className={`status-badge ${application.status}`}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                        
                        {application.status === 'pending' && (
                          <div className="applicant-actions">
                            <button 
                              className="action-btn reject-btn"
                              onClick={async () => {
                                try {
                                  await updateApplicationStatus(application.id, 'rejected');
                                  setNotification({
                                    message: 'Application rejected',
                                    name: '',
                                    emoji: '❌'
                                  });
                                } catch (error) {
                                  console.error('Error rejecting application:', error);
                                  alert('Failed to reject application');
                                }
                              }}
                            >
                              Reject
                            </button>
                            <button 
                              className="action-btn accept-btn"
                              onClick={async () => {
                                try {
                                  await updateApplicationStatus(application.id, 'accepted');
                                  setNotification({
                                    message: 'Application accepted!',
                                    name: '',
                                    emoji: '✅'
                                  });
                                } catch (error) {
                                  console.error('Error accepting application:', error);
                                  alert('Failed to accept application');
                                }
                              }}
                            >
                              Accept
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="no-applicants">
                      <p>No applications yet</p>
                    </div>
                  )}
                </div>
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
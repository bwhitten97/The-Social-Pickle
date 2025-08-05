import React, { useState, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameContext } from '../context/GameContext';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import Notification from '../components/Notification';
import { testFirebaseConnection } from '../services/gameService';
import { createApplicationNotification } from '../services/notificationService';
import { userService } from '../services/userService';
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
    withdrawApplication,
    sendMessage
  } = useGameContext();
  
  // Component state
  const [showPostForm, setShowPostForm] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [editingGame, setEditingGame] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showHostProfileModal, setShowHostProfileModal] = useState(false);
  const [hostProfile, setHostProfile] = useState(null);
  const [loadingHostProfile, setLoadingHostProfile] = useState(false);
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
      // Parse the date string as local date to avoid timezone issues
      const [year, month, day] = dateString.split('-');
      const date = new Date(year, month - 1, day);
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

  // Handler for viewing host profile
  const handleViewHostProfile = async (game) => {
    if (!game.createdBy) {
      setNotification({
        message: 'Host information not available',
        name: '',
        emoji: '❌'
      });
      return;
    }

    setLoadingHostProfile(true);
    setShowHostProfileModal(true);

    try {
      // Search for user by name since we don't have hostId
      const searchResult = await userService.searchUsersByName(game.createdBy, 1);
      
      if (searchResult.success && searchResult.users.length > 0) {
        const hostUser = searchResult.users[0];
        
        // Get full profile data
        const profileResult = await userService.getChatUserProfile(hostUser.id);
        
        if (profileResult.success && profileResult.user) {
          setHostProfile(profileResult.user);
        } else {
          // Fallback to basic host info from the game
          setHostProfile({
            id: null,
            name: game.createdBy,
            avatar: userService.generateUserInitials(game.createdBy),
            skillLevel: null,
            duprRating: null,
            availability: [],
            bio: 'Profile information not available'
          });
        }
      } else {
        // Fallback to basic host info from the game
        setHostProfile({
          id: null,
          name: game.createdBy,
          avatar: userService.generateUserInitials(game.createdBy),
          skillLevel: null,
          duprRating: null,
          availability: [],
          bio: 'Profile information not available'
        });
      }
    } catch (error) {
      console.error('Error fetching host profile:', error);
      
      // Fallback to basic host info
      setHostProfile({
        id: null,
        name: game.createdBy,
        avatar: userService.generateUserInitials(game.createdBy),
        skillLevel: null,
        duprRating: null,
        availability: [],
        bio: 'Unable to load profile information'
      });
    } finally {
      setLoadingHostProfile(false);
    }
  };

  
  // Helper function to check if a game is in the past
  const isGameInPast = (game) => {
    try {
      // Validate game has required date/time fields
      if (!game.date || !game.time) {
        console.warn('Games: Game missing date/time fields', { gameId: game.id, date: game.date, time: game.time });
        return false; // Don't filter games with missing data
      }
      
      const gameDateTime = new Date(`${game.date}T${game.time}`);
      
      // Validate that the date was parsed correctly
      if (isNaN(gameDateTime.getTime())) {
        console.warn('Games: Invalid game date/time', { gameId: game.id, date: game.date, time: game.time });
        return false; // Don't filter games with invalid dates
      }
      
      const now = new Date();
      // Add a 30-minute grace period after game start time
      const gameEndTime = new Date(gameDateTime.getTime() + (30 * 60 * 1000));
      const isPast = now > gameEndTime;
      
      if (isPast) {
        console.log('Games: Game is past (with 30min grace period)', {
          gameLocation: game.location,
          gameDate: game.date,
          gameTime: game.time,
          gameDateTime: gameDateTime.toISOString(),
          gameEndTime: gameEndTime.toISOString(),
          now: now.toISOString()
        });
      }
      
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
  
  // Get user's applications - SIMPLIFIED
  console.log('Games: About to get applications', {
    getUserApplicationsExists: !!getUserApplications,
    currentUserId,
    applicationsFromContext: applications,
    applicationsCount: applications.length
  });
  
  // DEBUG: Let's trace every step
  console.log('🔍 DEBUG STEP 1: Raw data from context', {
    applicationsArray: applications,
    applicationsLength: applications.length,
    currentUserId: currentUserId,
    currentUserIdType: typeof currentUserId
  });

  // DEBUG: Let's examine each application
  applications.forEach((app, index) => {
    console.log(`🔍 DEBUG STEP 2: Application ${index}:`, {
      id: app.id,
      userId: app.userId,
      playerId: app.playerId,
      gameId: app.gameId,
      status: app.status,
      userIdMatch: app.userId === currentUserId,
      playerIdMatch: app.playerId === currentUserId,
      fullApp: app
    });
  });

  const myApplications = applications.filter(app => app.userId === currentUserId || app.playerId === currentUserId);
  
  console.log('🔍 DEBUG STEP 3: Filter result', {
    myApplicationsCount: myApplications.length,
    myApplications,
    currentUserId
  });
  

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
    
    // Check if game is in the past
    if (isGameInPast(selectedGame)) {
      console.log('Games: Cannot apply to past game', { 
        gameId: selectedGame.id, 
        date: selectedGame.date, 
        time: selectedGame.time 
      });
      setNotification({
        message: 'Cannot apply to past games',
        name: 'Error',
        emoji: '⏰'
      });
      setShowRequestModal(false);
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
    
    // Check if user is properly authenticated
    if (!currentUserId) {
      console.log('Games: User not authenticated');
      setNotification({
        message: 'Please sign in to request to join games',
        name: 'Error',
        emoji: '❌'
      });
      return;
    }
    
    try {
      const message = requestData.message || '';
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
        // Notify the game host about the new application
        try {
          await createApplicationNotification(
            selectedGame.hostId, // Notify the host
            user.name || 'Someone', // Applicant's name
            {
              id: selectedGame.id,
              date: selectedGame.date,
              time: selectedGame.time,
              hostId: selectedGame.hostId
            },
            'applied' // New status for applications
          );
          console.log('✅ Host notification sent for new application');
        } catch (notifError) {
          console.error('❌ Failed to notify host of application:', notifError);
        }
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
              {/* Navigation Tabs - Top Row */}
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
              
              {/* Action Buttons - Separate Rows Below Navigation */}
              {activeTab === 'find' && (
                <div className="games-action-buttons-vertical">
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
                </div>
              )}
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
                  className="games-host-profile-btn"
                  onClick={() => handleViewHostProfile(game)}
                >
                  View Host Profile
                </button>
                <button 
                  className={`games-join-btn ${isGameInPast(game) ? 'games-join-btn-disabled' : ''}`}
                  onClick={() => {
                    if (isGameInPast(game)) {
                      setNotification({
                        message: 'Cannot join past games',
                        name: '',
                        emoji: '⏰'
                      });
                      return;
                    }
                    handleRequestToJoin(game);
                  }}
                  disabled={isGameInPast(game)}
                >
                  {isGameInPast(game) ? 'Game Passed' : 'Request to Join'}
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
              myApplications.length > 0 ? 
                myApplications.map((application) => {
                  console.log('Games: Rendering application', application);
                  
                  // Find the associated game for this application
                  const game = displayGames.find(g => g.id === application.gameId);
                  
                  if (!game) {
                    return (
                      <article key={application.id} className="games-card">
                        <h3 className="games-card-title">
                          <svg className="games-location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          Game Not Found
                        </h3>
                        <div className="games-card-content">
                          <div className="games-details-row">
                            <span className="games-type-badge">Application ID: {application.id}</span>
                            <span className={`games-status-badge ${application.status}`}>
                              {application.status}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  }
                  
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
                          {game.duprRating && game.duprRating !== 'unrated' && (
                            <span className="games-dupr-badge">DUPR {game.duprRating}</span>
                          )}
                          {game.price && (
                            <span className="games-price-badge">${game.price}</span>
                          )}
                        </div>
                        
                        {game.description && (
                          <p className="games-description">{game.description}</p>
                        )}
                      </div>
                      
                      <div className="games-button-group">
                        <span className={`games-status-badge ${application.status}`}>
                          {application.status === 'pending' && (
                            <>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                              </svg>
                              Pending
                            </>
                          )}
                          {application.status === 'accepted' && '✅ Accepted'}
                          {application.status === 'rejected' && '❌ Rejected'}
                        </span>
                        
                        {application.status === 'accepted' && (
                          <button 
                            className="games-message-host-btn"
                            onClick={() => {
                              navigate('/messages', {
                                state: {
                                  openChatWithUser: {
                                    id: game.createdById,
                                    name: game.hostName || game.createdBy
                                  }
                                }
                              });
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            Message Host
                          </button>
                        )}
                        
                        {application.status === 'pending' && (
                          <button 
                            className="games-withdraw-btn"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to withdraw this application?')) {
                                try {
                                  await withdrawApplication(application.id);
                                  setNotification({
                                    message: 'Application withdrawn',
                                    name: '',
                                    emoji: '✅'
                                  });
                                } catch (error) {
                                  console.error('Error withdrawing application:', error);
                                  setNotification({
                                    message: 'Failed to withdraw application',
                                    name: '',
                                    emoji: '❌'
                                  });
                                }
                              }
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M16 12L8 12M12 8L8 12L12 16"/>
                            </svg>
                            Withdraw
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
               : 
                <div className="games-empty-state">
                  <h3>No requests yet</h3>
                  <p>Apply to games to see your requests here!</p>
                </div>
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
                  <h4 className="game-info-title">
                    <svg className="games-location-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {selectedGame.location}
                  </h4>
                  <div className="game-info-datetime">
                    <svg className="games-datetime-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(selectedGame.date)} • {formatTime(selectedGame.time)}
                  </div>
                  <div className="game-info-players">
                    <svg className="games-players-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    {selectedGame.totalSpots - selectedGame.openSpots} / {selectedGame.totalSpots} players
                  </div>
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
                      setShowManageModal(false);
                      setShowEditForm(true);
                      setEditingGame(selectedGame);
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
                            // Notify all applicants that the game was cancelled
                            try {
                              const gameApplications = applications.filter(app => app.gameId === selectedGame.id);
                              for (const application of gameApplications) {
                                await createApplicationNotification(
                                  application.applicantId,
                                  user.name || 'Game Host',
                                  {
                                    id: selectedGame.id,
                                    date: selectedGame.date,
                                    time: selectedGame.time,
                                    hostId: selectedGame.hostId
                                  },
                                  'cancelled'
                                );
                              }
                              console.log(`✅ Sent cancellation notifications to ${gameApplications.length} applicants`);
                            } catch (notifError) {
                              console.error('❌ Failed to send cancellation notifications:', notifError);
                            }
                            
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
                            {(application.playerName || application.applicantName)?.charAt(0)?.toUpperCase()}
                          </div>
                          <div className="applicant-details">
                            <span className="applicant-name">{application.playerName || application.applicantName}</span>
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
                                  console.log('Games: Rejecting application', { applicationId: application.id, playerName: application.playerName });
                                  const result = await updateApplicationStatus(application.id, 'rejected');
                                  if (result.success) {
                                    setNotification({
                                      message: 'Application rejected',
                                      name: application.playerName || application.applicantName || '',
                                      emoji: '❌'
                                    });
                                    
                                    // Create Firebase notification for the applicant
                                    try {
                                      await createApplicationNotification(
                                        application.playerId,
                                        currentUserName,
                                        {
                                          id: selectedGame.id,
                                          date: formatDate(selectedGame.date),
                                          time: formatTime(selectedGame.time),
                                          hostId: currentUserId
                                        },
                                        'rejected'
                                      );
                                    } catch (error) {
                                      console.error('Error creating notification:', error);
                                    }
                                    
                                    // Also add to local notifications for immediate feedback
                                    if (addAppNotification) {
                                      const notificationMessage = `${currentUserName} rejected your application for their game on ${formatDate(selectedGame.date)} at ${formatTime(selectedGame.time)}`;
                                      addAppNotification(notificationMessage, 'application', application.playerId);
                                    }
                                  } else {
                                    throw new Error(result.message || 'Failed to reject application');
                                  }
                                } catch (error) {
                                  console.error('Error rejecting application:', error);
                                  setNotification({
                                    message: error.message || 'Failed to reject application',
                                    name: '',
                                    emoji: '❌'
                                  });
                                }
                              }}
                            >
                              Reject
                            </button>
                            <button 
                              className="action-btn accept-btn"
                              onClick={async () => {
                                try {
                                  console.log('Games: Accepting application', { 
                                    applicationId: application.id, 
                                    playerName: application.playerName,
                                    gameId: selectedGame.id,
                                    currentApplications: getGameApplications(selectedGame.id)
                                  });
                                  const result = await updateApplicationStatus(application.id, 'accepted');
                                  console.log('Games: Accept result', result);
                                  if (result.success) {
                                    setNotification({
                                      message: 'Application accepted!',
                                      name: application.playerName || application.applicantName || '',
                                      emoji: '✅'
                                    });
                                    
                                    // Create Firebase notification for the applicant
                                    try {
                                      console.log('🔍 GAMES: Creating Firebase notification for accept', {
                                        applicantId: application.playerId,
                                        hostName: currentUserName,
                                        gameData: {
                                          id: selectedGame.id,
                                          date: formatDate(selectedGame.date),
                                          time: formatTime(selectedGame.time),
                                          hostId: currentUserId
                                        }
                                      });
                                      
                                      const notificationResult = await createApplicationNotification(
                                        application.playerId,
                                        currentUserName,
                                        {
                                          id: selectedGame.id,
                                          date: formatDate(selectedGame.date),
                                          time: formatTime(selectedGame.time),
                                          hostId: currentUserId
                                        },
                                        'accepted'
                                      );
                                      
                                      console.log('🔍 GAMES: Firebase notification result', notificationResult);
                                    } catch (error) {
                                      console.error('🔍 GAMES: Error creating notification:', error);
                                    }
                                    
                                    // Also add to local notifications for immediate feedback
                                    if (addAppNotification) {
                                      const notificationMessage = `${currentUserName} accepted you into their game on ${formatDate(selectedGame.date)} at ${formatTime(selectedGame.time)}`;
                                      addAppNotification(notificationMessage, 'application', application.playerId);
                                    }
                                    
                                    // Force refresh of applications
                                    const updatedApps = getGameApplications(selectedGame.id);
                                    console.log('Games: Updated applications after accept', updatedApps);
                                  } else {
                                    throw new Error(result.message || 'Failed to accept application');
                                  }
                                } catch (error) {
                                  console.error('Error accepting application:', error);
                                  setNotification({
                                    message: error.message || 'Failed to accept application',
                                    name: '',
                                    emoji: '❌'
                                  });
                                }
                              }}
                            >
                              Accept
                            </button>
                          </div>
                        )}
                        
                        {application.status === 'accepted' && (
                          <div className="applicant-actions">
                            <button 
                              className="action-btn message-btn"
                              onClick={() => {
                                setShowManageModal(false);
                                // Navigate to Chat page and open chat with this user
                                navigate('/messages', {
                                  state: {
                                    openChatWithUser: {
                                      id: application.playerId,
                                      name: application.playerName || application.applicantName
                                    }
                                  }
                                });
                              }}
                            >
                              Message {application.playerName || application.applicantName}
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

      {/* Edit Game Modal */}
      {showEditForm && editingGame && (
        <div className="games-modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Edit Game</h2>
              <button 
                className="games-close-btn"
                onClick={() => setShowEditForm(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const result = await updateGame(editingGame.id, {
                  location: editingGame.location,
                  date: editingGame.date,
                  time: editingGame.time,
                  skillLevel: editingGame.skillLevel,
                  gameType: editingGame.gameType,
                  openSpots: editingGame.openSpots,
                  totalSpots: editingGame.totalSpots || 4,
                  description: editingGame.description,
                  price: editingGame.price
                });
                
                if (result.success) {
                  // Notify all applicants about the game update
                  try {
                    const gameApplications = applications.filter(app => app.gameId === editingGame.id);
                    for (const application of gameApplications) {
                      await createApplicationNotification(
                        application.applicantId,
                        user.name || 'Game Host',
                        {
                          id: editingGame.id,
                          date: editingGame.date,
                          time: editingGame.time,
                          hostId: editingGame.hostId
                        },
                        'updated'
                      );
                    }
                    console.log(`✅ Sent update notifications to ${gameApplications.length} applicants`);
                  } catch (notifError) {
                    console.error('❌ Failed to send update notifications:', notifError);
                  }
                  
                  setNotification({
                    message: 'Game updated successfully!',
                    name: '',
                    emoji: '✅'
                  });
                  setShowEditForm(false);
                  setEditingGame(null);
                } else {
                  setNotification({
                    message: result.message || 'Failed to update game',
                    name: '',
                    emoji: '❌'
                  });
                }
              } catch (error) {
                console.error('Error updating game:', error);
                setNotification({
                  message: 'Failed to update game',
                  name: '',
                  emoji: '❌'
                });
              }
            }} className="games-form">
              <div className="games-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={editingGame.location}
                  onChange={(e) => setEditingGame({...editingGame, location: e.target.value})}
                  placeholder="e.g., Central Park Courts"
                  required
                />
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Date *</label>
                  <DatePicker
                    value={editingGame.date}
                    onChange={(date) => setEditingGame({...editingGame, date})}
                    className="games-form-input"
                  />
                </div>
                
                <div className="games-form-group">
                  <label>Time *</label>
                  <TimePicker
                    value={editingGame.time}
                    onChange={(time) => setEditingGame({...editingGame, time})}
                    className="games-form-input"
                  />
                </div>
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Game Type</label>
                  <select
                    value={editingGame.gameType}
                    onChange={(e) => setEditingGame({...editingGame, gameType: e.target.value})}
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
                    value={editingGame.skillLevel}
                    onChange={(e) => setEditingGame({...editingGame, skillLevel: e.target.value})}
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
                <label>Spots Available</label>
                <select
                  value={editingGame.openSpots}
                  onChange={(e) => setEditingGame({...editingGame, openSpots: parseInt(e.target.value)})}
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
                  type="number"
                  value={editingGame.price}
                  onChange={(e) => setEditingGame({...editingGame, price: e.target.value})}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div className="games-form-group">
                <label>Description (Optional)</label>
                <textarea
                  value={editingGame.description}
                  onChange={(e) => setEditingGame({...editingGame, description: e.target.value})}
                  placeholder="Add any additional details about your game..."
                  rows={3}
                  className="games-form-textarea"
                />
              </div>
              
              <div className="games-form-actions">
                <button
                  type="submit"
                  className="games-submit-btn"
                >
                  Update Game
                </button>
                <button
                  type="button"
                  className="games-cancel-btn"
                  onClick={() => setShowEditForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Host Profile Modal */}
      {showHostProfileModal && hostProfile && (
        <div className="profile-modal-overlay" onClick={() => setShowHostProfileModal(false)}>
          <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="profile-popup-card">
              {/* Close button */}
              <button 
                className="profile-modal-close" 
                onClick={() => setShowHostProfileModal(false)}
                title="Close profile"
              >
                ✕
              </button>
              
              {/* Profile Image Section */}
              <div className="profile-popup-image-section">
                <div className="profile-popup-image-placeholder">
                  {hostProfile.profilePicture ? (
                    <img 
                      src={hostProfile.profilePicture} 
                      alt={`${hostProfile.name}'s profile`}
                      className="profile-popup-image"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="profile-popup-initials"
                    style={{ display: hostProfile.profilePicture ? 'none' : 'flex' }}
                  >
                    {hostProfile.avatar}
                  </div>
                </div>
              </div>
              
              {/* Profile Details Section */}
              <div className="profile-popup-details">
                {loadingHostProfile ? (
                  <div className="profile-loading">
                    <p>Loading profile...</p>
                  </div>
                ) : (
                  <>
                    <div className="profile-popup-header">
                      <h2 className="profile-popup-name">{hostProfile.name}</h2>
                      {hostProfile.age && <span className="profile-popup-age">Age {hostProfile.age}</span>}
                      {hostProfile.gender && <span className="profile-popup-gender">{capitalizeBadge(hostProfile.gender)}</span>}
                    </div>
                    
                    {(hostProfile.skillLevel || hostProfile.duprRating) && (
                      <div className="profile-popup-badges">
                        {hostProfile.skillLevel && <span className="profile-popup-skill-badge">{capitalizeBadge(hostProfile.skillLevel)}</span>}
                        {hostProfile.duprRating && hostProfile.duprRating !== 'unrated' && (
                          <span className="profile-popup-dupr-badge">DUPR {hostProfile.duprRating}</span>
                        )}
                      </div>
                    )}
                    
                    {hostProfile.availability && hostProfile.availability.length > 0 && (
                      <div className="profile-popup-availability">
                        {hostProfile.availability.map((time, index) => (
                          <span key={index} className="profile-popup-availability-tag">{capitalizeBadge(time)}</span>
                        ))}
                      </div>
                    )}
                    
                    {hostProfile.bio && hostProfile.bio.trim() && (
                      <div className="profile-popup-bio">
                        <p>{hostProfile.bio}</p>
                      </div>
                    )}
                  </>
                )}
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
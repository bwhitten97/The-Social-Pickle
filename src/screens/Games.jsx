import { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import DatePicker from '../components/DatePicker';
import TimePicker from '../components/TimePicker';
import Notification from '../components/Notification';
import './Games.css';

const Games = ({ addAppNotification }) => {
  const { 
    games, 
    applications, 
    currentUserId, 
    currentUserName, 
    addGame, 
    updateGame,
    removeGame,
    requestToJoinGame,
    withdrawApplication: withdrawApplicationContext,
    getUserApplications,
    getGameApplications,
    hasUserApplied,
    updateApplicationStatus,
    sendMessage,
    cleanupExpiredGames
  } = useGameContext();
  
  const [showPostForm, setShowPostForm] = useState(false);
  const [activeTab, setActiveTab] = useState('find'); // 'find', 'mygames', 'requests'
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawData, setWithdrawData] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({ recipientName: '', message: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editGameData, setEditGameData] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [gameToRemove, setGameToRemove] = useState(null);
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

  // Filter state
  const [filters, setFilters] = useState({
    date: '',
    timeSlot: 'all', // all, morning, afternoon, evening
    skillLevel: 'all', // all, beginner, intermediate, advanced
    duprRange: { min: 2.0, max: 6.0 },
    playersNeeded: 'all' // all, 1, 2, 3, 4+
  });

  const [showFilters, setShowFilters] = useState(false);

  const myGames = games.filter(game => game.createdBy === currentUserName);
  const myApplications = getUserApplications();

  // Clean up expired games when component mounts
  useEffect(() => {
    cleanupExpiredGames();
  }, [cleanupExpiredGames]);

  // Helper function to check if game is happening soon
  const isGameSoon = (game) => {
    const now = new Date();
    const gameDateTime = new Date(`${game.date}T${game.time}`);
    const timeDiff = gameDateTime.getTime() - now.getTime();
    const hoursUntilGame = timeDiff / (1000 * 60 * 60);
    
    return hoursUntilGame <= 2 && hoursUntilGame > -1; // Within 2 hours of start, but not expired
  };

  // Filter logic
  const getTimeSlot = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour <= 23) return 'evening';
    return 'other';
  };

  const skillLevelToDupr = (skillLevel) => {
    switch(skillLevel.toLowerCase()) {
      case 'beginner': return { min: 2.0, max: 3.0 };
      case 'intermediate': return { min: 3.0, max: 4.0 };
      case 'advanced': return { min: 4.0, max: 6.0 };
      case 'mixed': return { min: 2.0, max: 6.0 };
      default: return { min: 2.0, max: 6.0 };
    }
  };

  const applyFilters = (games) => {
    return games.filter(game => {
      // Date filter
      if (filters.date && game.date !== filters.date) return false;
      
      // Time slot filter
      if (filters.timeSlot !== 'all' && getTimeSlot(game.time) !== filters.timeSlot) return false;
      
      // Skill level and DUPR filter
      if (filters.skillLevel !== 'all') {
        const gameDuprRange = skillLevelToDupr(game.skillLevel);
        const filterDuprRange = filters.duprRange;
        
        // Check if there's overlap between game DUPR range and filter DUPR range
        if (gameDuprRange.max < filterDuprRange.min || gameDuprRange.min > filterDuprRange.max) {
          return false;
        }
      }
      
      // Players needed filter
      if (filters.playersNeeded !== 'all') {
        const playersNeeded = parseInt(filters.playersNeeded);
        if (playersNeeded === 4 && game.openSpots < 4) return false;
        if (playersNeeded < 4 && game.openSpots !== playersNeeded) return false;
      }
      
      return true;
    });
  };

  const filteredOtherGames = applyFilters(games.filter(game => 
    game.createdBy !== currentUserName && !hasUserApplied(game.id)
  ));

  // Clear filters function
  const clearFilters = () => {
    setFilters({
      date: '',
      timeSlot: 'all',
      skillLevel: 'all',
      duprRange: { min: 2.0, max: 6.0 },
      playersNeeded: 'all'
    });
  };

  // Update DUPR range when skill level changes
  const handleSkillLevelChange = (skillLevel) => {
    setFilters(prev => ({
      ...prev,
      skillLevel,
      duprRange: skillLevel === 'all' 
        ? { min: 2.0, max: 6.0 }
        : skillLevelToDupr(skillLevel)
    }));
  };

  // Update skill level when DUPR range changes
  const handleDuprRangeChange = (duprRange) => {
    let inferredSkillLevel = 'all';
    
    if (duprRange.min >= 2.0 && duprRange.max <= 3.0) {
      inferredSkillLevel = 'beginner';
    } else if (duprRange.min >= 3.0 && duprRange.max <= 4.0) {
      inferredSkillLevel = 'intermediate';
    } else if (duprRange.min >= 4.0 && duprRange.max <= 6.0) {
      inferredSkillLevel = 'advanced';
    }
    
    setFilters(prev => ({
      ...prev,
      skillLevel: inferredSkillLevel,
      duprRange
    }));
  };

  const getApplicationCount = (gameId) => {
    return applications.filter(app => app.gameId === gameId && app.status === 'pending').length;
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
    addGame({
      ...newGame,
      totalSpots: newGame.openSpots
    });
    
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
  };

  const handleRequestToJoin = (gameId) => {
    const game = games.find(g => g.id === gameId);
    setSelectedGame(game);
    setShowRequestModal(true);
  };

  const submitJoinRequest = () => {
    if (!selectedGame) return;
    
    const message = requestData.message || `I'd like to join this game with ${requestData.playerCount} player${requestData.playerCount > 1 ? 's' : ''}!`;
    const result = requestToJoinGame(selectedGame.id, message);
    
    if (result.success) {
      // Send notification to the game host
      if (addAppNotification && selectedGame) {
        addAppNotification(
          `${currentUserName} has applied to join your game "${selectedGame.location}" on ${formatDate(selectedGame.date)}.`,
          "application",
          selectedGame.createdBy
        );
      }
      
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
  };

  const cancelJoinRequest = () => {
    setShowRequestModal(false);
    setRequestData({ playerCount: 1, message: '' });
    setSelectedGame(null);
  };

  const handleViewProfile = (hostName) => {
    // Create a mock profile object with the host's information
    // In a real app, this would fetch the user's profile data
    const mockProfile = {
      name: hostName,
      avatar: getHostAvatar(hostName),
      age: Math.floor(Math.random() * 30) + 20, // Random age between 20-50
      skillLevel: 'Intermediate',
      availability: 'Weekends',
      distance: `${(Math.random() * 10).toFixed(1)} miles away`,
      experience: `${Math.floor(Math.random() * 5) + 1} years experience`,
      bio: `Hi! I'm ${hostName}. Love playing pickleball and meeting new people on the court!`
    };
    
    setSelectedProfile(mockProfile);
  };

  const handleViewApplicantProfile = (application) => {
    // Create a profile object with the applicant's information
    const applicantProfile = {
      name: application.playerName,
      avatar: getHostAvatar(application.playerName),
      age: Math.floor(Math.random() * 30) + 20, // Random age between 20-50
      skillLevel: application.playerSkill,
      availability: 'Flexible',
      distance: `${(Math.random() * 15).toFixed(1)} miles away`,
      experience: `${Math.floor(Math.random() * 5) + 1} years experience`,
      bio: application.message || `Hi! I'm ${application.playerName}. Looking forward to playing pickleball with you!`
    };
    
    // Show the profile modal on top of the manage applications modal
    setSelectedProfile(applicantProfile);
  };

  const handleManageApplications = (game) => {
    setSelectedGame(game);
    setShowManageModal(true);
  };

  const handleEditGame = (game) => {
    setEditGameData({
      id: game.id,
      location: game.location,
      date: game.date,
      time: game.time,
      skillLevel: game.skillLevel,
      duprRating: game.duprRating || 'unrated',
      gameType: game.gameType || 'doubles',
      openSpots: game.openSpots,
      description: game.description
    });
    setShowEditModal(true);
  };

  const handleUpdateGame = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!editGameData.location || !editGameData.date || !editGameData.time) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Update the game using context
    updateGame(editGameData.id, editGameData);
    
    setShowEditModal(false);
    setEditGameData(null);
    setShowManageModal(false);
    alert('Game updated successfully!');
  };

  const handleRemoveGame = (gameId) => {
    const game = games.find(g => g.id === gameId);
    setGameToRemove(game);
    setShowRemoveConfirm(true);
  };

  const confirmRemoveGame = () => {
    if (gameToRemove) {
      // Remove the game using context
      removeGame(gameToRemove.id);
      setShowManageModal(false);
      setShowRemoveConfirm(false);
      setGameToRemove(null);
      setNotification({
        message: 'Game removed successfully!',
        name: 'Game Removed',
        emoji: '🗑️'
      });
    }
  };

  const cancelRemoveGame = () => {
    setShowRemoveConfirm(false);
    setGameToRemove(null);
  };

  const handleAcceptApplication = (applicationId) => {
    const application = applications.find(app => app.id === applicationId);
    const game = games.find(g => g.id === application.gameId);
    
    updateApplicationStatus(applicationId, 'accepted');
    
    // Send notification to the applicant
    if (addAppNotification && application && game) {
      addAppNotification(
        `Your application to join "${game.location}" on ${formatDate(game.date)} has been accepted!`,
        "application",
        application.playerName
      );
    }
    
    setNotification({
      message: "Application accepted successfully!",
      name: "Application Accepted",
      emoji: "✅"
    });
  };

  const handleRejectApplication = (applicationId) => {
    const application = applications.find(app => app.id === applicationId);
    const game = games.find(g => g.id === application.gameId);
    
    updateApplicationStatus(applicationId, 'rejected');
    
    // Send notification to the applicant
    if (addAppNotification && application && game) {
      addAppNotification(
        `Your application to join "${game.location}" on ${formatDate(game.date)} has been declined.`,
        "application",
        application.playerName
      );
    }
    
    setNotification({
      message: "Application rejected.",
      name: "Application Rejected", 
      emoji: "❌"
    });
  };

  const handleMessageApplicant = (applicantName) => {
    setMessageData({ recipientName: applicantName, message: '' });
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    const messageText = messageData.message.trim();
    if (!messageText) return;

    const result = sendMessage(messageData.recipientName, messageText);
    if (result.success) {
      setNotification({
        message: `Message sent to ${messageData.recipientName}!`,
        name: "Message Sent",
        emoji: "💬"
      });
      setShowMessageModal(false);
      setMessageData({ recipientName: '', message: '' });
    }
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setMessageData({ recipientName: '', message: '' });
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
  };

  const handleWithdrawClick = (application, game) => {
    setWithdrawData({ application, game });
    setShowWithdrawConfirm(true);
  };

  const confirmWithdraw = () => {
    if (withdrawData && withdrawData.application) {
      const result = withdrawApplicationContext(withdrawData.application.id);
      if (result.success) {
        setNotification({
          message: 'Application withdrawn successfully!',
          name: withdrawData.game?.createdBy || 'Game Host',
          emoji: '🗑️'
        });
      }
    }
    setShowWithdrawConfirm(false);
    setWithdrawData(null);
  };

  const cancelWithdraw = () => {
    setShowWithdrawConfirm(false);
    setWithdrawData(null);
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

  const capitalizeSkillLevel = (level) => {
    return level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="10" r="7"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
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

          {/* Filter Panel - Only show on Find a Game tab */}
          {activeTab === 'find' && (
            <section className="games-filter-section">
              <div className="games-filter-header">
                <button 
                  className="games-filter-toggle"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14"></line>
                    <line x1="4" y1="10" x2="4" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12" y2="3"></line>
                    <line x1="20" y1="21" x2="20" y2="16"></line>
                    <line x1="20" y1="12" x2="20" y2="3"></line>
                    <line x1="1" y1="14" x2="7" y2="14"></line>
                    <line x1="9" y1="8" x2="15" y2="8"></line>
                    <line x1="17" y1="16" x2="23" y2="16"></line>
                  </svg>
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
              </div>

              {showFilters && (
                <div className="games-filter-panel">
                  {/* Filter Header */}
                  <div className="games-filter-panel-header">
                    <h3 className="games-filter-panel-title">Filters</h3>
                    <button className="games-clear-filters-btn" onClick={clearFilters}>
                      Clear All
                    </button>
                  </div>
                  
                  <div className="games-filter-grid">
                    {/* Date Filter */}
                    <div className="games-filter-group">
                      <label className="games-filter-label">Date</label>
                      <DatePicker
                        value={filters.date}
                        onChange={(date) => setFilters(prev => ({ ...prev, date }))}
                        className="games-filter-select"
                      />
                    </div>

                    {/* Time Slot Filter */}
                    <div className="games-filter-group">
                      <label className="games-filter-label">Time of Day</label>
                      <select
                        value={filters.timeSlot}
                        onChange={(e) => setFilters(prev => ({ ...prev, timeSlot: e.target.value }))}
                        className="games-filter-select"
                      >
                        <option value="all">All Times</option>
                        <option value="morning">Morning (6 AM - 12 PM)</option>
                        <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                        <option value="evening">Evening (5 PM - 11 PM)</option>
                      </select>
                    </div>

                    {/* Players Needed Filter */}
                    <div className="games-filter-group">
                      <label className="games-filter-label">Players Needed</label>
                      <select
                        value={filters.playersNeeded}
                        onChange={(e) => setFilters(prev => ({ ...prev, playersNeeded: e.target.value }))}
                        className="games-filter-select"
                      >
                        <option value="all">Any Number</option>
                        <option value="1">1 Player</option>
                        <option value="2">2 Players</option>
                        <option value="3">3 Players</option>
                        <option value="4">4+ Players</option>
                      </select>
                    </div>

                    {/* Skill Level Filter */}
                    <div className="games-filter-group">
                      <label className="games-filter-label">Skill Level</label>
                      <select
                        value={filters.skillLevel}
                        onChange={(e) => handleSkillLevelChange(e.target.value)}
                        className="games-filter-select"
                      >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>

                    {/* DUPR Range Filter */}
                    <div className="games-filter-group games-filter-dupr">
                      <label className="games-filter-label">
                        DUPR Range: {filters.duprRange.min} - {filters.duprRange.max}
                      </label>
                      <div className="games-filter-dupr-inputs">
                        <div className="games-filter-dupr-input">
                          <label>Min</label>
                          <input
                            type="number"
                            min="2.0"
                            max="6.0"
                            step="0.1"
                            value={filters.duprRange.min}
                            onChange={(e) => handleDuprRangeChange({ 
                              ...filters.duprRange, 
                              min: parseFloat(e.target.value) 
                            })}
                            className="games-filter-number"
                          />
                        </div>
                        <div className="games-filter-dupr-input">
                          <label>Max</label>
                          <input
                            type="number"
                            min="2.0"
                            max="6.0"
                            step="0.1"
                            value={filters.duprRange.max}
                            onChange={(e) => handleDuprRangeChange({ 
                              ...filters.duprRange, 
                              max: parseFloat(e.target.value) 
                            })}
                            className="games-filter-number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Apply Filters Button */}
                  <div className="games-filter-actions-bottom">
                    <button className="games-apply-filters-btn" onClick={() => setShowFilters(false)}>
                      Apply Filters
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section Title */}
          <h2 className="games-section-title">
            {activeTab === 'find' && `Available Games (${filteredOtherGames.length})`}
            {activeTab === 'mygames' && 'My Games'}
            {activeTab === 'requests' && 'My Requests'}
          </h2>

          {/* Game Cards */}
          <section className="games-cards-section">
            {activeTab === 'find' && filteredOtherGames.map((game, index) => {
              const skillColors = getSkillLevelColor(game.skillLevel);
              const hasApplied = hasUserApplied(game.id);
              const applicationCount = getApplicationCount(game.id);
              const occupiedSpots = (game.totalSpots || 4) - game.openSpots;
              
              return (
                <article key={game.id} className="games-card">
                  <h3 className="games-card-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-card-location-icon">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {game.location}
                  </h3>

                  <div className="games-card-content">
                    {/* Time */}
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

                    {/* Players */}
                    <div className="games-players">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-players-icon">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                      </svg>
                      {occupiedSpots} / {game.totalSpots || 4} players • {game.openSpots} spots left
                    </div>

                    {/* Tags */}
                    <div className="games-details-row">
                      <span className="games-type-badge">{game.gameType || 'Doubles'}</span>
                      <span className="games-type-badge">{capitalizeSkillLevel(game.skillLevel)}</span>
                      {game.duprRating && game.duprRating !== 'unrated' && (
                        <span className="games-type-badge">DUPR {game.duprRating}+</span>
                      )}
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

                  {/* Host Profile Button - moved to bottom right */}
                  <button className="games-profile-btn-bottom" onClick={() => handleViewProfile(game.createdBy)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-profile-icon">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {game.createdBy}
                  </button>
                </article>
              );
            })}

            {/* My Games Tab Content */}
            {activeTab === 'mygames' && (
              myGames.length > 0 ? (
                myGames.map((game) => {
                  const skillColors = getSkillLevelColor(game.skillLevel);
                  const applicationCount = getApplicationCount(game.id);
                  const occupiedSpots = (game.totalSpots || 4) - game.openSpots;
                  
                  return (
                    <article key={game.id} className="games-card">
                      <h3 className="games-card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-card-location-icon">
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {game.location}
                      </h3>

                      <div className="games-card-content">
                        {/* Time */}
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

                        {/* Players */}
                        <div className="games-players">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-players-icon">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                          </svg>
                          {occupiedSpots} / 4 players • {applicationCount} applications
                        </div>

                        {/* Tags */}
                        <div className="games-details-row">
                          <span className="games-type-badge">{game.gameType || 'Doubles'}</span>
                          <span className="games-type-badge">{capitalizeSkillLevel(game.skillLevel)}</span>
                          {game.duprRating && game.duprRating !== 'unrated' && (
                            <span className="games-type-badge">DUPR {game.duprRating}+</span>
                          )}
                        </div>

                        {game.description && (
                          <div className="games-description">
                            <p>{game.description}</p>
                          </div>
                        )}
                      </div>

                      <button 
                        className="games-join-btn"
                        onClick={() => handleManageApplications(game)}
                      >
                        Manage Game and Applicants ({applicationCount})
                      </button>
                    </article>
                  );
                })
              ) : (
                <div className="games-empty-state">
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
                  const statusColor = application.status === 'accepted' ? '#3E5D45' : 
                                    application.status === 'rejected' ? '#F25C5C' : '#F39C12';
                  const occupiedSpots = (game.totalSpots || 4) - game.openSpots;
                  
                  return (
                    <article key={application.id} className="games-card">
                      <h3 className="games-card-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-card-location-icon">
                          <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {game.location}
                      </h3>

                      <div className="games-card-content">
                        {/* Date/Time - moved to line 2 */}
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

                        {/* Players */}
                        <div className="games-players">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-players-icon">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                            <path d="M16 3.128a4 4 0 0 1 0 7.744"></path>
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                          </svg>
                          {occupiedSpots} / {game.totalSpots || 4} players • {game.openSpots} spots left
                        </div>

                        {/* Tags */}
                        <div className="games-details-row">
                          <span className="games-type-badge">{game.gameType || 'Doubles'}</span>
                          <span className="games-type-badge">{capitalizeSkillLevel(game.skillLevel)}</span>
                          {game.duprRating && game.duprRating !== 'unrated' && (
                            <span className="games-type-badge">DUPR {game.duprRating}+</span>
                          )}
                        </div>

                        <div className="games-players">
                          <span>Applied: {formatDate(application.applicationDate)}</span>
                        </div>

                        {application.message && (
                          <div className="games-description">
                            <p><strong>Your message:</strong> {application.message}</p>
                          </div>
                        )}
                      </div>

                      {/* Status Badge - moved to top right */}
                      <span 
                        className="games-applied-btn"
                        style={{ backgroundColor: statusColor, color: 'white' }}
                      >
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>

                      {application.status === 'pending' && (
                        <button 
                          className="games-join-btn"
                          onClick={() => handleWithdrawClick(application, game)}
                        >
                          Withdraw Application
                        </button>
                      )}

                      {application.status === 'accepted' && (
                        <button 
                          className="games-message-btn"
                          onClick={() => handleMessageApplicant(game.createdBy)}
                        >
                          Message Host
                        </button>
                      )}

                      {/* Host Profile Button - moved to bottom right */}
                      <button className="games-profile-btn-bottom" onClick={() => handleViewProfile(game.createdBy)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-profile-icon">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        {game.createdBy}
                      </button>
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
                
              </div>
              
              <div className="games-form-row">
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
                
                <div className="games-form-group">
                  <label>DUPR Rating</label>
                  <select
                    value={newGame.duprRating}
                    onChange={(e) => setNewGame({...newGame, duprRating: e.target.value})}
                    className="games-form-select"
                  >
                    <option value="unrated">Unrated</option>
                    <option value="2.0">2.0+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3.0">3.0+</option>
                    <option value="3.5">3.5+</option>
                    <option value="4.0">4.0+</option>
                    <option value="4.5">4.5+</option>
                    <option value="5.0">5.0+</option>
                    <option value="5.5">5.5+</option>
                    <option value="6.0">6.0+</option>
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
                  <option value={7}>7 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={9}>9 Players</option>
                  <option value={10}>10 Players</option>
                  <option value={11}>11 Players</option>
                  <option value={12}>12 Players</option>
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

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="games-modal-overlay games-profile-modal-overlay" onClick={closeProfileModal}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Player Profile</h2>
              <button className="games-close-btn" onClick={closeProfileModal}>
                ✕
              </button>
            </div>
            <div className="games-form">
              <div className="games-profile-content">
                <div className="games-profile-avatar">
                  {selectedProfile.avatar}
                </div>
                <h3 className="games-profile-name">{selectedProfile.name}</h3>
                <div className="games-profile-details">
                  <p><strong>Age:</strong> {selectedProfile.age}</p>
                  <p><strong>Skill Level:</strong> {selectedProfile.skillLevel}</p>
                  <p><strong>Availability:</strong> {selectedProfile.availability}</p>
                  <p><strong>Distance:</strong> {selectedProfile.distance}</p>
                  <p><strong>Experience:</strong> {selectedProfile.experience}</p>
                  {selectedProfile.bio && <p><strong>Bio:</strong> "{selectedProfile.bio}"</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Confirmation Modal */}
      {showWithdrawConfirm && (
        <div className="games-modal-overlay" onClick={cancelWithdraw}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Withdraw Application</h2>
              <button className="games-close-btn" onClick={cancelWithdraw}>
                ✕
              </button>
            </div>
            <div className="games-form">
              <p style={{ textAlign: 'center', margin: '1rem 0 2rem 0', color: '#2C3E50' }}>
                Are you sure you want to withdraw your application for this game?
              </p>
              <div className="games-form-actions">
                <button 
                  type="button"
                  className="games-cancel-btn"
                  onClick={cancelWithdraw}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="games-submit-btn"
                  onClick={confirmWithdraw}
                  style={{ backgroundColor: '#F25C5C' }}
                >
                  Withdraw
                </button>
              </div>
            </div>
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
                <div className="games-request-game-header">
                  <h3 className="games-request-game-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-card-location-icon">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {selectedGame.location}
                  </h3>
                  <button className="games-edit-btn" onClick={() => handleEditGame(selectedGame)}>
                    Edit
                  </button>
                </div>
                
                <div className="games-request-game-details">
                  <div className="games-datetime">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="games-datetime-icon">
                      <path d="M16 14v2.2l1.6 1"></path>
                      <path d="M16 2v4"></path>
                      <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"></path>
                      <path d="M3 10h5"></path>
                      <path d="M8 2v4"></path>
                      <circle cx="16" cy="16" r="6"></circle>
                    </svg>
                    {formatDate(selectedGame.date)} • {formatTime(selectedGame.time)}
                  </div>
                  
                  <div className="games-request-badges">
                    <span className="games-type-badge">{selectedGame.gameType || 'Doubles'}</span>
                    <span className="games-type-badge">{selectedGame.skillLevel}</span>
                    {selectedGame.duprRating && selectedGame.duprRating !== 'unrated' && (
                      <span className="games-type-badge">DUPR {selectedGame.duprRating}+</span>
                    )}
                  </div>
                  
                  <div className="games-request-host">
                    Hosted by {selectedGame.createdBy}
                  </div>
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
                  <option value={5}>5 Players</option>
                  <option value={6}>6 Players</option>
                  <option value={7}>7 Players</option>
                  <option value={8}>8 Players</option>
                  <option value={9}>9 Players</option>
                  <option value={10}>10 Players</option>
                  <option value={11}>11 Players</option>
                  <option value={12}>12 Players</option>
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
                <div style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right', marginTop: '0.5rem' }}>
                  {requestData.message.length}/200 characters
                </div>
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

      {/* Manage Applications Modal */}
      {showManageModal && selectedGame && (
        <div className="games-modal-overlay" onClick={() => setShowManageModal(false)}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Manage Applications</h2>
              <button className="games-close-btn" onClick={() => setShowManageModal(false)}>
                ×
              </button>
            </div>
            <div className="games-form">
              <div className="games-request-game-info">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 className="games-request-game-title">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {selectedGame.location}
                  </h3>
                  <button 
                    className="games-edit-btn"
                    onClick={() => handleEditGame(selectedGame)}
                    style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      backgroundColor: '#3E5D45', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                </div>
                <div className="games-request-game-details">
                  <div className="games-request-badges">
                    <span className="games-type-badge">{selectedGame.gameType || 'Doubles'}</span>
                    <span className="games-type-badge">{capitalizeSkillLevel(selectedGame.skillLevel)}</span>
                  </div>
                  <p className="games-request-host">
                    <strong>Date:</strong> {formatDate(selectedGame.date)} at {formatTime(selectedGame.time)}
                  </p>
                  <p className="games-request-host">
                    <strong>Open Spots:</strong> {selectedGame.openSpots} / {selectedGame.totalSpots || 4}
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button 
                    className="games-remove-btn"
                    onClick={() => handleRemoveGame(selectedGame.id)}
                    style={{ 
                      padding: '4px 8px', 
                      fontSize: '12px', 
                      backgroundColor: '#F25C5C', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Remove Listing
                  </button>
                </div>
              </div>

              <div className="games-applications-list">
                {getGameApplications(selectedGame.id).length > 0 ? (
                  getGameApplications(selectedGame.id).map((application) => (
                    <div key={application.id} className="games-application-item">
                      <div className="games-application-info">
                        <div className="games-application-header">
                          <span className="games-application-player">{application.playerName}</span>
                          <span className="games-application-date">
                            Applied {formatDate(application.applicationDate)}
                          </span>
                        </div>
                        {application.message && (
                          <p className="games-application-message">"{application.message}"</p>
                        )}
                        <div className="games-application-details">
                          <span>Players: {application.playerCount}</span>
                        </div>
                      </div>
                      <div className="games-application-actions">
                        <button 
                          className="games-view-profile-btn"
                          onClick={() => handleViewApplicantProfile(application)}
                        >
                          View Profile
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button 
                              className="games-accept-btn"
                              onClick={() => handleAcceptApplication(application.id)}
                            >
                              Accept
                            </button>
                            <button 
                              className="games-reject-btn"
                              onClick={() => handleRejectApplication(application.id)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {application.status === 'accepted' && (
                          <>
                            <button 
                              className="games-accept-btn"
                              disabled
                            >
                              Accepted
                            </button>
                            <button 
                              className="games-message-btn"
                              onClick={() => handleMessageApplicant(application.playerName)}
                            >
                              Message
                            </button>
                          </>
                        )}
                        {application.status === 'rejected' && (
                          <button 
                            className="games-reject-btn"
                            disabled
                          >
                            Rejected
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="games-no-applications">
                    <p>No applications for this game.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="games-modal-overlay" onClick={closeMessageModal}>
          <div className="games-modal" onClick={(e) => e.stopPropagation()}>
            <div className="games-modal-header">
              <h2>Send Message to {messageData.recipientName}</h2>
              <button className="games-close-btn" onClick={closeMessageModal}>
                ✕
              </button>
            </div>
            <div className="games-form">
              <div className="games-message-form">
                <textarea
                  value={messageData.message}
                  onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="games-message-input"
                  rows="4"
                />
                <div className="games-message-actions">
                  <button 
                    className="games-btn games-btn-secondary"
                    onClick={closeMessageModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="games-btn games-btn-primary"
                    onClick={handleSendMessage}
                    disabled={!messageData.message.trim()}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Game Modal */}
      {showEditModal && editGameData && (
        <div className="games-modal-overlay">
          <div className="games-modal">
            <div className="games-modal-header">
              <h2>Edit Game</h2>
              <button 
                className="games-close-btn"
                onClick={() => setShowEditModal(false)}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleUpdateGame} className="games-form">
              <div className="games-form-group">
                <label>Location *</label>
                <input
                  type="text"
                  value={editGameData.location}
                  onChange={(e) => setEditGameData({...editGameData, location: e.target.value})}
                  placeholder="e.g., Central Park Courts"
                  required
                />
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Date *</label>
                  <DatePicker
                    value={editGameData.date}
                    onChange={(date) => setEditGameData({...editGameData, date})}
                    className="games-form-input"
                  />
                </div>
                
                <div className="games-form-group">
                  <label>Time *</label>
                  <TimePicker
                    value={editGameData.time}
                    onChange={(time) => setEditGameData({...editGameData, time})}
                    className="games-form-input"
                  />
                </div>
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Skill Level</label>
                  <select
                    value={editGameData.skillLevel}
                    onChange={(e) => setEditGameData({...editGameData, skillLevel: e.target.value})}
                    className="games-form-select"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                
                <div className="games-form-group">
                  <label>DUPR Rating</label>
                  <select
                    value={editGameData.duprRating}
                    onChange={(e) => setEditGameData({...editGameData, duprRating: e.target.value})}
                    className="games-form-select"
                  >
                    <option value="unrated">Unrated</option>
                    <option value="2.0">2.0+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3.0">3.0+</option>
                    <option value="3.5">3.5+</option>
                    <option value="4.0">4.0+</option>
                    <option value="4.5">4.5+</option>
                    <option value="5.0">5.0+</option>
                    <option value="5.5">5.5+</option>
                    <option value="6.0">6.0+</option>
                  </select>
                </div>
              </div>
              
              <div className="games-form-row">
                <div className="games-form-group">
                  <label>Game Type</label>
                  <select
                    value={editGameData.gameType}
                    onChange={(e) => setEditGameData({...editGameData, gameType: e.target.value})}
                    className="games-form-select"
                  >
                    <option value="doubles">Doubles</option>
                    <option value="singles">Singles</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
                
                <div className="games-form-group">
                  <label>Open Spots</label>
                  <select
                    value={editGameData.openSpots}
                    onChange={(e) => setEditGameData({...editGameData, openSpots: parseInt(e.target.value)})}
                    className="games-form-select"
                  >
                    <option value={1}>1 Player</option>
                    <option value={2}>2 Players</option>
                    <option value={3}>3 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={5}>5 Players</option>
                    <option value={6}>6 Players</option>
                    <option value={7}>7 Players</option>
                    <option value={8}>8 Players</option>
                  </select>
                </div>
              </div>
              
              <div className="games-form-group">
                <label>Description</label>
                <textarea
                  value={editGameData.description}
                  onChange={(e) => setEditGameData({...editGameData, description: e.target.value})}
                  placeholder="Additional details about the game..."
                  rows={3}
                  className="games-form-textarea"
                />
              </div>
              
              <div className="games-form-actions">
                <button 
                  type="button" 
                  className="games-cancel-btn"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="games-submit-btn"
                >
                  Update Game
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Game Confirmation Modal */}
      {showRemoveConfirm && gameToRemove && (
        <div className="games-modal-overlay">
          <div className="games-modal" style={{ maxWidth: '400px' }}>
            <div className="games-modal-header">
              <h2>Remove Game Listing</h2>
            </div>
            <div className="games-form">
              <div style={{ marginBottom: '20px' }}>
                <p>Are you sure you want to remove this game listing?</p>
                <div style={{ 
                  backgroundColor: '#f3f4f6', 
                  padding: '12px', 
                  borderRadius: '8px',
                  margin: '16px 0'
                }}>
                  <strong>{gameToRemove.location}</strong><br />
                  {formatDate(gameToRemove.date)} at {formatTime(gameToRemove.time)}
                </div>
                <p style={{ color: '#F25C5C', fontSize: '14px' }}>
                  This action cannot be undone.
                </p>
              </div>
              <div className="games-form-actions">
                <button 
                  type="button" 
                  className="games-cancel-btn"
                  onClick={cancelRemoveGame}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="games-submit-btn"
                  onClick={confirmRemoveGame}
                  style={{ backgroundColor: '#F25C5C' }}
                >
                  Remove Game
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Native Notification */}
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
};

export default Games;
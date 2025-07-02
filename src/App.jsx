import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import './App.css';

const mockPlayers = [
  { id: 1, name: "Alex Johnson", skill: "Intermediate", availability: "Evenings", gender: "Male" },
  { id: 2, name: "Sarah Chen", skill: "Advanced", availability: "Mornings", gender: "Female" },
  { id: 3, name: "Mike Rodriguez", skill: "Beginner", availability: "Weekends", gender: "Male" },
  { id: 4, name: "Emma Wilson", skill: "Intermediate", availability: "Afternoons", gender: "Female" },
  { id: 5, name: "David Kim", skill: "Advanced", availability: "Mornings", gender: "Male" }
];

function AppContent() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(mockPlayers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [connections, setConnections] = useState([]);
  const [showMessage, setShowMessage] = useState('');
  const [activeMessagesTab, setActiveMessagesTab] = useState('chat');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Chat and Notifications state
  const [conversations, setConversations] = useState([
    { id: 1, name: 'Sarah Wilson', lastMessage: 'Great game yesterday!', timestamp: '2024-01-15T10:30:00Z', unread: 1, avatar: '👩‍🦱' },
    { id: 2, name: 'Mike Chen', lastMessage: 'Are you free for doubles tomorrow?', timestamp: '2024-01-15T09:15:00Z', unread: 1, avatar: '👨‍🦲' }
  ]);
  
  const [chatMessages, setChatMessages] = useState({
    1: [
      { id: 1, sender: 'Sarah Wilson', message: 'Hey! How are you doing?', timestamp: '2024-01-15T09:00:00Z', isMe: false },
      { id: 2, sender: 'You', message: 'Hey Sarah! I\'m doing great, thanks for asking!', timestamp: '2024-01-15T09:05:00Z', isMe: true },
      { id: 3, sender: 'Sarah Wilson', message: 'Great game yesterday!', timestamp: '2024-01-15T10:30:00Z', isMe: false }
    ],
    2: [
      { id: 4, sender: 'Mike Chen', message: 'Hi there! Great to connect with you', timestamp: '2024-01-15T08:00:00Z', isMe: false },
      { id: 5, sender: 'You', message: 'Hey Mike! Nice to meet you too!', timestamp: '2024-01-15T08:30:00Z', isMe: true },
      { id: 6, sender: 'Mike Chen', message: 'Are you free for doubles tomorrow?', timestamp: '2024-01-15T09:15:00Z', isMe: false }
    ]
  });
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'acceptance', message: 'Your request to join "Morning Doubles at Central Park" has been accepted!', timestamp: '2024-01-15T11:00:00Z', read: false },
    { id: 2, type: 'message', message: 'New message from Sarah Wilson', timestamp: '2024-01-15T10:30:00Z', read: false },
    { id: 3, type: 'info', message: 'Game reminder: You have a game at 2 PM today', timestamp: '2024-01-15T08:00:00Z', read: false }
  ]);

  // Dynamic unread counts calculated from actual data (after state declarations)
  const unreadChatCount = conversations.reduce((total, conv) => total + conv.unread, 0);
  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  // Auto-cleanup old applications
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setGameApplications(prev => {
        const now = new Date();
        return prev.filter(app => {
          // Remove rejected applications that are older than 24 hours
          if (app.status === 'rejected') {
            const rejectedTime = new Date(app.appliedDate);
            const timeDiff = now - rejectedTime;
            return timeDiff < 24 * 60 * 60 * 1000; // Keep for 24 hours
          }
          
          // Remove accepted applications if game date has passed
          if (app.status === 'accepted') {
            return !isGameDatePassed(app.gameDate, app.gameTime);
          }
          
          // Keep pending applications
          return true;
        });
      });
    }, 60000); // Check every minute

    return () => clearInterval(cleanupInterval);
  }, []);
  
  // Games navigation state
  const [activeGamesTab, setActiveGamesTab] = useState('find');
  const [showPostGameForm, setShowPostGameForm] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedGameForApplicants, setSelectedGameForApplicants] = useState(null);
  const [newGame, setNewGame] = useState({
    location: '',
    date: '',
    time: '',
    maxPlayers: 4,
    skillLevel: 'all',
    description: ''
  });
  
  // Game applications state
  const [gameApplications, setGameApplications] = useState([
    { id: 1, gameTitle: "Advanced Doubles", gameLocation: "Tennis Club", gameDate: "2024-12-20", gameTime: "07:00", status: "pending", hostName: "Sarah Chen", appliedDate: "2024-01-14T10:00:00Z" },
    { id: 2, gameTitle: "Weekend Warriors", gameLocation: "Outdoor Courts", gameDate: "2024-12-21", gameTime: "10:00", status: "accepted", hostName: "Emma Wilson", appliedDate: "2024-01-13T15:30:00Z" },
    { id: 3, gameTitle: "Evening Practice", gameLocation: "Community Center", gameDate: "2024-12-19", gameTime: "18:00", status: "rejected", hostName: "Mike Chen", appliedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() } // 2 hours ago - will be removed soon
  ]);

  // Function to get current applicant count for a game
  const getApplicantCount = (gameId) => {
    return gameApplicants[gameId]?.length || 0;
  };

  // My posted games state
  const [myPostedGames, setMyPostedGames] = useState([
    { id: 1, title: "Morning Doubles", date: "Dec 15, 2024", time: "9:00 AM", players: "2/4", location: "Central Park Courts" },
    { id: 2, title: "Evening Singles", date: "Dec 16, 2024", time: "6:00 PM", players: "1/2", location: "Riverside Recreation" }
  ]);

  // Sample applicants data for posted games
  const [gameApplicants, setGameApplicants] = useState({
    1: [ // Morning Doubles applicants
      { id: 101, name: "Alex Johnson", skill: "Intermediate", message: "Would love to join! I play regularly and am available for morning games.", status: "pending", appliedDate: "2024-01-14T08:30:00Z" },
      { id: 102, name: "Maria Rodriguez", skill: "Advanced", message: "Hi! Looking for a good doubles partner. I've been playing for 3 years.", status: "pending", appliedDate: "2024-01-14T09:15:00Z" },
      { id: 103, name: "David Kim", skill: "Beginner", message: "New to pickleball but eager to learn. Hope you don't mind a beginner!", status: "pending", appliedDate: "2024-01-14T10:00:00Z" }
    ],
    2: [ // Evening Singles applicants  
      { id: 201, name: "Sarah Wilson", skill: "Intermediate", message: "Perfect timing for me! I get off work at 5:30 and this location is close.", status: "pending", appliedDate: "2024-01-14T11:00:00Z" }
    ]
  });

  // Function to handle requesting to join a game
  const handleRequestToJoin = (game) => {
    // Check if already applied
    const alreadyApplied = gameApplications.some(app => app.gameTitle === game.title);
    if (alreadyApplied) {
      setShowMessage(`You've already applied to "${game.title}"!`);
      setTimeout(() => setShowMessage(''), 3000);
      return;
    }

    // Add new application
    const newApplication = {
      id: Date.now(),
      gameTitle: game.title,
      gameLocation: game.location,
      gameDate: game.date,
      gameTime: game.time,
      status: "pending",
      hostName: game.host,
      appliedDate: new Date().toISOString()
    };

    setGameApplications(prev => [...prev, newApplication]);
    setShowMessage(`🎉 Application sent to "${game.title}"! Check "My Requests" tab to track status.`);
    setTimeout(() => setShowMessage(''), 4000);
  };

  // Function to handle viewing applicants (for my games)
  const handleViewApplicants = (game) => {
    setSelectedGameForApplicants(game);
    setShowApplicantsModal(true);
  };

  // Function to handle accepting/rejecting applicants
  const handleApplicantAction = (applicantId, action) => {
    const applicant = gameApplicants[selectedGameForApplicants.id].find(a => a.id === applicantId);
    
    if (action === 'accepted') {
      // Mark as accepted
      setGameApplicants(prev => ({
        ...prev,
        [selectedGameForApplicants.id]: prev[selectedGameForApplicants.id].map(app =>
          app.id === applicantId ? { ...app, status: 'accepted' } : app
        )
      }));
      setShowMessage(`✅ ${applicant?.name} has been accepted for "${selectedGameForApplicants.title}"! You can now message them.`);
    } else {
      // Remove rejected applicants immediately
      setGameApplicants(prev => ({
        ...prev,
        [selectedGameForApplicants.id]: prev[selectedGameForApplicants.id].filter(app => app.id !== applicantId)
      }));
      setShowMessage(`❌ ${applicant?.name} has been rejected and removed from the applicants list.`);
    }
    
    setTimeout(() => setShowMessage(''), 4000);
  };

  // Function to message an accepted applicant
  const handleMessageApplicant = (applicant) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.name === applicant.name);
    
    if (!existingConv) {
      // Create new conversation
      const newConversation = {
        id: Date.now(),
        name: applicant.name,
        lastMessage: `Ready to coordinate for "${selectedGameForApplicants.title}"!`,
        timestamp: new Date().toISOString(),
        unread: 0,
        avatar: '👤'
      };
      
      setConversations(prev => [...prev, newConversation]);
      
      // Add initial message
      setChatMessages(prev => ({
        ...prev,
        [newConversation.id]: [
          {
            id: Date.now(),
            sender: applicant.name,
            message: `Hi! Thanks for accepting me for "${selectedGameForApplicants.title}". Looking forward to playing!`,
            timestamp: new Date().toISOString(),
            isMe: false
          }
        ]
      }));
      
      // Set as selected conversation
      setSelectedConversation(newConversation.id);
    } else {
      // Use existing conversation
      setSelectedConversation(existingConv.id);
    }
    
    // Navigate to messages and set active tab
    setActiveMessagesTab('chat');
    navigate('/messages');
    
    // Close the applicants modal
    setShowApplicantsModal(false);
    
    setShowMessage(`💬 Chat opened with ${applicant.name}!`);
    setTimeout(() => setShowMessage(''), 3000);
  };

  // Function to contact host for accepted games
  const handleContactHost = (application) => {
    setShowMessage(`💬 Opening chat with ${application.hostName} about "${application.gameTitle}". You can coordinate details here!`);
    setTimeout(() => setShowMessage(''), 4000);
  };

  // Function to check if a game date has passed
  const isGameDatePassed = (gameDate, gameTime) => {
    const gameDateTime = new Date(`${gameDate} ${gameTime}`);
    const now = new Date();
    return gameDateTime < now;
  };

  // Function to filter out past accepted games and old rejected games
  const filterActiveApplications = () => {
    const now = new Date();
    return gameApplications.filter(app => {
      // Remove rejected applications that are older than 24 hours
      if (app.status === 'rejected') {
        const rejectedTime = new Date(app.appliedDate);
        const timeDiff = now - rejectedTime;
        return timeDiff < 24 * 60 * 60 * 1000; // Keep for 24 hours
      }
      
      // Remove accepted applications if game date has passed
      if (app.status === 'accepted') {
        return !isGameDatePassed(app.gameDate, app.gameTime);
      }
      
      // Keep pending applications
      return true;
    });
  };

  // Function to handle posting a new game
  const handlePostGame = () => {
    setShowPostGameForm(true);
  };

  // Function to handle game form submission
  const handleGameFormSubmit = (e) => {
    e.preventDefault();
    // Here you would normally save to a backend, but for demo we'll just show success
    setShowMessage(`🎉 Game at "${newGame.location}" posted successfully! Players can now request to join.`);
    setShowPostGameForm(false);
    
    // Reset form
    setNewGame({
      location: '',
      date: '',
      time: '',
      maxPlayers: 4,
      skillLevel: 'all',
      description: ''
    });
    
    setTimeout(() => setShowMessage(''), 4000);
  };

  const filteredPlayers = players.filter(player => 
    filter === 'All' || player.skill === filter
  );

  const currentPlayer = filteredPlayers[currentIndex];

  const handlePass = () => {
    setShowMessage(`Passed on ${currentPlayer.name}`);
    nextPlayer();
  };

  const handleConnect = () => {
    setConnections(prev => [...prev, currentPlayer]);
    setShowMessage(`🎉 Connected with ${currentPlayer.name}!`);
    nextPlayer();
  };

  const nextPlayer = () => {
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredPlayers.length);
      setShowMessage('');
    }, 1000);
  };

  const resetFeed = () => {
    setCurrentIndex(0);
    setPlayers(mockPlayers);
    setConnections([]);
    setShowMessage('Feed reset! 🔄');
    setTimeout(() => setShowMessage(''), 2000);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const messageId = Date.now();
    const newMsg = {
      id: messageId,
      sender: 'You',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isMe: true
    };
    
    setChatMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), newMsg]
    }));
    
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: newMessage.trim(), timestamp: new Date().toISOString() }
        : conv
    ));
    
    setNewMessage('');
    
    // Simulate response after a short delay
    setTimeout(() => {
      const responseId = Date.now() + 1;
      const responses = [
        "That sounds great!",
        "I'm looking forward to it!",
        "Perfect timing!",
        "Count me in!",
        "Awesome, see you there!"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const responseMsg = {
        id: responseId,
        sender: conversations.find(c => c.id === selectedConversation)?.name,
        message: randomResponse,
        timestamp: new Date().toISOString(),
        isMe: false
      };
      
      setChatMessages(prev => ({
        ...prev,
        [selectedConversation]: [...(prev[selectedConversation] || []), responseMsg]
      }));
      
      setConversations(prev => prev.map(conv => 
        conv.id === selectedConversation 
          ? { ...conv, lastMessage: randomResponse, timestamp: new Date().toISOString(), unread: conv.unread + 1 }
          : conv
             ));
     }, 1500);
   };

   const markNotificationAsRead = (notificationId) => {
     setNotifications(prev => prev.map(notification => 
       notification.id === notificationId 
         ? { ...notification, read: true }
         : notification
     ));
   };

  return (
    <div className="App">
      <Navigation unreadChatCount={unreadChatCount} unreadNotificationCount={unreadNotificationCount} />
      <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/players" replace />} />
            <Route path="/players" element={
              <div style={{ padding: '20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h1>🏓 Find Your Pickleball Match!</h1>
                  <p>Connect with pickleball players in your area</p>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ backgroundColor: '#10b981', color: 'white', padding: '5px 15px', borderRadius: '20px', marginRight: '10px' }}>
                      💚 {connections.length} connections
                    </span>
                    <button onClick={resetFeed} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #ccc', backgroundColor: '#f3f4f6' }}>
                      🔄 Reset Feed
                    </button>
                  </div>
                </header>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button 
                      key={level}
                      onClick={() => { setFilter(level); setCurrentIndex(0); }}
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: '20px', 
                        border: '1px solid #ccc', 
                        backgroundColor: filter === level ? '#6366f1' : 'white',
                        color: filter === level ? 'white' : 'black',
                        cursor: 'pointer'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                {showMessage && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '15px', 
                    backgroundColor: '#dcfce7', 
                    border: '1px solid #16a34a', 
                    borderRadius: '10px', 
                    marginBottom: '20px',
                    maxWidth: '400px',
                    margin: '0 auto 20px auto'
                  }}>
                    {showMessage}
                  </div>
                )}

                <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                  {currentPlayer ? (
                    <div style={{ 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '15px', 
                      padding: '30px', 
                      backgroundColor: 'white',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h3>🏓 {currentPlayer.name}</h3>
                      <p><strong>Skill:</strong> {currentPlayer.skill}</p>
                      <p><strong>Available:</strong> {currentPlayer.availability}</p>
                      <p><strong>Gender:</strong> {currentPlayer.gender}</p>
                      
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                        <button style={{ 
                          padding: '12px 24px', 
                          backgroundColor: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '25px',
                          cursor: 'pointer'
                        }} onClick={handlePass}>
                          👎 Pass
                        </button>
                        <button style={{ 
                          padding: '12px 24px', 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '25px',
                          cursor: 'pointer'
                        }} onClick={handleConnect}>
                          👍 Connect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                      <h3>🎉 No more players!</h3>
                      <p>You've seen everyone in this category.</p>
                      <button onClick={resetFeed} style={{ 
                        padding: '15px 30px', 
                        backgroundColor: '#6366f1', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '25px',
                        cursor: 'pointer'
                      }}>
                        🔄 Reset Feed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            } />
            <Route path="/matched-players" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🤝 Your Connections</h2>
                {connections.length === 0 ? (
                  <p>No connections yet. Go to Matches to connect with players!</p>
                ) : (
                  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {connections.map(player => (
                      <div key={player.id} style={{ 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '10px', 
                        padding: '20px', 
                        margin: '10px 0',
                        backgroundColor: 'white'
                      }}>
                        <h4>🏓 {player.name}</h4>
                        <p>Skill: {player.skill} | Available: {player.availability}</p>
                        <button style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '20px',
                          cursor: 'pointer'
                        }}>
                          💬 Message
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            } />
            <Route path="/games" element={
              <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Games Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h1 style={{ margin: 0, color: '#1f2937', fontSize: '2.5rem' }}>🏓 Games</h1>
                  {activeGamesTab === 'mygames' && (
                    <button 
                      onClick={handlePostGame}
                      style={{
                      padding: '12px 24px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      + Post a Game
                    </button>
                  )}
                </div>
                
                {/* Message Display */}
                {showMessage && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '15px', 
                    backgroundColor: '#dcfce7', 
                    border: '1px solid #16a34a', 
                    borderRadius: '10px', 
                    marginBottom: '20px',
                    maxWidth: '600px',
                    margin: '0 auto 20px auto'
                  }}>
                    <p style={{ margin: 0, color: '#15803d', fontWeight: '600' }}>{showMessage}</p>
                  </div>
                )}

                {/* Post Game Form Modal */}
                {showPostGameForm && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '15px',
                      padding: '30px',
                      maxWidth: '500px',
                      width: '90%',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                      {/* Modal Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '25px',
                        paddingBottom: '15px',
                        borderBottom: '2px solid #e5e7eb'
                      }}>
                        <h2 style={{ margin: 0, color: '#1f2937' }}>🏓 Post a New Game</h2>
                        <button 
                          onClick={() => setShowPostGameForm(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '0',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Form */}
                      <form onSubmit={handleGameFormSubmit}>

                        
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: '#374151' 
                          }}>
                            Location *
                          </label>
                          <input
                            type="text"
                            value={newGame.location}
                            onChange={(e) => setNewGame({...newGame, location: e.target.value})}
                            placeholder="e.g., Central Park Courts"
                            required
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '16px',
                              outline: 'none',
                              backgroundColor: 'white',
                              color: '#1f2937',
                              transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          />
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: '#374151' 
                            }}>
                              Date *
                            </label>
                            <input
                              type="date"
                              value={newGame.date}
                              onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                              required
                              style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                backgroundColor: 'white',
                                color: '#1f2937',
                                transition: 'border-color 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#10b981'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: '#374151' 
                            }}>
                              Time *
                            </label>
                            <input
                              type="time"
                              value={newGame.time}
                              onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                              required
                              style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                backgroundColor: 'white',
                                color: '#1f2937',
                                transition: 'border-color 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#10b981'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            />
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: '#374151' 
                            }}>
                              Max Players
                            </label>
                            <select
                              value={newGame.maxPlayers}
                              onChange={(e) => setNewGame({...newGame, maxPlayers: parseInt(e.target.value)})}
                              style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                backgroundColor: 'white',
                                color: '#1f2937',
                                transition: 'border-color 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#10b981'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                              <option value={1}>1 Player</option>
                              <option value={2}>2 Players</option>
                              <option value={3}>3 Players</option>
                              <option value={4}>4 Players</option>
                              <option value={5}>5 Players</option>
                              <option value={6}>6 Players</option>
                            </select>
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <label style={{ 
                              display: 'block', 
                              marginBottom: '8px', 
                              fontWeight: '600', 
                              color: '#374151' 
                            }}>
                              Skill Level
                            </label>
                            <select
                              value={newGame.skillLevel}
                              onChange={(e) => setNewGame({...newGame, skillLevel: e.target.value})}
                              style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '16px',
                                outline: 'none',
                                backgroundColor: 'white',
                                color: '#1f2937',
                                transition: 'border-color 0.2s ease'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#10b981'}
                              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                            >
                              <option value="all">All Levels</option>
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </select>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '25px' }}>
                          <label style={{ 
                            display: 'block', 
                            marginBottom: '8px', 
                            fontWeight: '600', 
                            color: '#374151' 
                          }}>
                            Description (Optional)
                          </label>
                          <textarea
                            value={newGame.description}
                            onChange={(e) => setNewGame({...newGame, description: e.target.value})}
                            placeholder="Add any additional details about the game..."
                            rows={3}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '2px solid #d1d5db',
                              borderRadius: '8px',
                              fontSize: '16px',
                              outline: 'none',
                              backgroundColor: 'white',
                              color: '#1f2937',
                              resize: 'vertical',
                              minHeight: '80px',
                              transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          />
                        </div>
                        
                        {/* Form Actions */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '12px', 
                          justifyContent: 'flex-end',
                          paddingTop: '15px',
                          borderTop: '1px solid #e5e7eb'
                        }}>
                          <button 
                            type="button" 
                            onClick={() => setShowPostGameForm(false)}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '16px'
                            }}
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit" 
                            style={{
                              padding: '12px 24px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '600',
                              fontSize: '16px'
                            }}
                          >
                            Post Game
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* View Applicants Modal */}
                {showApplicantsModal && selectedGameForApplicants && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '15px',
                      padding: '30px',
                      maxWidth: '700px',
                      width: '90%',
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                      {/* Modal Header */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '25px',
                        paddingBottom: '15px',
                        borderBottom: '2px solid #e5e7eb'
                      }}>
                        <div>
                          <h2 style={{ margin: 0, color: '#1f2937' }}>📨 Applicants for "{selectedGameForApplicants.title}"</h2>
                          <p style={{ margin: '5px 0 0 0', color: '#6b7280' }}>
                            📅 {selectedGameForApplicants.date} at {selectedGameForApplicants.time} • 📍 {selectedGameForApplicants.location}
                          </p>
                        </div>
                        <button 
                          onClick={() => setShowApplicantsModal(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '0',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      
                      {/* Applicants List */}
                      <div style={{ display: 'grid', gap: '20px' }}>
                        {gameApplicants[selectedGameForApplicants.id]?.length === 0 ? (
                          <div style={{ 
                            padding: '40px 20px', 
                            textAlign: 'center', 
                            backgroundColor: '#f9fafb',
                            borderRadius: '10px',
                            border: '2px dashed #d1d5db'
                          }}>
                            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👥</div>
                            <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No applicants yet</h3>
                            <p style={{ color: '#6b7280', margin: 0 }}>Players will appear here when they request to join your game.</p>
                          </div>
                        ) : (
                          gameApplicants[selectedGameForApplicants.id]?.map(applicant => (
                            <div key={applicant.id} style={{
                              border: `2px solid ${applicant.status === 'accepted' ? '#10b981' : applicant.status === 'rejected' ? '#ef4444' : '#e5e7eb'}`,
                              borderRadius: '12px',
                              padding: '20px',
                              backgroundColor: applicant.status === 'accepted' ? '#f0fdf4' : applicant.status === 'rejected' ? '#fef2f2' : 'white'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, color: '#1f2937' }}>{applicant.name}</h3>
                                    <span style={{
                                      backgroundColor: applicant.skill === 'Advanced' ? '#ef4444' : applicant.skill === 'Intermediate' ? '#f59e0b' : '#10b981',
                                      color: 'white',
                                      padding: '4px 8px',
                                      borderRadius: '12px',
                                      fontSize: '12px',
                                      fontWeight: '600'
                                    }}>
                                      {applicant.skill}
                                    </span>
                                    {applicant.status !== 'pending' && (
                                      <span style={{
                                        backgroundColor: applicant.status === 'accepted' ? '#10b981' : '#ef4444',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600'
                                      }}>
                                        {applicant.status === 'accepted' ? '✅ ACCEPTED' : '❌ REJECTED'}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div style={{
                                    backgroundColor: '#f8fafc',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                    border: '1px solid #e2e8f0'
                                  }}>
                                    <p style={{ margin: 0, color: '#1f2937', fontSize: '14px', fontStyle: 'italic' }}>
                                      "{applicant.message}"
                                    </p>
                                  </div>
                                  
                                  <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
                                    Applied on {new Date(applicant.appliedDate).toLocaleDateString()} at {new Date(applicant.appliedDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                </div>
                                
                                                                 {applicant.status === 'pending' && (
                                   <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
                                     <button 
                                       onClick={() => handleApplicantAction(applicant.id, 'accepted')}
                                       style={{
                                         padding: '8px 16px',
                                         backgroundColor: '#10b981',
                                         color: 'white',
                                         border: 'none',
                                         borderRadius: '6px',
                                         cursor: 'pointer',
                                         fontSize: '14px',
                                         fontWeight: '600',
                                         whiteSpace: 'nowrap'
                                       }}
                                     >
                                       ✅ Accept
                                     </button>
                                     <button 
                                       onClick={() => handleApplicantAction(applicant.id, 'rejected')}
                                       style={{
                                         padding: '8px 16px',
                                         backgroundColor: '#ef4444',
                                         color: 'white',
                                         border: 'none',
                                         borderRadius: '6px',
                                         cursor: 'pointer',
                                         fontSize: '14px',
                                         fontWeight: '600',
                                         whiteSpace: 'nowrap'
                                       }}
                                     >
                                       ❌ Reject
                                     </button>
                                   </div>
                                 )}
                                 
                                 {applicant.status === 'accepted' && (
                                   <div style={{ display: 'flex', flexDirection: 'column' }}>
                                     <button 
                                       onClick={() => handleMessageApplicant(applicant)}
                                       style={{
                                         padding: '10px 16px',
                                         backgroundColor: '#3b82f6',
                                         color: 'white',
                                         border: 'none',
                                         borderRadius: '6px',
                                         cursor: 'pointer',
                                         fontSize: '14px',
                                         fontWeight: '600',
                                         whiteSpace: 'nowrap'
                                       }}
                                     >
                                       💬 Message
                                     </button>
                                   </div>
                                 )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Modal Footer */}
                      <div style={{ 
                        marginTop: '25px',
                        paddingTop: '20px',
                        borderTop: '1px solid #e5e7eb',
                        textAlign: 'center'
                      }}>
                        <button 
                          onClick={() => setShowApplicantsModal(false)}
                          style={{
                            padding: '12px 24px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '16px'
                          }}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab Navigation */}
                <div style={{ 
                  display: 'flex', 
                  gap: '5px', 
                  marginBottom: '30px',
                  backgroundColor: '#f3f4f6',
                  padding: '5px',
                  borderRadius: '12px',
                  maxWidth: '500px',
                  margin: '0 auto 30px auto'
                }}>
                  <button 
                    onClick={() => setActiveGamesTab('find')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeGamesTab === 'find' ? '#10b981' : 'transparent',
                      color: activeGamesTab === 'find' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Find a Game
                  </button>
                  <button 
                    onClick={() => setActiveGamesTab('mygames')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeGamesTab === 'mygames' ? '#10b981' : 'transparent',
                      color: activeGamesTab === 'mygames' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    My Games ({myPostedGames.length})
                  </button>
                  <button 
                    onClick={() => setActiveGamesTab('applications')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeGamesTab === 'applications' ? '#10b981' : 'transparent',
                      color: activeGamesTab === 'applications' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    My Requests ({filterActiveApplications().length})
                  </button>
                </div>

                {/* Find a Game Tab */}
                {activeGamesTab === 'find' && (
                  <div>
                    <h2 style={{ color: '#374151', marginBottom: '20px', textAlign: 'center' }}>Available Games</h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {[
                        { id: 3, title: "Advanced Doubles", date: "Dec 17, 2024", time: "7:00 AM", players: "3/4", location: "Tennis Club", host: "Sarah Chen", skill: "Advanced" },
                        { id: 4, title: "Beginner Friendly", date: "Dec 17, 2024", time: "2:00 PM", players: "1/4", location: "Community Center", host: "Mike Rodriguez", skill: "Beginner" },
                        { id: 5, title: "Weekend Warriors", date: "Dec 18, 2024", time: "10:00 AM", players: "2/4", location: "Outdoor Courts", host: "Emma Wilson", skill: "Intermediate" },
                        { id: 6, title: "Morning Practice", date: "Dec 19, 2024", time: "8:00 AM", players: "0/4", location: "Recreation Center", host: "Alex Johnson", skill: "Intermediate" }
                      ].map(game => {
                        const hasApplied = gameApplications.some(app => app.gameTitle === game.title);
                        return (
                          <div key={game.id} style={{
                            border: '2px solid #e5e7eb',
                            borderRadius: '15px',
                            padding: '20px',
                            backgroundColor: 'white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            transition: 'transform 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                              <div style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{game.title}</h3>
                                <p style={{ margin: '5px 0', color: '#6b7280' }}>🏓 Hosted by {game.host}</p>
                                <p style={{ margin: '5px 0', color: '#6b7280' }}>📅 {game.date} at {game.time}</p>
                                <p style={{ margin: '5px 0', color: '#6b7280' }}>📍 {game.location}</p>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                                  <span style={{ 
                                    backgroundColor: game.skill === 'Advanced' ? '#ef4444' : game.skill === 'Intermediate' ? '#f59e0b' : '#10b981',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '15px',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                  }}>
                                    {game.skill}
                                  </span>
                                  <span style={{ color: '#6b7280', fontWeight: '600' }}>👥 {game.players} players</span>
                                </div>
                              </div>
                              <button 
                                onClick={() => handleRequestToJoin(game)}
                                disabled={hasApplied}
                                style={{
                                padding: '10px 20px',
                                backgroundColor: hasApplied ? '#9ca3af' : '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '25px',
                                cursor: hasApplied ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap',
                                fontWeight: '600',
                                fontSize: '14px',
                                opacity: hasApplied ? 0.6 : 1
                              }}>
                                {hasApplied ? 'Applied ✓' : 'Request to Join'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* My Games Tab */}
                {activeGamesTab === 'mygames' && (
                  <div>
                    <h2 style={{ color: '#374151', marginBottom: '20px', textAlign: 'center' }}>My Posted Games</h2>
                                         <div style={{ display: 'grid', gap: '15px' }}>
                       {myPostedGames.map(game => (
                        <div key={game.id} style={{
                          border: '2px solid #e5e7eb',
                          borderRadius: '15px',
                          padding: '20px',
                          backgroundColor: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, color: '#1f2937' }}>{game.title}</h3>
                                <span style={{
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  padding: '4px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: '600'
                                }}>
                                  HOST
                                </span>
                              </div>
                              <p style={{ margin: '5px 0', color: '#6b7280' }}>📅 {game.date} at {game.time}</p>
                              <p style={{ margin: '5px 0', color: '#6b7280' }}>📍 {game.location}</p>
                              <p style={{ margin: '5px 0', color: '#6b7280' }}>👥 {game.players} players</p>
                              <p style={{ margin: '5px 0', color: '#6b7280' }}>📨 {getApplicantCount(game.id)} applicants</p>
                            </div>
                                                         <button 
                               onClick={() => handleViewApplicants(game)}
                               style={{
                               padding: '10px 20px',
                               backgroundColor: '#6366f1',
                               color: 'white',
                               border: 'none',
                               borderRadius: '25px',
                               cursor: 'pointer',
                               whiteSpace: 'nowrap',
                               fontWeight: '600',
                               fontSize: '14px'
                             }}>
                               View Applicants
                             </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                                         {/* Empty state for no games */}
                     {myPostedGames.length === 0 && (
                       <div style={{ 
                         padding: '60px 20px', 
                         textAlign: 'center', 
                         backgroundColor: 'white',
                         borderRadius: '15px',
                         border: '2px dashed #e5e7eb'
                       }}>
                         <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏓</div>
                         <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No games posted yet</h3>
                         <p style={{ color: '#6b7280', margin: 0 }}>Click "Post a Game" to organize your first pickleball game!</p>
                       </div>
                     )}
                  </div>
                )}

                {/* My Applications Tab */}
                {activeGamesTab === 'applications' && (
                  <div>
                    <h2 style={{ color: '#374151', marginBottom: '20px', textAlign: 'center' }}>My Game Requests</h2>
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {filterActiveApplications().map(application => (
                        <div key={application.id} style={{
                          border: `2px solid ${application.status === 'pending' ? '#f59e0b' : application.status === 'accepted' ? '#10b981' : '#ef4444'}`,
                          borderRadius: '15px',
                          padding: '20px',
                          backgroundColor: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <h3 style={{ margin: 0, color: '#1f2937' }}>{application.gameTitle}</h3>
                                <span style={{
                                  backgroundColor: application.status === 'pending' ? '#f59e0b' : application.status === 'accepted' ? '#10b981' : '#ef4444',
                                  color: 'white',
                                  padding: '4px 12px',
                                  borderRadius: '12px',
                                  fontSize: '12px',
                                  fontWeight: '600'
                                }}>
                                  {application.status === 'pending' ? '⏳ PENDING' : application.status === 'accepted' ? '✅ ACCEPTED' : '❌ REJECTED'}
                                </span>
                              </div>
                              <p style={{ margin: '5px 0', color: '#6b7280' }}>🏓 Hosted by {application.hostName}</p>
                              <p style={{ margin: '5px 0', color: '#6b7280' }}>📅 {application.gameDate} at {application.gameTime}</p>
                              <p style={{ margin: '5px 0', color: '#6b7280' }}>📍 {application.gameLocation}</p>
                              <p style={{ margin: '5px 0', color: '#6b7280', fontSize: '14px' }}>Applied on {new Date(application.appliedDate).toLocaleDateString()}</p>
                              
                              {application.status === 'accepted' && (
                                <p style={{ margin: '10px 0 0 0', color: '#10b981', fontWeight: '600', fontSize: '14px' }}>
                                  🎉 You're in! Game starts {application.gameDate} at {application.gameTime}.
                                </p>
                              )}
                              {application.status === 'rejected' && (
                                <p style={{ margin: '10px 0 0 0', color: '#ef4444', fontSize: '14px' }}>
                                  ❌ Application was not accepted. This will be removed automatically.
                                </p>
                              )}
                            </div>
                            
                            {application.status === 'pending' && (
                              <button 
                                onClick={() => setGameApplications(prev => prev.filter(app => app.id !== application.id))}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '20px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}
                              >
                                Withdraw
                              </button>
                            )}
                            
                            {application.status === 'accepted' && (
                              <button 
                                onClick={() => handleContactHost(application)}
                                style={{
                                  padding: '10px 20px',
                                  backgroundColor: '#10b981',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '25px',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap',
                                  fontSize: '14px',
                                  fontWeight: '600'
                                }}
                              >
                                💬 Contact Host
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {filterActiveApplications().length === 0 && (
                      <div style={{ 
                        padding: '60px 20px', 
                        textAlign: 'center', 
                        backgroundColor: 'white',
                        borderRadius: '15px',
                        border: '2px dashed #e5e7eb'
                      }}>
                        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📝</div>
                        <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No applications yet</h3>
                        <p style={{ color: '#6b7280', margin: 0 }}>Browse available games to start applying!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            } />
            <Route path="/messages" element={
              <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h1 style={{ margin: 0, color: '#1f2937', fontSize: '2.5rem' }}>💬 Messages</h1>
                </div>
                
                {/* Tab Navigation with Unread Count Badges */}
                <div style={{ 
                  display: 'flex', 
                  gap: '5px', 
                  marginBottom: '30px',
                  backgroundColor: '#f3f4f6',
                  padding: '5px',
                  borderRadius: '12px',
                  maxWidth: '400px',
                  margin: '0 auto 30px auto'
                }}>
                  <button 
                    onClick={() => setActiveMessagesTab('chat')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeMessagesTab === 'chat' ? '#10b981' : 'transparent',
                      color: activeMessagesTab === 'chat' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    💬 Chat{unreadChatCount > 0 && ` (${unreadChatCount})`}
                  </button>
                  <button 
                    onClick={() => setActiveMessagesTab('notifications')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeMessagesTab === 'notifications' ? '#10b981' : 'transparent',
                      color: activeMessagesTab === 'notifications' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🔔 Notifications{unreadNotificationCount > 0 && ` (${unreadNotificationCount})`}
                  </button>
                </div>

                {/* Chat Section */}
                {activeMessagesTab === 'chat' && (
                <div>
                  {!selectedConversation ? (
                    // Conversation List
                    <div style={{ display: 'grid', gap: '15px' }}>
                      {conversations.length === 0 ? (
                        <div style={{ 
                          padding: '60px 20px', 
                          textAlign: 'center', 
                          backgroundColor: 'white',
                          borderRadius: '15px',
                          border: '2px dashed #e5e7eb'
                        }}>
                          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💬</div>
                          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No conversations yet</h3>
                          <p style={{ color: '#6b7280', margin: 0 }}>Start connecting with players to begin chatting!</p>
                        </div>
                      ) : (
                        conversations.map(conversation => (
                          <div 
                            key={conversation.id} 
                            onClick={() => {
                              setSelectedConversation(conversation.id);
                              setConversations(prev => prev.map(conv => 
                                conv.id === conversation.id ? {...conv, unread: 0} : conv
                              ));
                            }}
                            style={{
                              padding: '20px',
                              backgroundColor: 'white',
                              border: '2px solid #e5e7eb',
                              borderRadius: '15px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                              position: 'relative',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                          >
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '16px' 
                            }}>
                              <div style={{ 
                                fontSize: '2.5rem',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: '#f3f4f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {conversation.avatar}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                  <h3 style={{ margin: 0, color: '#1f2937', fontSize: '18px' }}>
                                    {conversation.name}
                                  </h3>
                                  <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                                    {new Date(conversation.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </span>
                                </div>
                                <p style={{ 
                                  margin: 0, 
                                  color: '#6b7280', 
                                  fontSize: '16px',
                                  fontWeight: conversation.unread > 0 ? '600' : 'normal'
                                }}>
                                  {conversation.lastMessage}
                                </p>
                              </div>
                              {conversation.unread > 0 && (
                                <div style={{
                                  position: 'absolute',
                                  top: '16px',
                                  right: '16px',
                                  width: '20px',
                                  height: '20px',
                                  backgroundColor: '#ef4444',
                                  borderRadius: '50%',
                                  color: 'white',
                                  fontSize: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontWeight: 'bold'
                                }}>
                                  {conversation.unread}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    // Individual Chat View
                    <div style={{ 
                      backgroundColor: 'white',
                      borderRadius: '15px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      height: '500px',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {/* Chat Header */}
                      <div style={{ 
                        padding: '20px',
                        borderBottom: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}>
                        <button
                          onClick={() => setSelectedConversation(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          ← Back
                        </button>
                        <div style={{ 
                          fontSize: '2rem',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {conversations.find(c => c.id === selectedConversation)?.avatar}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, color: '#1f2937' }}>
                            {conversations.find(c => c.id === selectedConversation)?.name}
                          </h3>
                          <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>
                            Active now
                          </p>
                        </div>
                      </div>
                      
                      {/* Messages */}
                      <div style={{ 
                        flex: 1,
                        overflowY: 'auto',
                        padding: '20px',
                        backgroundColor: '#f9fafb'
                      }}>
                        {(chatMessages[selectedConversation] || []).map(message => (
                          <div 
                            key={message.id}
                            style={{
                              display: 'flex',
                              justifyContent: message.isMe ? 'flex-end' : 'flex-start',
                              marginBottom: '16px'
                            }}
                          >
                            <div style={{
                              maxWidth: '70%',
                              padding: '12px 16px',
                              borderRadius: '18px',
                              backgroundColor: message.isMe ? '#10b981' : 'white',
                              color: message.isMe ? 'white' : '#1f2937',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                              position: 'relative'
                            }}>
                              <p style={{ margin: 0, lineHeight: '1.4' }}>
                                {message.message}
                              </p>
                              <p style={{ 
                                margin: '4px 0 0 0', 
                                fontSize: '11px',
                                opacity: 0.7
                              }}>
                                {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Message Input */}
                      <div style={{ 
                        padding: '20px',
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: 'white'
                      }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                          <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message..."
                            style={{
                              flex: 1,
                              padding: '12px 16px',
                              border: '2px solid #d1d5db',
                              borderRadius: '25px',
                              fontSize: '16px',
                              outline: 'none',
                              backgroundColor: 'white',
                              color: '#1f2937',
                              transition: 'border-color 0.2s ease'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#10b981'}
                            onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                          />
                          <button
                            onClick={sendMessage}
                            style={{
                              padding: '12px 24px',
                              backgroundColor: 'white',
                              color: newMessage.trim() ? '#374151' : '#9ca3af',
                              border: '2px solid #d1d5db',
                              borderRadius: '25px',
                              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                              fontSize: '16px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease'
                            }}
                            disabled={!newMessage.trim()}
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Notifications Section */}
                {activeMessagesTab === 'notifications' && (
                <div>
                  {/* Mark All Read Button */}
                  {unreadNotificationCount > 0 && (
                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                      <button
                        onClick={() => setNotifications(prev => prev.map(n => ({...n, read: true})))}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        Mark All Read
                      </button>
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {notifications.length === 0 ? (
                    <div style={{ 
                      padding: '60px 20px', 
                      textAlign: 'center', 
                      backgroundColor: 'white',
                      borderRadius: '15px',
                      border: '2px dashed #e5e7eb'
                    }}>
                      <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔔</div>
                      <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No notifications yet</h3>
                      <p style={{ color: '#6b7280', margin: 0 }}>You'll see notifications here when you have game updates, messages, and more!</p>
                    </div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        onClick={() => markNotificationAsRead(notification.id)}
                        style={{
                          padding: '24px',
                          backgroundColor: notification.type === 'acceptance' && !notification.read ? '#dcfce7' : notification.read ? 'white' : '#f0f9ff',
                          border: notification.type === 'acceptance' && !notification.read ? '2px solid #10b981' : notification.read ? '1px solid #e5e7eb' : '2px solid #3b82f6',
                          borderRadius: '15px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          position: 'relative',
                          cursor: notification.read ? 'default' : 'pointer',
                          transition: 'all 0.2s ease',
                          opacity: notification.read ? 0.7 : 1
                        }}
                        onMouseEnter={(e) => !notification.read && (e.target.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => !notification.read && (e.target.style.transform = 'translateY(0px)')}
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '16px' 
                        }}>
                          <span style={{ fontSize: '32px', flexShrink: 0 }}>
                            {notification.type === 'acceptance' ? '🎉' : notification.type === 'message' ? '💬' : 'ℹ️'}
                          </span>
                          <div style={{ flex: 1 }}>
                            {notification.type === 'acceptance' && (
                              <div style={{
                                display: 'inline-block',
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                marginBottom: '8px'
                              }}>
                                🎉 ACCEPTED!
                              </div>
                            )}
                            <p style={{ 
                              margin: '0 0 8px 0', 
                              color: '#1f2937',
                              fontSize: '16px',
                              lineHeight: '1.5',
                              fontWeight: notification.read ? 'normal' : '600'
                            }}>
                              {notification.message}
                            </p>
                            <p style={{ 
                              margin: 0, 
                              color: '#6b7280', 
                              fontSize: '14px' 
                            }}>
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div style={{
                              position: 'absolute',
                              top: '16px',
                              right: '16px',
                              width: '12px',
                              height: '12px',
                              backgroundColor: notification.type === 'acceptance' ? '#10b981' : '#3b82f6',
                              borderRadius: '50%'
                            }}></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  </div>
                </div>
                )}
              </div>
            } />
            <Route path="*" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🚧 Coming Soon!</h2>
                <p>This section is under development.</p>
                <p>Click "Players" to see the main section.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
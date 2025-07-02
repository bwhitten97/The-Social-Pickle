import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import './App.css';

const mockPlayers = [
  { id: 1, name: "Alex Johnson", age: 28, skill: "Intermediate", availability: ["Mon", "Tue", "Wed"], gender: "Male" },
  { id: 2, name: "Sarah Chen", age: 32, skill: "Advanced", availability: ["Mon", "Wed", "Fri"], gender: "Female" },
  { id: 3, name: "Mike Rodriguez", age: 25, skill: "Beginner", availability: ["Sat", "Sun"], gender: "Male" },
  { id: 4, name: "Emma Wilson", age: 29, skill: "Intermediate", availability: ["Tue", "Thu", "Sat"], gender: "Female" },
  { id: 5, name: "David Kim", age: 35, skill: "Advanced", availability: ["Mon", "Tue", "Thu", "Fri"], gender: "Male" }
];

function App() {
  const [players, setPlayers] = useState(mockPlayers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [connections, setConnections] = useState([]);
  const [showMessage, setShowMessage] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [gameApplicants, setGameApplicants] = useState({
    1: [
      { id: 101, name: "Emma Wilson", skill: "Intermediate", message: "I'd love to join your morning doubles!", status: "pending" },
      { id: 102, name: "David Kim", skill: "Advanced", message: "Looking for a good game!", status: "pending" }
    ],
    2: [
      { id: 103, name: "Sarah Chen", skill: "Advanced", message: "Perfect timing for me!", status: "pending" }
    ]
  });
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [acceptedPlayers, setAcceptedPlayers] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Welcome to The Social Pickle! 🏓", type: "info", read: false, timestamp: new Date().toISOString() },
    { 
      id: 2, 
      message: "You've been accepted to join \"Weekend Warriors\"! Game starts at 10:00 AM on Dec 18, 2024 at Outdoor Courts.", 
      type: "acceptance", 
      read: false, 
      timestamp: new Date(Date.now() - 300000).toISOString(),
      hostName: "Emma Wilson",
      gameTitle: "Weekend Warriors",
      hasAction: true
    },
    { id: 3, message: "💬 New message from Sarah Chen: \"Looking forward to our game tomorrow!\"", type: "message", read: false, timestamp: new Date(Date.now() - 600000).toISOString() }
  ]);
  
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: "Emma Wilson",
      lastMessage: "Great to have you on the team! Looking forward to playing together!",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      unread: 1,
      avatar: "👩‍🦰"
    },
    {
      id: 2,
      name: "Sarah Chen", 
      lastMessage: "Looking forward to our game tomorrow!",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      unread: 0,
      avatar: "👩‍🦱"
    },
    {
      id: 3,
      name: "Mike Rodriguez",
      lastMessage: "Thanks for the match! Great game.",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      unread: 0,
      avatar: "👨‍🦲"
    }
  ]);
  
  const [chatMessages, setChatMessages] = useState({
    1: [
      { id: 1, sender: "Emma Wilson", message: "Great to have you on the team! Looking forward to playing together!", timestamp: new Date(Date.now() - 600000).toISOString(), isMe: false },
      { id: 2, sender: "You", message: "Thanks! I'm excited to play. What time should I arrive?", timestamp: new Date(Date.now() - 300000).toISOString(), isMe: true }
    ],
    2: [
      { id: 1, sender: "Sarah Chen", message: "Looking forward to our game tomorrow!", timestamp: new Date(Date.now() - 900000).toISOString(), isMe: false },
      { id: 2, sender: "You", message: "Me too! Should I bring anything?", timestamp: new Date(Date.now() - 600000).toISOString(), isMe: true },
      { id: 3, sender: "Sarah Chen", message: "Just your paddle and some water. I'll bring the balls!", timestamp: new Date(Date.now() - 300000).toISOString(), isMe: false }
    ],
    3: [
      { id: 1, sender: "Mike Rodriguez", message: "Thanks for the match! Great game.", timestamp: new Date(Date.now() - 1200000).toISOString(), isMe: false },
      { id: 2, sender: "You", message: "You too! Let's play again soon.", timestamp: new Date(Date.now() - 900000).toISOString(), isMe: true }
    ]
  });
  
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  // Online status tracking
  const [userActivity, setUserActivity] = useState({
    isActive: true,
    lastSeen: new Date().toISOString()
  });
  
  const [onlineUsers, setOnlineUsers] = useState({
    "Emma Wilson": { isOnline: true, lastSeen: new Date().toISOString() },
    "Sarah Chen": { isOnline: true, lastSeen: new Date(Date.now() - 300000).toISOString() }, // 5 min ago
    "Mike Rodriguez": { isOnline: false, lastSeen: new Date(Date.now() - 1800000).toISOString() } // 30 min ago
  });
  const [activeGameTab, setActiveGameTab] = useState('find-game');
  
  // Post Game Form State
  const [showPostGameForm, setShowPostGameForm] = useState(false);
  const [gameForm, setGameForm] = useState({
    date: '',
    time: '',
    location: '',
    maxPlayers: '4',
    skill: 'All',
    description: ''
  });
  const [myPostedGames, setMyPostedGames] = useState([
    { id: 1, title: "Morning Doubles", date: "Dec 15, 2024", time: "9:00 AM", players: "2/4", location: "Central Park Courts", maxPlayers: 4, skill: "All", description: "Casual morning doubles match" },
    { id: 2, title: "Evening Singles", date: "Dec 16, 2024", time: "6:00 PM", players: "1/2", location: "Riverside Recreation", maxPlayers: 2, skill: "Intermediate", description: "Singles practice session" }
  ]);

  // Activity tracking using browser APIs
  useEffect(() => {
    const updateActivity = () => {
      setUserActivity({
        isActive: true,
        lastSeen: new Date().toISOString()
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setUserActivity(prev => ({
          ...prev,
          isActive: false
        }));
      } else {
        updateActivity();
      }
    };

    // Track user interactions
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    // Track tab visibility
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Simulate realistic online/offline patterns for other users
    const simulateUserActivity = () => {
      setOnlineUsers(prevUsers => {
        const updated = { ...prevUsers };
        Object.keys(updated).forEach(username => {
          const user = updated[username];
          const timeSinceLastSeen = Date.now() - new Date(user.lastSeen).getTime();
          
          // Randomly update online status based on realistic patterns
          if (user.isOnline) {
            // 5% chance of going offline each minute if online for > 10 minutes
            if (timeSinceLastSeen > 600000 && Math.random() < 0.05) {
              user.isOnline = false;
            } else if (Math.random() < 0.3) {
              // 30% chance of updating last seen
              user.lastSeen = new Date().toISOString();
            }
          } else {
            // 10% chance of coming online if offline for > 5 minutes
            if (timeSinceLastSeen > 300000 && Math.random() < 0.1) {
              user.isOnline = true;
              user.lastSeen = new Date().toISOString();
            }
          }
        });
        return updated;
      });
    };

    const activityInterval = setInterval(simulateUserActivity, 30000); // Check every 30 seconds
    
    // Force re-render every minute to update "last seen" text
    const updateInterval = setInterval(() => {
      setUserActivity(prev => ({ ...prev })); // Trigger re-render
    }, 60000);

    return () => {
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(activityInterval);
      clearInterval(updateInterval);
    };
  }, []);

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
    setShowMessage('Players reset! 🔄');
    setTimeout(() => setShowMessage(''), 2000);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const messageObj = {
      id: Date.now(),
      sender: "You",
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isMe: true
    };
    
    // Add message to chat
    setChatMessages(prev => ({
      ...prev,
      [selectedConversation]: [...(prev[selectedConversation] || []), messageObj]
    }));
    
    // Update conversation last message
    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: newMessage.trim(), timestamp: new Date().toISOString() }
        : conv
    ));
    
    setNewMessage('');
    
    // Simulate response after 2 seconds
    setTimeout(() => {
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation) {
        const responses = [
          "Sounds good! 👍",
          "Perfect, see you there!",
          "Great, looking forward to it!",
          "Thanks for the message!",
          "Awesome, can't wait! 🏓"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const responseObj = {
          id: Date.now() + 1,
          sender: conversation.name,
          message: randomResponse,
          timestamp: new Date().toISOString(),
          isMe: false
        };
        
        setChatMessages(prev => ({
          ...prev,
          [selectedConversation]: [...(prev[selectedConversation] || []), responseObj]
        }));
        
        setConversations(prev => prev.map(conv => 
          conv.id === selectedConversation 
            ? { ...conv, lastMessage: randomResponse, timestamp: new Date().toISOString(), unread: conv.unread + 1 }
            : conv
        ));
      }
    }, 2000);
  };

  // Utility functions for online status
  const getLastSeenText = (lastSeen) => {
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Active now";
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Last seen ${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `Last seen ${diffInDays}d ago`;
  };

  const getUserStatus = (username) => {
    const user = onlineUsers[username];
    if (!user) return { isOnline: false, lastSeenText: "Unknown" };
    
    return {
      isOnline: user.isOnline,
      lastSeenText: user.isOnline ? "Active now" : getLastSeenText(user.lastSeen)
    };
  };

  // Post Game Form Handlers
  const handleGameFormChange = (field, value) => {
    setGameForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostGame = () => {
    if (!gameForm.date || !gameForm.time || !gameForm.location) {
      alert('Please fill in all required fields');
      return;
    }

    // Simple 12-hour time format
    const [hours, minutes] = gameForm.time.split(':');
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const timeFormatted = `${hour12}:${minutes} ${ampm}`;
    
    const title = `${timeFormatted} at ${gameForm.location}`;

    const newGame = {
      id: Date.now(),
      ...gameForm,
      title,
      players: `1/${gameForm.maxPlayers}`,
      host: 'You'
    };

    // Add to my posted games
    setMyPostedGames(prev => [...prev, newGame]);
    
    // Reset form and close modal
    setGameForm({
      title: '',
      date: '',
      time: '',
      location: '',
      maxPlayers: '4',
      skill: 'All',
      description: ''
    });
    setShowPostGameForm(false);
    
    // Show success message and switch to My Games tab
    alert('🎉 Game posted successfully!');
    setActiveGameTab('my-games');
  };

  const resetGameForm = () => {
    setGameForm({
      date: '',
      time: '',
      location: '',
      maxPlayers: '4',
      skill: 'All',
      description: ''
    });
    setShowPostGameForm(false);
  };

  return (
    <Router>
      <div className="App">
        <Navigation 
          unreadNotificationCount={notifications.filter(n => !n.read).length}
          unreadChatCount={conversations.reduce((total, conv) => total + conv.unread, 0)}
        />
        

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/matches" replace />} />
            <Route path="/matches" element={
              <div style={{ padding: '20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h1>🏓 Discover Players</h1>
                  <p>Swipe to connect with pickleball players in your area</p>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ backgroundColor: '#10b981', color: 'white', padding: '5px 15px', borderRadius: '20px', marginRight: '10px' }}>
                      💚 {connections.length} matches
                    </span>
                                          <button onClick={resetFeed} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #ccc', backgroundColor: '#f3f4f6' }}>
                        🔄 Reset Players
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

                <div style={{ maxWidth: '380px', margin: '0 auto', textAlign: 'center' }}>
                  {currentPlayer ? (
                    <div style={{ 
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                      border: 'none'
                    }}>
                      {/* Profile Image Placeholder */}
                      <div style={{
                        width: '100%',
                        height: '320px',
                        backgroundColor: '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px',
                        color: '#9ca3af'
                      }}>
                        👤
                      </div>
                      
                      {/* Profile Info */}
                      <div style={{ padding: '24px' }}>
                        {/* Name and Age */}
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'baseline',
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '16px'
                        }}>
                          <h2 style={{ 
                            margin: 0, 
                            fontSize: '28px', 
                            fontWeight: '600',
                            color: '#1f2937'
                          }}>
                            {currentPlayer.name}
                          </h2>
                          <span style={{ 
                            fontSize: '28px', 
                            color: '#6b7280',
                            fontWeight: '400'
                          }}>
                            {currentPlayer.age}
                          </span>
                        </div>
                        
                        {/* Tags */}
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '24px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ 
                            backgroundColor: currentPlayer.gender === 'Female' ? '#ec4899' : '#3b82f6',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {currentPlayer.gender}
                          </span>
                          <span style={{ 
                            backgroundColor: currentPlayer.skill === 'Advanced' ? '#ef4444' : currentPlayer.skill === 'Intermediate' ? '#f59e0b' : '#10b981',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            {currentPlayer.skill}
                          </span>
                          <span style={{ 
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: '500'
                          }}>
                            Available
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center',
                        gap: '40px',
                        paddingBottom: '32px'
                      }}>
                        <button 
                          onClick={handlePass}
                          style={{ 
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            border: '2px solid #ef4444',
                            backgroundColor: 'white',
                            color: '#ef4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ✕
                        </button>
                        <button 
                          onClick={handleConnect}
                          style={{ 
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            border: '2px solid #10b981',
                            backgroundColor: '#10b981',
                            color: 'white',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          ✓
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
                        🔄 Reset Players
                      </button>
                    </div>
                  )}
                </div>
              </div>
            } />
            <Route path="/matched-players" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🤝 Your Matches</h2>
                {connections.length === 0 ? (
                  <p>No matches yet. Go to Discover to connect with players!</p>
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
                        <button 
                          onClick={() => {
                            // Create or update conversation with connected player
                            const existingConv = conversations.find(c => c.name === player.name);
                            const playerMessage = `Hey! Looking forward to playing pickleball with you! 🏓`;
                            
                            if (existingConv) {
                              // Add message to existing conversation
                              setChatMessages(prev => ({
                                ...prev,
                                [existingConv.id]: [...(prev[existingConv.id] || []), {
                                  id: Date.now(),
                                  sender: player.name,
                                  message: playerMessage,
                                  timestamp: new Date().toISOString(),
                                  isMe: false
                                }]
                              }));
                              
                              setConversations(prev => prev.map(conv => 
                                conv.id === existingConv.id 
                                  ? { ...conv, lastMessage: playerMessage, timestamp: new Date().toISOString(), unread: conv.unread + 1 }
                                  : conv
                              ));
                            } else {
                              // Create new conversation
                              const newConvId = Date.now();
                              const newConv = {
                                id: newConvId,
                                name: player.name,
                                lastMessage: playerMessage,
                                timestamp: new Date().toISOString(),
                                unread: 1,
                                avatar: player.name.includes('Emma') ? '👩‍🦰' : player.name.includes('Sarah') ? '👩‍🦱' : '👨‍🦲'
                              };
                              
                              setConversations(prev => [newConv, ...prev]);
                              setChatMessages(prev => ({
                                ...prev,
                                [newConvId]: [{
                                  id: Date.now(),
                                  sender: player.name,
                                  message: playerMessage,
                                  timestamp: new Date().toISOString(),
                                  isMe: false
                                }]
                              }));
                            }
                            
                            alert(`Started conversation with ${player.name}! Check the Chat tab to continue.`);
                          }}
                          style={{ 
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
              <div style={{ padding: '20px' }}>
                {/* Games Header */}
                <header style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '30px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <h1 style={{ margin: 0, color: '#374151' }}>🏓 Games</h1>
                  <button 
                    onClick={() => setShowPostGameForm(true)}
                    style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    + Post a Game
                  </button>
                </header>

                {/* Tab Navigation */}
                <div style={{ 
                  display: 'flex', 
                  gap: '5px', 
                  marginBottom: '30px',
                  backgroundColor: '#f3f4f6',
                  padding: '5px',
                  borderRadius: '12px',
                  maxWidth: '600px'
                }}>
                  <button 
                    onClick={() => setActiveGameTab('find-game')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeGameTab === 'find-game' ? '#10b981' : 'transparent',
                      color: activeGameTab === 'find-game' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Find a Game
                  </button>
                  <button 
                    onClick={() => setActiveGameTab('my-games')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeGameTab === 'my-games' ? '#10b981' : 'transparent',
                      color: activeGameTab === 'my-games' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    My Games
                  </button>
                  <button 
                    onClick={() => setActiveGameTab('pending-requests')}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px',
                      backgroundColor: activeGameTab === 'pending-requests' ? '#10b981' : 'transparent',
                      color: activeGameTab === 'pending-requests' ? 'white' : '#6b7280',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {pendingRequests.length > 0 ? `Pending Requests (${pendingRequests.length})` : 'Pending Requests'}
                  </button>
                </div>

                {/* Find a Game Section */}
                {activeGameTab === 'find-game' && (
                <section>
                  <h2 style={{ color: '#374151', marginBottom: '20px' }}>Find a Game</h2>
                  <div style={{ display: 'grid', gap: '15px', maxWidth: '800px' }}>
                    {[
                      { id: 3, title: "Advanced Doubles", date: "Dec 17, 2024", time: "7:00 AM", players: "3/4", location: "Tennis Club", host: "Sarah Chen", skill: "Advanced" },
                      { id: 4, title: "Beginner Friendly", date: "Dec 17, 2024", time: "2:00 PM", players: "1/4", location: "Community Center", host: "Mike Rodriguez", skill: "Beginner" },
                      { id: 5, title: "Weekend Warriors", date: "Dec 18, 2024", time: "10:00 AM", players: "2/4", location: "Outdoor Courts", host: "Emma Wilson", skill: "Intermediate" }
                    ].map(game => (
                      <div key={game.id} style={{
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        padding: '20px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
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
                                fontSize: '12px'
                              }}>
                                {game.skill}
                              </span>
                              <span style={{ color: '#6b7280' }}>👥 {game.players} players</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setPendingRequests(prev => [...prev, game]);
                              // Add immediate notification for testing
                              setNotifications(prev => [...prev, {
                                id: Date.now(),
                                message: `You've been accepted to join "${game.title}"! Game starts at ${game.time} on ${game.date} at ${game.location}.`,
                                type: 'acceptance',
                                read: false,
                                timestamp: new Date().toISOString(),
                                hostName: game.host,
                                gameTitle: game.title,
                                hasAction: true
                              }]);
                              alert('Request sent! Check your notifications 🔔');
                              
                              // Also simulate receiving an application notification (if it's one of your games)
                              if (game.host === 'You') {
                                setNotifications(prev => [...prev, {
                                  id: Date.now() + 1,
                                  message: `📩 New application! Someone wants to join your "${game.title}" game. Check your Games tab to review the request.`,
                                  type: 'message',
                                  read: false,
                                  timestamp: new Date().toISOString()
                                }]);
                              }
                            }}
                            style={{
                            padding: '8px 16px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}>
                            Request to Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                )}

                {/* My Games Section */}
                {activeGameTab === 'my-games' && (
                <section style={{ marginBottom: '40px' }}>
                  <h2 style={{ color: '#374151', marginBottom: '20px' }}>My Games</h2>
                  <div style={{ display: 'grid', gap: '15px', maxWidth: '800px' }}>
                    {myPostedGames.map(game => (
                      <div key={game.id} style={{
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        padding: '20px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{game.title}</h3>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📅 {game.date} at {game.time}</p>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📍 {game.location}</p>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                              <span style={{ 
                                backgroundColor: game.skill === 'Advanced' ? '#ef4444' : game.skill === 'Intermediate' ? '#f59e0b' : game.skill === 'All' ? '#6366f1' : '#10b981',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '15px',
                                fontSize: '12px'
                              }}>
                                {game.skill === 'All' ? 'All Levels' : game.skill}
                              </span>
                              <span style={{ color: '#6b7280' }}>👥 {game.players} players</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              setSelectedGameId(game.id);
                              setShowApplicantsModal(true);
                            }}
                            style={{
                            padding: '8px 16px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}>
                            View Applicants {gameApplicants[game.id]?.length > 0 && `(${gameApplicants[game.id].length})`}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                )}

                {/* My Pending Requests Section */}
                {activeGameTab === 'pending-requests' && (
                <section style={{ marginBottom: '40px' }}>
                  <h2 style={{ color: '#374151', marginBottom: '20px' }}>My Pending Requests</h2>
                  {pendingRequests.length === 0 ? (
                    <div style={{ 
                      padding: '30px', 
                      textAlign: 'center', 
                      border: '2px dashed #e5e7eb', 
                      borderRadius: '15px', 
                      backgroundColor: '#f9fafb',
                      color: '#6b7280'
                    }}>
                      No pending requests yet. Request to join games below!
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gap: '15px', maxWidth: '800px' }}>
                      {pendingRequests.map(game => (
                        <div key={game.id} style={{
                          border: '2px solid #f59e0b',
                          borderRadius: '15px',
                          padding: '20px',
                          backgroundColor: '#fffbeb',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          <div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{game.title}</h3>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>🏓 Hosted by {game.host}</p>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📅 {game.date} at {game.time}</p>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📍 {game.location}</p>
                            <span style={{ 
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '15px',
                              fontSize: '12px'
                            }}>
                              ⏳ Pending
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                )}

                {/* Applicants Modal */}
                {showApplicantsModal && selectedGameId && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '30px',
                      borderRadius: '20px',
                      maxWidth: '500px',
                      width: '90%',
                      maxHeight: '80vh',
                      overflow: 'auto',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: '#1f2937' }}>Game Applicants</h2>
                        <button 
                          onClick={() => setShowApplicantsModal(false)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '24px',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                        >×</button>
                      </div>
                      
                      {gameApplicants[selectedGameId]?.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>
                          No applicants yet for this game.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gap: '15px' }}>
                          {gameApplicants[selectedGameId]?.map(applicant => (
                            <div key={applicant.id} style={{
                              border: applicant.status === 'accepted' ? '2px solid #10b981' : applicant.status === 'denied' ? '2px solid #ef4444' : '2px solid #e5e7eb',
                              borderRadius: '12px',
                              padding: '15px',
                              backgroundColor: applicant.status === 'accepted' ? '#dcfce7' : applicant.status === 'denied' ? '#fee2e2' : 'white'
                            }}>
                              <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>🏓 {applicant.name}</h4>
                              <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                                <strong>Skill:</strong> {applicant.skill}
                              </p>
                              <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                                <strong>Message:</strong> "{applicant.message}"
                              </p>
                              
                              {applicant.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                  <button 
                                    onClick={() => {
                                      setGameApplicants(prev => ({
                                        ...prev,
                                        [selectedGameId]: prev[selectedGameId].map(app => 
                                          app.id === applicant.id ? {...app, status: 'accepted'} : app
                                        )
                                      }));
                                      setAcceptedPlayers(prev => [...prev, applicant]);
                                      // Simulate notification for the applicant
                                      setNotifications(prev => [...prev, {
                                        id: Date.now(),
                                        message: `You've been accepted to join "Morning Doubles"! Game starts at 9:00 AM on Dec 15, 2024 at Central Park Courts.`,
                                        type: 'acceptance',
                                        read: false,
                                        timestamp: new Date().toISOString(),
                                        hostName: "Game Host",
                                        gameTitle: "Morning Doubles",
                                        hasAction: true
                                      }]);
                                    }}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: '#10b981',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '20px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}
                                  >
                                    ✅ Accept
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setGameApplicants(prev => ({
                                        ...prev,
                                        [selectedGameId]: prev[selectedGameId].map(app => 
                                          app.id === applicant.id ? {...app, status: 'denied'} : app
                                        )
                                      }));
                                    }}
                                    style={{
                                      padding: '8px 16px',
                                      backgroundColor: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '20px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}
                                  >
                                    ❌ Deny
                                  </button>
                                </div>
                              )}
                              
                              {applicant.status === 'accepted' && (
                                <div style={{ marginTop: '15px' }}>
                                  <span style={{ 
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '15px',
                                    fontSize: '12px',
                                    marginRight: '10px'
                                  }}>
                                    ✅ Accepted
                                  </span>
                                  <button 
                                    onClick={() => {
                                      // Create or update conversation with accepted player
                                      const existingConv = conversations.find(c => c.name === applicant.name);
                                      const playerMessage = `Thanks for accepting me! Can't wait to play! 🏓`;
                                      
                                      if (existingConv) {
                                        // Add message to existing conversation
                                        setChatMessages(prev => ({
                                          ...prev,
                                          [existingConv.id]: [...(prev[existingConv.id] || []), {
                                            id: Date.now(),
                                            sender: applicant.name,
                                            message: playerMessage,
                                            timestamp: new Date().toISOString(),
                                            isMe: false
                                          }]
                                        }));
                                        
                                        setConversations(prev => prev.map(conv => 
                                          conv.id === existingConv.id 
                                            ? { ...conv, lastMessage: playerMessage, timestamp: new Date().toISOString(), unread: conv.unread + 1 }
                                            : conv
                                        ));
                                      } else {
                                        // Create new conversation
                                        const newConvId = Date.now();
                                        const newConv = {
                                          id: newConvId,
                                          name: applicant.name,
                                          lastMessage: playerMessage,
                                          timestamp: new Date().toISOString(),
                                          unread: 1,
                                          avatar: applicant.name.includes('Emma') ? '👩‍🦰' : applicant.name.includes('Sarah') ? '👩‍🦱' : '👨‍🦲'
                                        };
                                        
                                        setConversations(prev => [newConv, ...prev]);
                                        setChatMessages(prev => ({
                                          ...prev,
                                          [newConvId]: [{
                                            id: Date.now(),
                                            sender: applicant.name,
                                            message: playerMessage,
                                            timestamp: new Date().toISOString(),
                                            isMe: false
                                          }]
                                        }));
                                      }
                                      
                                      alert(`Started conversation with ${applicant.name}! Check the Chat tab to continue.`);
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      backgroundColor: '#6366f1',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '15px',
                                      cursor: 'pointer',
                                      fontSize: '12px'
                                    }}
                                  >
                                    💬 Message
                                  </button>
                                </div>
                              )}
                              
                              {applicant.status === 'denied' && (
                                <span style={{ 
                                  backgroundColor: '#ef4444',
                                  color: 'white',
                                  padding: '4px 12px',
                                  borderRadius: '15px',
                                  fontSize: '12px',
                                  marginTop: '15px',
                                  display: 'inline-block'
                                }}>
                                  ❌ Denied
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            } />
            <Route path="/notifications" element={
              <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h1 style={{ margin: 0, color: '#1f2937', fontSize: '2.5rem' }}>🔔 Notifications</h1>
                  <button 
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({...n, read: true})));
                    }}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}
                  >
                    Mark All Read
                  </button>
                </div>
                
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
                    notifications.slice().reverse().map(notification => (
                      <div key={notification.id} style={{
                        padding: '24px',
                        backgroundColor: notification.type === 'acceptance' && !notification.read ? '#dcfce7' : notification.read ? 'white' : '#f0f9ff',
                        border: notification.type === 'acceptance' && !notification.read ? '2px solid #10b981' : notification.read ? '1px solid #e5e7eb' : '2px solid #3b82f6',
                        borderRadius: '15px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        position: 'relative'
                      }}>
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
                            
                            {/* Action Buttons for Acceptance Notifications */}
                            {notification.type === 'acceptance' && notification.hasAction && (
                              <div style={{ 
                                marginTop: '16px',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center'
                              }}>
                                <span style={{ 
                                  fontSize: '14px', 
                                  color: '#6b7280',
                                  fontWeight: '500'
                                }}>
                                  Host: {notification.hostName}
                                </span>
                                                                 <button 
                                   onClick={() => {
                                     // Create or update conversation
                                     const existingConv = conversations.find(c => c.name === notification.hostName);
                                     const hostMessage = `Great to have you on the team for "${notification.gameTitle}"! Looking forward to playing together! 🏓`;
                                     
                                     if (existingConv) {
                                       // Add message to existing conversation
                                       setChatMessages(prev => ({
                                         ...prev,
                                         [existingConv.id]: [...(prev[existingConv.id] || []), {
                                           id: Date.now(),
                                           sender: notification.hostName,
                                           message: hostMessage,
                                           timestamp: new Date().toISOString(),
                                           isMe: false
                                         }]
                                       }));
                                       
                                       setConversations(prev => prev.map(conv => 
                                         conv.id === existingConv.id 
                                           ? { ...conv, lastMessage: hostMessage, timestamp: new Date().toISOString(), unread: conv.unread + 1 }
                                           : conv
                                       ));
                                     } else {
                                       // Create new conversation
                                       const newConvId = Date.now();
                                       const newConv = {
                                         id: newConvId,
                                         name: notification.hostName,
                                         lastMessage: hostMessage,
                                         timestamp: new Date().toISOString(),
                                         unread: 1,
                                         avatar: notification.hostName.includes('Emma') ? '👩‍🦰' : notification.hostName.includes('Sarah') ? '👩‍🦱' : '👨‍🦲'
                                       };
                                       
                                       setConversations(prev => [newConv, ...prev]);
                                       setChatMessages(prev => ({
                                         ...prev,
                                         [newConvId]: [{
                                           id: Date.now(),
                                           sender: notification.hostName,
                                           message: hostMessage,
                                           timestamp: new Date().toISOString(),
                                           isMe: false
                                         }]
                                       }));
                                     }
                                     
                                     // Mark the notification action as used
                                     setNotifications(prev => prev.map(n => 
                                       n.id === notification.id ? {...n, hasAction: false} : n
                                     ));
                                     
                                     alert(`Started conversation with ${notification.hostName}! Check the Chat tab to continue the conversation.`);
                                   }}
                                  style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}
                                >
                                  💬 Message Host
                                </button>
                              </div>
                            )}
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
            } />
            <Route path="/chat" element={
              <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ 
                  display: 'flex',
                  height: 'calc(100vh - 140px)',
                  backgroundColor: 'white',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {/* Conversation List */}
                  <div style={{ 
                    width: '350px',
                    borderRight: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}>
                    <div style={{ 
                      padding: '20px',
                      borderBottom: '1px solid #e5e7eb',
                      backgroundColor: 'white'
                    }}>
                      <h2 style={{ margin: 0, color: '#1f2937', fontSize: '1.5rem' }}>💬 Chats</h2>
                    </div>
                    
                    <div style={{ overflowY: 'auto', height: 'calc(100% - 80px)' }}>
                      {conversations.map(conversation => (
                        <div 
                          key={conversation.id}
                          onClick={() => {
                            setSelectedConversation(conversation.id);
                            setConversations(prev => prev.map(conv => 
                              conv.id === conversation.id ? {...conv, unread: 0} : conv
                            ));
                          }}
                          style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #f3f4f6',
                            cursor: 'pointer',
                            backgroundColor: selectedConversation === conversation.id ? '#e0f2fe' : 'transparent',
                            borderLeft: selectedConversation === conversation.id ? '4px solid #10b981' : '4px solid transparent',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              fontSize: '2rem',
                              width: '50px',
                              height: '50px',
                              borderRadius: '50%',
                              backgroundColor: '#e5e7eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {conversation.avatar}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <h4 style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
                                    {conversation.name}
                                  </h4>
                                  {(() => {
                                    const status = getUserStatus(conversation.name);
                                    return status.isOnline ? (
                                      <span style={{ 
                                        fontSize: '10px',
                                        color: '#10b981'
                                      }}>
                                        🟢
                                      </span>
                                    ) : null;
                                  })()}
                                </div>
                                {conversation.unread > 0 && (
                                  <span style={{
                                    backgroundColor: '#ef4444',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
                                  }}>
                                    {conversation.unread}
                                  </span>
                                )}
                              </div>
                              <p style={{ 
                                margin: '4px 0 0 0', 
                                color: '#6b7280', 
                                fontSize: '14px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {conversation.lastMessage}
                              </p>
                              <p style={{ 
                                margin: '2px 0 0 0', 
                                color: '#9ca3af', 
                                fontSize: '12px' 
                              }}>
                                {new Date(conversation.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Chat Area */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {selectedConversation ? (
                      <>
                        {/* Chat Header */}
                        <div style={{ 
                          padding: '20px',
                          borderBottom: '1px solid #e5e7eb',
                          backgroundColor: 'white'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                              {(() => {
                                const userName = conversations.find(c => c.id === selectedConversation)?.name;
                                const status = getUserStatus(userName);
                                return (
                                  <p style={{ 
                                    margin: 0, 
                                    color: status.isOnline ? '#10b981' : '#6b7280', 
                                    fontSize: '14px' 
                                  }}>
                                    {status.isOnline ? '🟢' : '⚫'} {status.lastSeenText}
                                  </p>
                                );
                              })()}
                            </div>
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
                      </>
                    ) : (
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9fafb'
                      }}>
                        <div style={{ textAlign: 'center', color: '#6b7280' }}>
                          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💬</div>
                          <h3 style={{ margin: '0 0 8px 0' }}>Select a conversation</h3>
                          <p style={{ margin: 0 }}>Choose a conversation from the left to start chatting</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            } />
            <Route path="*" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🚧 Coming Soon!</h2>
                <p>This section is under development.</p>
                <p>Click "Matches" to see the main section.</p>
              </div>
            } />
          </Routes>
        </main>
        
        {/* Post Game Form Modal */}
        {showPostGameForm && (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}
    onClick={(e) => {
      // Only close if clicking the overlay, not the modal content
      if (e.target === e.currentTarget) {
        setShowPostGameForm(false);
      }
    }}
  >
    <div 
      style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
        position: 'relative',
        zIndex: 1001
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, color: '#1f2937' }}>🏓 Post a Game</h2>
        <button
          onClick={() => setShowPostGameForm(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#6b7280'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ pointerEvents: 'auto' }}>
        {/* Location */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
            Location *
          </label>
          <input
            type="text"
            value={gameForm.location || ''}
            onChange={(e) => {
              console.log('Location changing to:', e.target.value);
              setGameForm(prev => ({ ...prev, location: e.target.value }));
            }}
            placeholder="e.g., Central Park Courts, Tennis Club"
            autoComplete="off"
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              backgroundColor: 'white',
              color: '#1f2937',
              boxSizing: 'border-box',
              pointerEvents: 'auto',
              userSelect: 'text'
            }}
          />
        </div>

        {/* Date and Time */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Date *
            </label>
            <input
              type="date"
              value={gameForm.date || ''}
              onChange={(e) => {
                console.log('Date changing to:', e.target.value);
                setGameForm(prev => ({ ...prev, date: e.target.value }));
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937',
                boxSizing: 'border-box',
                pointerEvents: 'auto'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Time *
            </label>
            <input
              type="time"
              value={gameForm.time || ''}
              onChange={(e) => {
                console.log('Time changing to:', e.target.value);
                setGameForm(prev => ({ ...prev, time: e.target.value }));
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937',
                boxSizing: 'border-box',
                pointerEvents: 'auto'
              }}
            />
          </div>
        </div>

        {/* Max Players and Skill Level */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Max Players
            </label>
            <select
              value={gameForm.maxPlayers || '4'}
              onChange={(e) => {
                console.log('Max players changing to:', e.target.value);
                setGameForm(prev => ({ ...prev, maxPlayers: e.target.value }));
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937',
                cursor: 'pointer',
                boxSizing: 'border-box',
                pointerEvents: 'auto'
              }}
            >
              <option value="2">2 Players</option>
              <option value="4">4 Players</option>
              <option value="6">6 Players</option>
              <option value="8">8 Players</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
              Skill Level
            </label>
            <select
              value={gameForm.skill || 'All'}
              onChange={(e) => {
                console.log('Skill changing to:', e.target.value);
                setGameForm(prev => ({ ...prev, skill: e.target.value }));
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#1f2937',
                cursor: 'pointer',
                boxSizing: 'border-box',
                pointerEvents: 'auto'
              }}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#374151' }}>
            Description (Optional)
          </label>
          <textarea
            value={gameForm.description || ''}
            onChange={(e) => {
              console.log('Description changing to:', e.target.value);
              setGameForm(prev => ({ ...prev, description: e.target.value }));
            }}
            placeholder="Add any additional details about the game..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              resize: 'vertical',
              minHeight: '80px',
              backgroundColor: 'white',
              color: '#1f2937',
              boxSizing: 'border-box',
              pointerEvents: 'auto',
              userSelect: 'text'
            }}
          />
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
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
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('Form data:', gameForm);
              if (!gameForm.date || !gameForm.time || !gameForm.location) {
                alert('Please fill in all required fields');
                return;
              }
              
              const timeFormatted = new Date(`2000-01-01T${gameForm.time}`).toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              const title = `${timeFormatted} at ${gameForm.location}`;

              const newGame = {
                id: Date.now(),
                ...gameForm,
                title,
                players: `1/${gameForm.maxPlayers}`,
                host: 'You'
              };

              setMyPostedGames(prev => [...prev, newGame]);
              
              setGameForm({
                date: '',
                time: '',
                location: '',
                maxPlayers: '4',
                skill: 'All',
                description: ''
              });
              setShowPostGameForm(false);
              
              alert('🎉 Game posted successfully!');
              setActiveGameTab('my-games');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            Post Game
          </button>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </Router>
  )
}

export default App
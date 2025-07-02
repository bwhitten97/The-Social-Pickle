import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import './App.css';

  const mockPlayers = [
  { 
    id: 1, 
    name: "Alex Johnson", 
    age: 28,
    skill: "Intermediate", 
    availability: "Evenings", 
    gender: "Male",
    bio: "Love playing doubles and always looking to improve my game!",
    location: "2.1 miles away",
    avatar: "👨‍🦱",
    experience: "3 years"
  },
  { 
    id: 2, 
    name: "Sarah Chen", 
    age: 32,
    skill: "Advanced", 
    availability: "Mornings", 
    gender: "Female",
    bio: "Former tennis player who discovered pickleball 2 years ago. Competitive but fun!",
    location: "1.8 miles away",
    avatar: "👩‍🦰",
    experience: "2 years"
  },
  { 
    id: 3, 
    name: "Mike Rodriguez", 
    age: 45,
    skill: "Beginner", 
    availability: "Weekends", 
    gender: "Male",
    bio: "New to pickleball but excited to learn and meet new people!",
    location: "0.9 miles away",
    avatar: "👨‍🦲",
    experience: "6 months"
  },
  { 
    id: 4, 
    name: "Emma Wilson", 
    age: 26,
    skill: "Intermediate", 
    availability: "Afternoons", 
    gender: "Female",
    bio: "Weekend warrior looking for consistent playing partners.",
    location: "3.2 miles away",
    avatar: "👩‍🦱",
    experience: "1.5 years"
  },
  { 
    id: 5, 
    name: "David Kim", 
    age: 38,
    skill: "Advanced", 
    availability: "Mornings", 
    gender: "Male",
    bio: "Serious about the game but know how to have fun. Let's play!",
    location: "2.7 miles away",
    avatar: "👨‍💼",
    experience: "4 years"
  }
];

// Host profiles for games (detailed information about game hosts)
const hostProfiles = {
  "Sarah Chen": {
    name: "Sarah Chen",
    age: 32,
    skill: "Advanced",
    experience: "2 years",
    avatar: "👩‍🦰",
    bio: "Former tennis player who discovered pickleball 2 years ago. I love competitive but fun games and believe in good sportsmanship!",
    location: "1.8 miles away",
    playingStyle: "Strategic and competitive",
    availability: "Mornings and weekends",
    gamesHosted: 23,
    preferredFormat: "Doubles and Singles",
    aboutGames: "I like to organize well-structured games with players of similar skill levels. Always bring water and a positive attitude!"
  },
  "Mike Rodriguez": {
    name: "Mike Rodriguez", 
    age: 45,
    skill: "Beginner",
    experience: "6 months",
    avatar: "👨‍🦲",
    bio: "New to pickleball but absolutely loving it! I organize beginner-friendly games and believe everyone should feel welcome.",
    location: "0.9 miles away",
    playingStyle: "Learning and social",
    availability: "Weekends and evenings",
    gamesHosted: 8,
    preferredFormat: "Doubles - easier to learn",
    aboutGames: "My games are perfect for beginners! We focus on having fun, learning, and building confidence. No pressure, just play!"
  },
  "Emma Wilson": {
    name: "Emma Wilson",
    age: 26, 
    skill: "Intermediate",
    experience: "1.5 years",
    avatar: "👩‍🦱",
    bio: "Weekend warrior looking for consistent playing partners. I love the social aspect of pickleball and meeting new people!",
    location: "3.2 miles away", 
    playingStyle: "Casual and social",
    availability: "Afternoons and weekends",
    gamesHosted: 15,
    preferredFormat: "Mixed doubles",
    aboutGames: "I organize fun, relaxed games where everyone can improve together. Great for intermediate players wanting to level up!"
  },
  "Alex Johnson": {
    name: "Alex Johnson",
    age: 28,
    skill: "Intermediate", 
    experience: "3 years",
    avatar: "👨‍🦱",
    bio: "Love playing doubles and always looking to improve my game! I'm passionate about technique and helping others improve too.",
    location: "2.1 miles away",
    playingStyle: "Technical and improvement-focused",
    availability: "Evenings and early mornings", 
    gamesHosted: 19,
    preferredFormat: "Doubles",
    aboutGames: "My games focus on skill development and fun competition. Great for players wanting to take their game to the next level!"
  }
};

function AppContent() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState(mockPlayers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [connections, setConnections] = useState([]);
  const [showMessage, setShowMessage] = useState('');
  const [activeMessagesTab, setActiveMessagesTab] = useState('chat');
  
  // Modern swipe card states
  const [cardAnimation, setCardAnimation] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [swipeDirection, setSwipeDirection] = useState('');
  
  // Host profile viewing states
  const [showHostProfile, setShowHostProfile] = useState(false);
  const [selectedHost, setSelectedHost] = useState(null);
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    name: "Your Name",
    age: 28,
    skill: "Intermediate",
    availability: "Evenings",
    bio: "Write something about your pickleball journey...",
    avatar: "👤",
    experience: "2 years"
  });

  // Match viewing states
  const [showMatchProfile, setShowMatchProfile] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);

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

  // Function to handle viewing host profile
  const handleViewHostProfile = (hostName) => {
    const hostProfile = hostProfiles[hostName];
    if (hostProfile) {
      setSelectedHost(hostProfile);
      setShowHostProfile(true);
    }
  };

  // Function to handle viewing match profile
  const handleViewMatchProfile = (match) => {
    setSelectedMatch(match);
    setShowMatchProfile(true);
  };

  // Function to handle messaging a match
  const handleMessageMatch = (match) => {
    // Check if conversation already exists
    const existingConv = conversations.find(conv => conv.name === match.name);
    
    if (!existingConv) {
      // Create new conversation
      const newConversation = {
        id: Date.now(),
        name: match.name,
        lastMessage: `Hi ${match.name}! Great to connect with you!`,
        timestamp: new Date().toISOString(),
        unread: 0,
        avatar: match.avatar
      };
      
      setConversations(prev => [...prev, newConversation]);
      
      // Add initial message
      setChatMessages(prev => ({
        ...prev,
        [newConversation.id]: [
          {
            id: Date.now(),
            sender: 'You',
            message: `Hi ${match.name}! Great to connect with you!`,
            timestamp: new Date().toISOString(),
            isMe: true
          }
        ]
      }));
    }
    
    // Navigate to messages tab
    navigate('/messages');
    setShowMessage(`💬 Opening chat with ${match.name}!`);
    setTimeout(() => setShowMessage(''), 3000);
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
    setCardAnimation('swipe-left');
    setSwipeDirection('left');
    setShowMessage(`Passed on ${currentPlayer.name}`);
    setTimeout(() => {
      nextPlayer();
      setCardAnimation('');
      setSwipeDirection('');
    }, 300);
  };

  const handleConnect = () => {
    setCardAnimation('swipe-right');
    setSwipeDirection('right');
    setConnections(prev => [...prev, currentPlayer]);
    setShowMessage(`🎉 Connected with ${currentPlayer.name}!`);
    setTimeout(() => {
      nextPlayer();
      setCardAnimation('');
      setSwipeDirection('');
    }, 300);
  };

  // Modern drag handlers for swipe gestures
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setCardOffset({ x: 0, y: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    setCardOffset({ x: deltaX, y: deltaY });
    
    // Set swipe direction based on drag distance
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection('');
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Auto-swipe if dragged far enough
    if (Math.abs(cardOffset.x) > 100) {
      if (cardOffset.x > 0) {
        handleConnect();
      } else {
        handlePass();
      }
    } else {
      // Snap back to center
      setCardOffset({ x: 0, y: 0 });
      setSwipeDirection('');
    }
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
            <Route path="/" element={<Navigate to="/discover" replace />} />
            <Route path="/discover" element={
              <div style={{ 
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px 20px 120px 20px',
                position: 'relative'
              }}>
                {/* Top Navigation Bar */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '20px',
                  padding: '15px 20px'
                }}>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>
                    🏓 Discover
                  </div>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white', 
                      padding: '8px 16px', 
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      💚 {connections.length}
                    </span>
                    <button onClick={resetFeed} style={{ 
                      background: 'rgba(255, 255, 255, 0.2)', 
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px', 
                      borderRadius: '20px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}>
                      🔄
                    </button>
                  </div>
                </div>

                {/* Filter Buttons */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  marginBottom: '30px',
                  flexWrap: 'wrap'
                }}>
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button 
                      key={level}
                      onClick={() => { setFilter(level); setCurrentIndex(0); }}
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: '25px', 
                        border: 'none',
                        background: filter === level 
                          ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' 
                          : 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: filter === level ? 'bold' : 'normal',
                        fontSize: '14px',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                {/* Message Display */}
                {showMessage && (
                  <div style={{ 
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1000,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white',
                    padding: '15px 25px',
                    borderRadius: '25px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                    fontWeight: 'bold',
                    animation: 'slideDown 0.3s ease'
                  }}>
                    {showMessage}
                  </div>
                )}

                {/* Card Stack Container */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  minHeight: '70vh',
                  position: 'relative'
                }}>
                  {currentPlayer ? (
                    <div style={{ position: 'relative', width: '350px', height: '600px' }}>
                      {/* Background Cards (Stack Effect) */}
                      {filteredPlayers.slice(currentIndex + 1, currentIndex + 3).map((player, index) => (
                        <div key={player.id} style={{
                          position: 'absolute',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '25px',
                          zIndex: -index - 1,
                          transform: `scale(${0.95 - index * 0.05}) translateY(${(index + 1) * 10}px)`,
                          opacity: 0.7 - index * 0.2,
                          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)'
                        }} />
                      ))}
                      
                      {/* Main Card */}
                      <div 
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '100%',
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                          borderRadius: '25px',
                          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                          cursor: isDragging ? 'grabbing' : 'grab',
                          transform: `translate(${cardOffset.x}px, ${cardOffset.y}px) rotate(${cardOffset.x * 0.1}deg)`,
                          transition: isDragging ? 'none' : 'all 0.3s ease',
                          zIndex: 10,
                          overflow: 'hidden'
                        }}
                        className={cardAnimation}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        {/* Swipe Direction Indicators */}
                        {swipeDirection && (
                          <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 20,
                            fontSize: '60px',
                            fontWeight: 'bold',
                            color: swipeDirection === 'right' ? '#10b981' : '#ef4444',
                            textShadow: '0 0 20px rgba(0,0,0,0.3)',
                            animation: 'pulse 0.5s infinite'
                          }}>
                            {swipeDirection === 'right' ? '💚' : '❌'}
                          </div>
                        )}

                        {/* Profile Header with Avatar */}
                        <div style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          height: '200px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'white',
                          position: 'relative'
                        }}>
                          <div style={{
                            fontSize: '80px',
                            marginBottom: '10px',
                            textShadow: '0 0 20px rgba(0,0,0,0.3)'
                          }}>
                            {currentPlayer.avatar}
                          </div>
                          <div style={{
                            position: 'absolute',
                            bottom: '15px',
                            right: '20px',
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '5px 12px',
                            borderRadius: '15px',
                            fontSize: '12px',
                            backdropFilter: 'blur(10px)'
                          }}>
                            📍 {currentPlayer.location}
                          </div>
                        </div>

                        {/* Profile Content */}
                        <div style={{ padding: '25px' }}>
                          {/* Name and Age */}
                          <div style={{ marginBottom: '20px' }}>
                            <h2 style={{ 
                              margin: '0 0 5px 0', 
                              fontSize: '28px',
                              fontWeight: 'bold',
                              color: '#1f2937'
                            }}>
                              {currentPlayer.name}, {currentPlayer.age}
                            </h2>
                            <div style={{ 
                              fontSize: '16px', 
                              color: '#6b7280',
                              marginBottom: '15px'
                            }}>
                              🏓 {currentPlayer.experience} experience
                            </div>
                          </div>

                          {/* Skill and Availability Badges */}
                          <div style={{ 
                            display: 'flex', 
                            gap: '10px', 
                            marginBottom: '20px',
                            flexWrap: 'wrap'
                          }}>
                            <span style={{
                              background: currentPlayer.skill === 'Advanced' ? '#dc2626' : 
                                         currentPlayer.skill === 'Intermediate' ? '#ea580c' : '#16a34a',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              {currentPlayer.skill}
                            </span>
                            <span style={{
                              background: '#6366f1',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                              🕐 {currentPlayer.availability}
                            </span>
                          </div>

                          {/* Bio */}
                          <div style={{ marginBottom: '20px' }}>
                            <p style={{ 
                              fontSize: '16px', 
                              lineHeight: '1.5',
                              color: '#374151',
                              margin: 0
                            }}>
                              {currentPlayer.bio}
                            </p>
                          </div>


                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '25px',
                      padding: '50px',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '60px', marginBottom: '20px' }}>🎉</div>
                      <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>No more players!</h3>
                      <p style={{ marginBottom: '25px', opacity: 0.8 }}>You've seen everyone in this category.</p>
                      <button onClick={resetFeed} style={{ 
                        background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px', 
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold'
                      }}>
                        🔄 Reset Feed
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Action Buttons */}
                {currentPlayer && (
                  <div style={{
                    position: 'fixed',
                    bottom: '100px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: '30px',
                    zIndex: 100
                  }}>
                    <button 
                      onClick={handlePass}
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: 'white',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.4)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      ❌
                    </button>
                    
                    <button 
                      onClick={handleConnect}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: 'white',
                        fontSize: '28px',
                        cursor: 'pointer',
                        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                    >
                      💚
                    </button>
                  </div>
                )}

                {/* CSS Animations */}
                <style>
                  {`
                    @keyframes slideDown {
                      from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                      to { transform: translateX(-50%) translateY(0); opacity: 1; }
                    }
                    
                    @keyframes pulse {
                      0%, 100% { transform: translate(-50%, -50%) scale(1); }
                      50% { transform: translate(-50%, -50%) scale(1.1); }
                    }
                    
                    .swipe-left {
                      animation: swipeLeftAnim 0.3s ease-out forwards;
                    }
                    
                    .swipe-right {
                      animation: swipeRightAnim 0.3s ease-out forwards;
                    }
                    
                    @keyframes swipeLeftAnim {
                      to { transform: translateX(-100vw) rotate(-30deg); opacity: 0; }
                    }
                    
                    @keyframes swipeRightAnim {
                      to { transform: translateX(100vw) rotate(30deg); opacity: 0; }
                    }
                  `}
                </style>
              </div>
            } />
            <Route path="/matches" element={
              <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h1 style={{ margin: 0, color: '#1f2937', fontSize: '2.5rem' }}>👥 Your Matches</h1>
                  <span style={{ color: '#6b7280', fontSize: '16px' }}>
                    {connections.length} connection{connections.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {connections.length === 0 ? (
                  <div style={{ 
                    padding: '60px 20px', 
                    textAlign: 'center', 
                    backgroundColor: 'white',
                    borderRadius: '15px',
                    border: '2px dashed #e5e7eb'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏓</div>
                    <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>No matches yet</h3>
                    <p style={{ color: '#6b7280', margin: 0 }}>Start swiping in Discover to connect with players!</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '15px' }}>
                    {connections.map(player => (
                      <div key={player.id} style={{ 
                        border: '2px solid #e5e7eb', 
                        borderRadius: '15px', 
                        padding: '25px', 
                        backgroundColor: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'translateY(0px)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                          {/* Avatar */}
                          <div style={{ 
                            fontSize: '60px',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '3px solid #e5e7eb'
                          }}>
                            {player.avatar}
                          </div>
                          
                          {/* Player Info */}
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '22px' }}>
                              {player.name}, {player.age}
                            </h3>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
                              <span style={{
                                background: player.skill === 'Advanced' ? '#dc2626' : 
                                           player.skill === 'Intermediate' ? '#ea580c' : '#16a34a',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '15px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {player.skill}
                              </span>
                              <span style={{
                                background: '#6366f1',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '15px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                🕐 {player.availability}
                              </span>
                            </div>
                            <p style={{ 
                              margin: '0 0 15px 0', 
                              color: '#6b7280', 
                              fontSize: '14px',
                              lineHeight: '1.5'
                            }}>
                              📍 {player.location} • 🏓 {player.experience} experience
                            </p>
                            {player.bio && (
                              <p style={{ 
                                margin: '0 0 15px 0', 
                                color: '#374151', 
                                fontSize: '14px',
                                lineHeight: '1.4',
                                fontStyle: 'italic'
                              }}>
                                "{player.bio}"
                              </p>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button 
                              onClick={() => handleViewMatchProfile(player)}
                              style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#6366f1', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              👤 View Profile
                            </button>
                            <button 
                              onClick={() => handleMessageMatch(player)}
                              style={{ 
                                padding: '10px 20px', 
                                backgroundColor: '#10b981', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              💬 Message
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Match Profile Modal */}
                {showMatchProfile && selectedMatch && (
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
                    zIndex: 1000,
                    padding: '20px'
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '25px',
                      maxWidth: '450px',
                      width: '100%',
                      maxHeight: '90vh',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                    }}>
                      {/* Close Button */}
                      <button
                        onClick={() => setShowMatchProfile(false)}
                        style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          color: '#374151',
                          fontSize: '20px',
                          cursor: 'pointer',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>

                      {/* Profile Header */}
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        position: 'relative'
                      }}>
                        <div style={{
                          fontSize: '60px',
                          marginBottom: '10px',
                          textShadow: '0 0 20px rgba(0,0,0,0.3)'
                        }}>
                          {selectedMatch.avatar}
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '15px',
                          right: '20px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '5px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          backdropFilter: 'blur(10px)'
                        }}>
                          📍 {selectedMatch.location}
                        </div>
                      </div>

                      {/* Profile Content */}
                      <div style={{ 
                        padding: '25px',
                        maxHeight: 'calc(90vh - 180px)',
                        overflowY: 'auto'
                      }}>
                        {/* Name and Age */}
                        <div style={{ marginBottom: '20px' }}>
                          <h2 style={{ 
                            margin: '0 0 5px 0', 
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}>
                            {selectedMatch.name}, {selectedMatch.age}
                          </h2>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#6b7280',
                            marginBottom: '15px'
                          }}>
                            🏓 {selectedMatch.experience} experience
                          </div>
                        </div>

                        {/* Skill and Availability Badges */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '10px', 
                          marginBottom: '20px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            background: selectedMatch.skill === 'Advanced' ? '#dc2626' : 
                                       selectedMatch.skill === 'Intermediate' ? '#ea580c' : '#16a34a',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {selectedMatch.skill}
                          </span>
                          <span style={{
                            background: '#6366f1',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            🕐 {selectedMatch.availability}
                          </span>
                        </div>

                        {/* Bio */}
                        <div style={{ marginBottom: '25px' }}>
                          <h4 style={{ 
                            fontSize: '14px', 
                            color: '#6b7280', 
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            margin: '0 0 10px 0',
                            fontWeight: 'bold'
                          }}>
                            About {selectedMatch.name.split(' ')[0]}
                          </h4>
                          <p style={{ 
                            fontSize: '16px', 
                            lineHeight: '1.5',
                            color: '#374151',
                            margin: 0
                          }}>
                            {selectedMatch.bio}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => {
                              setShowMatchProfile(false);
                              handleMessageMatch(selectedMatch);
                            }}
                            style={{
                              flex: 1,
                              padding: '12px 20px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              fontWeight: 'bold'
                            }}
                          >
                            💬 Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            } />
            <Route path="/profile" element={
              <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '30px',
                  paddingBottom: '15px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  <h1 style={{ margin: 0, color: '#1f2937', fontSize: '2.5rem' }}>👤 Your Profile</h1>
                </div>

                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e7eb'
                }}>
                  {/* Avatar Section */}
                  <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{
                      fontSize: '80px',
                      width: '120px',
                      height: '120px',
                      borderRadius: '50%',
                      backgroundColor: '#f3f4f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 15px auto',
                      border: '4px solid #e5e7eb'
                    }}>
                      {userProfile.avatar}
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      gap: '10px', 
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      marginTop: '15px'
                    }}>
                      {['👤', '👨', '👩', '🧑‍🦰', '👨‍🦲', '👩‍🦱', '👨‍🦱', '🧑‍🦳'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => setUserProfile({...userProfile, avatar: emoji})}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: userProfile.avatar === emoji ? '3px solid #10b981' : '2px solid #e5e7eb',
                            backgroundColor: 'white',
                            fontSize: '20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Profile Form */}
                  <div style={{ display: 'grid', gap: '20px' }}>
                    {/* Name */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        Name
                      </label>
                      <input
                        type="text"
                        value={userProfile.name}
                        onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          backgroundColor: 'white',
                          color: '#1f2937'
                        }}
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        Age
                      </label>
                      <input
                        type="number"
                        value={userProfile.age}
                        onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value)})}
                        min="18"
                        max="100"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          backgroundColor: 'white',
                          color: '#1f2937'
                        }}
                      />
                    </div>

                    {/* Skill Level */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        Skill Level
                      </label>
                      <select
                        value={userProfile.skill}
                        onChange={(e) => setUserProfile({...userProfile, skill: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          backgroundColor: 'white',
                          color: '#1f2937'
                        }}
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    {/* Experience */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        Experience
                      </label>
                      <select
                        value={userProfile.experience}
                        onChange={(e) => setUserProfile({...userProfile, experience: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          backgroundColor: 'white',
                          color: '#1f2937'
                        }}
                      >
                        <option value="New to pickleball">New to pickleball</option>
                        <option value="6 months">6 months</option>
                        <option value="1 year">1 year</option>
                        <option value="2 years">2 years</option>
                        <option value="3 years">3 years</option>
                        <option value="4+ years">4+ years</option>
                      </select>
                    </div>

                    {/* Availability */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        Availability
                      </label>
                      <select
                        value={userProfile.availability}
                        onChange={(e) => setUserProfile({...userProfile, availability: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: '2px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          outline: 'none',
                          backgroundColor: 'white',
                          color: '#1f2937'
                        }}
                      >
                        <option value="Mornings">Mornings</option>
                        <option value="Afternoons">Afternoons</option>
                        <option value="Evenings">Evenings</option>
                        <option value="Weekends">Weekends</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>

                    {/* Bio */}
                    <div>
                      <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600', 
                        color: '#374151' 
                      }}>
                        Bio
                      </label>
                      <textarea
                        value={userProfile.bio}
                        onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                        rows="4"
                        placeholder="Tell other players about yourself, your playing style, and what you're looking for..."
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
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => {
                        setShowMessage('✅ Profile updated successfully!');
                        setTimeout(() => setShowMessage(''), 3000);
                      }}
                      style={{
                        padding: '15px 30px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '25px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginTop: '10px'
                      }}
                    >
                      💾 Save Profile
                    </button>
                  </div>
                </div>
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
                                
                                {/* Enhanced Host Information */}
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '10px', 
                                  margin: '5px 0',
                                  padding: '8px 0'
                                }}>
                                  <div style={{ fontSize: '24px' }}>{hostProfiles[game.host]?.avatar || '👤'}</div>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ 
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      gap: '8px',
                                      marginBottom: '2px',
                                      flexWrap: 'wrap'
                                    }}>
                                      <span style={{ 
                                        color: '#1f2937', 
                                        fontWeight: '600',
                                        fontSize: '14px'
                                      }}>
                                        🏓 {game.host}
                                      </span>
                                      <span style={{
                                        backgroundColor: hostProfiles[game.host]?.skill === 'Advanced' ? '#dc2626' : 
                                                       hostProfiles[game.host]?.skill === 'Intermediate' ? '#ea580c' : '#16a34a',
                                        color: 'white',
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        fontSize: '10px',
                                        fontWeight: 'bold'
                                      }}>
                                        {hostProfiles[game.host]?.skill}
                                      </span>
                                      <button
                                        onClick={() => handleViewHostProfile(game.host)}
                                        style={{
                                          padding: '4px 12px',
                                          backgroundColor: '#6366f1',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '12px',
                                          cursor: 'pointer',
                                          fontSize: '10px',
                                          fontWeight: '600'
                                        }}
                                      >
                                        View Profile
                                      </button>
                                    </div>
                                    <div style={{ 
                                      fontSize: '12px', 
                                      color: '#6b7280',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '5px'
                                    }}>
                                      🎮 {hostProfiles[game.host]?.gamesHosted} games hosted
                                    </div>
                                  </div>
                                </div>
                                
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
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
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

                {/* Host Profile Modal */}
                {showHostProfile && selectedHost && (
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
                    zIndex: 1000,
                    padding: '20px'
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '25px',
                      maxWidth: '450px',
                      width: '100%',
                      maxHeight: '90vh',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
                    }}>
                      {/* Close Button */}
                      <button
                        onClick={() => setShowHostProfile(false)}
                        style={{
                          position: 'absolute',
                          top: '15px',
                          right: '15px',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: 'rgba(0, 0, 0, 0.1)',
                          color: '#374151',
                          fontSize: '20px',
                          cursor: 'pointer',
                          zIndex: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ×
                      </button>

                      {/* Profile Header */}
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        height: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        position: 'relative'
                      }}>
                        <div style={{
                          fontSize: '60px',
                          marginBottom: '10px',
                          textShadow: '0 0 20px rgba(0,0,0,0.3)'
                        }}>
                          {selectedHost.avatar}
                        </div>
                        <div style={{
                          position: 'absolute',
                          bottom: '15px',
                          right: '20px',
                          background: 'rgba(255, 255, 255, 0.2)',
                          padding: '5px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          backdropFilter: 'blur(10px)'
                        }}>
                          📍 {selectedHost.location}
                        </div>
                      </div>

                      {/* Profile Content */}
                      <div style={{ 
                        padding: '25px',
                        maxHeight: 'calc(90vh - 180px)',
                        overflowY: 'auto'
                      }}>
                        {/* Name and Age */}
                        <div style={{ marginBottom: '20px' }}>
                          <h2 style={{ 
                            margin: '0 0 5px 0', 
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#1f2937'
                          }}>
                            {selectedHost.name}, {selectedHost.age}
                          </h2>
                          <div style={{ 
                            fontSize: '14px', 
                            color: '#6b7280',
                            marginBottom: '15px'
                          }}>
                            🏓 {selectedHost.experience} experience
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          marginBottom: '20px',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            padding: '15px 30px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '15px',
                            border: '1px solid #e2e8f0'
                          }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                              🎮 {selectedHost.gamesHosted}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Games Hosted</div>
                          </div>
                        </div>

                        {/* Skill and Availability Badges */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '10px', 
                          marginBottom: '20px',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            background: selectedHost.skill === 'Advanced' ? '#dc2626' : 
                                       selectedHost.skill === 'Intermediate' ? '#ea580c' : '#16a34a',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {selectedHost.skill}
                          </span>
                          <span style={{
                            background: '#6366f1',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            🕐 {selectedHost.availability}
                          </span>
                        </div>

                        {/* Bio */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ 
                            fontSize: '14px', 
                            color: '#6b7280', 
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            margin: '0 0 10px 0',
                            fontWeight: 'bold'
                          }}>
                            About {selectedHost.name.split(' ')[0]}
                          </h4>
                          <p style={{ 
                            fontSize: '16px', 
                            lineHeight: '1.5',
                            color: '#374151',
                            margin: 0
                          }}>
                            {selectedHost.bio}
                          </p>
                        </div>

                        {/* Playing Style */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ 
                            fontSize: '14px', 
                            color: '#6b7280', 
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            margin: '0 0 10px 0',
                            fontWeight: 'bold'
                          }}>
                            Playing Style
                          </h4>
                          <p style={{ 
                            fontSize: '16px', 
                            color: '#374151',
                            margin: 0
                          }}>
                            {selectedHost.playingStyle} • Prefers {selectedHost.preferredFormat}
                          </p>
                        </div>

                        {/* About Their Games */}
                        <div style={{ marginBottom: '20px' }}>
                          <h4 style={{ 
                            fontSize: '14px', 
                            color: '#6b7280', 
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            margin: '0 0 10px 0',
                            fontWeight: 'bold'
                          }}>
                            About Their Games
                          </h4>
                          <p style={{ 
                            fontSize: '16px', 
                            lineHeight: '1.5',
                            color: '#374151',
                            margin: 0
                          }}>
                            {selectedHost.aboutGames}
                          </p>
                        </div>


                      </div>
                    </div>
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
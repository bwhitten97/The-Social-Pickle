import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './screens/Landing';
import Onboarding from './screens/Onboarding';
import Discover from './screens/Discover';
import Games from './screens/Games';
import Chat from './screens/Chat';
import Matches from './screens/Matches';
import Profile from './screens/Profile';
import Notification from './components/Notification';
import { GameProvider, useGameContext } from './context/GameContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';
import './screens/Profile.css';
import './components/ProtectedRoute.css';

const mockPlayers = [
  { 
    id: 1, 
    name: "Alex Johnson", 
    age: 28,
    skillLevel: "intermediate", 
    duprRating: "3.5",
    playStyle: "both",
    availability: ["weeknights", "weekends"], 
    gender: "male",
    bio: "Love playing doubles and always looking to improve my game!",
    location: "San Francisco, CA",
    distance: "2.1 miles away",
    avatar: "👨‍🦱",
    playingExperience: "3 years",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 2, 
    name: "Sarah Chen", 
    age: 32,
    skillLevel: "advanced", 
    duprRating: "4.8",
    playStyle: "competitive",
    availability: ["mornings", "weekends"], 
    gender: "female",
    bio: "Former tennis player who discovered pickleball 2 years ago. Competitive but fun!",
    location: "Oakland, CA",
    distance: "1.8 miles away",
    avatar: "👩‍🦰",
    playingExperience: "2 years",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b776?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 3, 
    name: "Mike Rodriguez", 
    age: 45,
    skillLevel: "beginner", 
    duprRating: "2.5",
    playStyle: "casual",
    availability: ["weekends", "flexible"], 
    gender: "male",
    bio: "New to pickleball but excited to learn and meet new people!",
    location: "Berkeley, CA",
    distance: "0.9 miles away",
    avatar: "👨‍🦲",
    playingExperience: "6 months",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 4, 
    name: "Emma Wilson", 
    age: 26,
    skillLevel: "intermediate", 
    duprRating: "3.2",
    playStyle: "casual",
    availability: ["afternoons", "weekends"], 
    gender: "female",
    bio: "Weekend warrior looking for consistent playing partners.",
    location: "Alameda, CA",
    distance: "3.2 miles away",
    avatar: "👩‍🦱",
    playingExperience: "1.5 years",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 5, 
    name: "David Kim", 
    age: 38,
    skillLevel: "advanced", 
    duprRating: "5.2",
    playStyle: "competitive",
    availability: ["mornings", "weeknights"], 
    gender: "male",
    bio: "Serious about the game but know how to have fun. Let's play!",
    location: "San Jose, CA",
    distance: "2.7 miles away",
    avatar: "👨‍💼",
    playingExperience: "4 years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 6, 
    name: "Lisa Thompson", 
    age: 29,
    skillLevel: "intermediate", 
    duprRating: "3.8",
    playStyle: "both",
    availability: ["weekends", "flexible"], 
    gender: "female",
    bio: "Just moved to the area and looking for regular playing partners!",
    location: "Palo Alto, CA",
    distance: "1.3 miles away",
    avatar: "👩‍💻",
    playingExperience: "2 years",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 7, 
    name: "James Wilson", 
    age: 52,
    skillLevel: "beginner", 
    duprRating: "2.0",
    playStyle: "casual",
    availability: ["mornings", "afternoons"], 
    gender: "male",
    bio: "Retired and ready to learn something new. Patient and friendly!",
    location: "Fremont, CA",
    distance: "4.1 miles away",
    avatar: "👨‍🦳",
    playingExperience: "3 months",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 8, 
    name: "Maria Garcia", 
    age: 34,
    skillLevel: "advanced", 
    duprRating: "4.5",
    playStyle: "competitive",
    availability: ["weeknights", "weekends"], 
    gender: "female",
    bio: "Former college athlete. Love the competitive spirit of pickleball!",
    location: "Sunnyvale, CA",
    distance: "2.8 miles away",
    avatar: "👩‍🏫",
    playingExperience: "5 years",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 9, 
    name: "Taylor Martinez", 
    age: 27,
    skillLevel: "intermediate", 
    duprRating: "3.3",
    playStyle: "both",
    availability: ["mornings", "weekends", "flexible"], 
    gender: "non-binary",
    bio: "Pickleball enthusiast and software engineer. Always improving my game!",
    location: "Mountain View, CA",
    distance: "1.5 miles away",
    avatar: "🧑‍💻",
    playingExperience: "18 months",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 10, 
    name: "Robert Chang", 
    age: 41,
    skillLevel: "intermediate", 
    duprRating: "3.6",
    playStyle: "casual",
    availability: ["afternoons", "weekends"], 
    gender: "male",
    bio: "Weekend warrior, dad of two. Looking for fun matches and good laughs!",
    location: "Redwood City, CA",
    distance: "3.5 miles away",
    avatar: "👨‍👦‍👦",
    playingExperience: "2.5 years",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 11, 
    name: "Ashley Davis", 
    age: 36,
    skillLevel: "beginner", 
    duprRating: "2.8",
    playStyle: "casual",
    availability: ["mornings", "flexible"], 
    gender: "female",
    bio: "New mom getting back into sports. Patient partners welcome!",
    location: "San Mateo, CA",
    distance: "2.2 miles away",
    avatar: "👩‍🍼",
    playingExperience: "1 year",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 12, 
    name: "Marcus Johnson", 
    age: 24,
    skillLevel: "advanced", 
    duprRating: "4.9",
    playStyle: "competitive",
    availability: ["weeknights", "mornings", "weekends"], 
    gender: "male",
    bio: "Ex-tennis player, now obsessed with pickleball. Tournament ready!",
    location: "Cupertino, CA",
    distance: "4.0 miles away",
    avatar: "🎾",
    playingExperience: "3 years",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&fit=crop&crop=face"
  }
];

function AppContent() {
  const { addMatchedPlayer } = useGameContext();
  const { isAuthenticated, user } = useAuth();
  const [players, setPlayers] = useState(mockPlayers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [connections, setConnections] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(3);
  const [unreadChatCount, setUnreadChatCount] = useState(2);
  const [notification, setNotification] = useState(null);
  const [appNotifications, setAppNotifications] = useState([]);
  // Track players who have already swiped right on the current user
  const [playersWhoLikedUser, setPlayersWhoLikedUser] = useState([1]); // Alex Johnson (id: 1) has already swiped right
  const [userProfile, setUserProfile] = useState({
    name: user?.name || 'John Doe',
    age: user?.age || 30,
    skill: user?.skillLevel || 'Intermediate',
    experience: user?.experience || '2 years',
    availability: user?.availability?.[0] || 'Evenings',
    gender: user?.gender || 'Male',
    bio: user?.bio || 'Love playing pickleball and meeting new people!',
    location: user?.location || 'San Francisco, CA',
    avatar: user?.avatar || '👤'
  });

  const filteredPlayers = players.filter(player => 
    filter === 'All' || player.skillLevel === filter.toLowerCase()
  );

  const currentPlayer = filteredPlayers[currentIndex];

  const addAppNotification = (message, type = "match") => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      isRead: false,
      type
    };
    setAppNotifications(prev => [newNotification, ...prev]);
    setUnreadNotificationCount(prev => prev + 1);
  };

  const showNotification = (message, name, emoji, type = "match") => {
    // Show standalone popup notification
    setNotification({
      message,
      name,
      emoji
    });
    
    // Only add certain notifications to Messages notifications tab
    // Exclude "like" notifications but keep "match" and other types
    if (type !== "like") {
      addAppNotification(`${emoji} ${message} ${name}`, type);
    }
  };

  const handlePass = () => {
    showNotification("You passed on", currentPlayer.name, "👋", "action");
    nextPlayer();
  };

  const handleConnect = () => {
    const playerId = currentPlayer.id;
    const playerHasLikedUser = playersWhoLikedUser.includes(playerId);
    
    setConnections(prev => [...prev, currentPlayer]);
    
    if (playerHasLikedUser) {
      // It's a match! Both users have liked each other
      addMatchedPlayer(currentPlayer); // Add to GameContext matches
      showNotification("It's a match! You and", currentPlayer.name, "🎉", "match");
      // Remove from the "who liked user" list since it's now a match
      setPlayersWhoLikedUser(prev => prev.filter(id => id !== playerId));
    } else {
      // Just a regular like
      showNotification("You liked", currentPlayer.name, "💚", "like");
    }
    
    nextPlayer();
  };

  const nextPlayer = () => {
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredPlayers.length);
    }, 1000);
  };

  const resetFeed = () => {
    setCurrentIndex(0);
    setPlayers(mockPlayers);
    setConnections([]);
    setPlayersWhoLikedUser([1]); // Reset Alex Johnson as having liked the user
    showNotification("Feed reset!", "", "🔄", "system");
  };

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to="/discover" replace /> : <Landing />
        } />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        {/* Protected Routes */}
        <Route path="/discover" element={
          <ProtectedRoute>
            <div className="app-with-nav">
              <Navigation 
                unreadNotificationCount={unreadNotificationCount}
                unreadChatCount={unreadChatCount}
              />
              <main className="main-content">
                <Discover 
                  players={filteredPlayers}
                  currentIndex={currentIndex}
                  connections={connections}
                  onLike={handleConnect}
                  onPass={handlePass}
                  onFilterChange={(newFilter) => {
                    setFilter(newFilter);
                    setCurrentIndex(0);
                  }}
                  currentFilter={filter}
                />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/games" element={
          <ProtectedRoute>
            <div className="app-with-nav">
              <Navigation 
                unreadNotificationCount={unreadNotificationCount}
                unreadChatCount={unreadChatCount}
              />
              <main className="main-content">
                <Games />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/matches" element={
          <ProtectedRoute>
            <div className="app-with-nav">
              <Navigation 
                unreadNotificationCount={unreadNotificationCount}
                unreadChatCount={unreadChatCount}
              />
              <main className="main-content">
                <Matches />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <div className="app-with-nav">
              <Navigation 
                unreadNotificationCount={unreadNotificationCount}
                unreadChatCount={unreadChatCount}
              />
              <main className="main-content">
                <Chat 
                  appNotifications={appNotifications}
                  onUnreadCountsChange={(chatCount, notificationCount) => {
                    setUnreadChatCount(chatCount);
                    setUnreadNotificationCount(notificationCount);
                  }}
                  onNotificationsRead={(readNotifications) => {
                    setAppNotifications(prev => 
                      prev.map(notif => 
                        readNotifications.includes(notif.id) 
                          ? { ...notif, isRead: true }
                          : notif
                      )
                    );
                    setUnreadNotificationCount(prev => prev - readNotifications.length);
                  }}
                />
              </main>
            </div>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <div className="app-with-nav">
              <Navigation 
                unreadNotificationCount={unreadNotificationCount}
                unreadChatCount={unreadChatCount}
              />
              <main className="main-content">
                <Profile />
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>

      {/* Standalone Popup Notification */}
      {notification && (
        <Notification
          message={notification.message}
          name={notification.name}
          emoji={notification.emoji}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <Router>
          <AppContent />
        </Router>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
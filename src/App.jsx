import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './config/firebase';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Landing from './screens/Landing';
import Onboarding from './screens/Onboarding';
import Welcome from './screens/Welcome';
import Discover from './screens/Discover';
import Games from './screens/Games';
import Chat from './screens/Chat';
import Matches from './screens/Matches';
import Profile from './screens/Profile';
import Notification from './components/Notification';
import { GameProvider, useGameContext } from './context/GameContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { logPlayerLiked, logPlayerPassed, logMatchCreated, logPageView } from './utils/analytics';
import { config } from './config/app';
import './App.css';
import './screens/Profile.css';
import './components/ProtectedRoute.css';

// App constants
const INITIAL_UNREAD_NOTIFICATIONS = 0;
const INITIAL_UNREAD_CHATS = 0;
const INITIAL_LIKED_PLAYERS = [1]; // Alex Johnson (id: 1) has already swiped right
const PLAYER_TRANSITION_DELAY = 1000; // ms

// Default user profile values
const DEFAULT_USER_NAME = 'John Doe';
const DEFAULT_USER_AGE = 30;
const DEFAULT_USER_SKILL = 'Intermediate';
const DEFAULT_USER_EXPERIENCE = '2 years';
const DEFAULT_USER_AVAILABILITY = 'Evenings';
const DEFAULT_USER_GENDER = 'Male';
const DEFAULT_USER_BIO = 'Love playing pickleball and meeting new people!';
const DEFAULT_USER_LOCATION = 'San Francisco, CA';
const DEFAULT_USER_AVATAR = '👤';


function AppContent() {
  const location = useLocation();
  const { addMatchedPlayer } = useGameContext();
  const { isAuthenticated, user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [connections, setConnections] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(INITIAL_UNREAD_NOTIFICATIONS);
  const [unreadChatCount, setUnreadChatCount] = useState(INITIAL_UNREAD_CHATS);
  const [notification, setNotification] = useState(null);
  const [appNotifications, setAppNotifications] = useState([]);
  // Track players who have already swiped right on the current user
  const [playersWhoLikedUser, setPlayersWhoLikedUser] = useState(INITIAL_LIKED_PLAYERS);
  const [userProfile, setUserProfile] = useState({
    name: user?.name || DEFAULT_USER_NAME,
    age: user?.age || DEFAULT_USER_AGE,
    skill: user?.skillLevel || DEFAULT_USER_SKILL,
    experience: user?.experience || DEFAULT_USER_EXPERIENCE,
    availability: user?.availability?.[0] || DEFAULT_USER_AVAILABILITY,
    gender: user?.gender || DEFAULT_USER_GENDER,
    bio: user?.bio || DEFAULT_USER_BIO,
    location: user?.location || DEFAULT_USER_LOCATION,
    avatar: user?.avatar || DEFAULT_USER_AVATAR
  });

  // Fetch real users from Firestore
  const fetchUsers = async () => {
    if (!user) {
      setPlayers([]);
      setIsLoadingPlayers(false);
      return;
    }

    try {
      setIsLoadingPlayers(true);
      
      // Query users collection for real users
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const fetchedUsers = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        // Exclude current user from results
        if (doc.id === user.id || doc.id === user.uid) {
          return;
        }
        
        // Location filtering when multi-city is enabled
        if (config.MULTI_CITY_ENABLED && user.location && userData.location) {
          // Only show users in the same location
          if (user.location.zip !== userData.location.zip) {
            return;
          }
        }
        
        // Only include users with at least basic profile info
        if (userData.name) {
          fetchedUsers.push({
            id: doc.id,
            name: userData.name || 'Unknown User',
            age: userData.age || 25,
            skillLevel: userData.skillLevel || 'intermediate',
            duprRating: userData.duprRating || 'unrated',
            playStyle: userData.playStyle || 'casual',
            availability: userData.availability || ['weekends'],
            gender: userData.gender || 'prefer-not-to-say',
            bio: userData.bio || 'New to The Social Pickle!',
            location: userData.location || config.DEFAULT_LOCATION,
            distance: '-- miles away',
            avatar: userData.avatar || '🥒',
            playingExperience: userData.experience || '1+ years',
            image: userData.profilePicture || null
          });
        }
      });
      
      setPlayers(fetchedUsers);
      
    } catch (error) {
      // If error, just show empty state instead of mock data
      setPlayers([]);
    } finally {
      setIsLoadingPlayers(false);
    }
  };

  // Fetch users when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUsers();
    } else {
      setPlayers([]);
      setIsLoadingPlayers(false);
    }
  }, [isAuthenticated, user]);

  // Track page views when route changes
  useEffect(() => {
    if (user && location.pathname) {
      const pageName = location.pathname.substring(1) || 'home';
      logPageView(pageName, user.id);
    }
  }, [location.pathname, user]);

  const filteredPlayers = players.filter(player => 
    filter === 'All' || player.skillLevel === filter.toLowerCase()
  );

  const currentPlayer = filteredPlayers[currentIndex];

  const addAppNotification = (message, type = "match", targetUser = null) => {
    const newNotification = {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }),
      isRead: false,
      type,
      targetUser // Add target user to determine who should see this notification
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
    // Log analytics event
    if (user) {
      logPlayerPassed(user.id, currentPlayer.id, currentPlayer.skillLevel);
    }
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
      // Log analytics for match
      if (user) {
        logMatchCreated(user.id, currentPlayer.id, 'swipe');
      }
    } else {
      // Just a regular like
      showNotification("You liked", currentPlayer.name, "💚", "like");
      // Log analytics for like
      if (user) {
        logPlayerLiked(user.id, currentPlayer.id, currentPlayer.skillLevel);
      }
    }
    
    nextPlayer();
  };

  const nextPlayer = () => {
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredPlayers.length);
    }, PLAYER_TRANSITION_DELAY);
  };

  const resetFeed = () => {
    setCurrentIndex(0);
    setConnections([]);
    setPlayersWhoLikedUser(INITIAL_LIKED_PLAYERS);
    fetchUsers(); // Refetch from Firebase
    showNotification("Feed reset!", "", "🔄", "system");
  };

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          isAuthenticated ? (
            user && user.profileComplete && !user.hasSeenWelcome ? 
              <Navigate to="/welcome" replace /> : 
              <Navigate to="/discover" replace />
          ) : (
            <ErrorBoundary>
              <Landing />
            </ErrorBoundary>
          )
        } />
        <Route path="/onboarding" element={
          <ErrorBoundary>
            <Onboarding />
          </ErrorBoundary>
        } />
        <Route path="/welcome" element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Welcome />
            </ErrorBoundary>
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
                <ErrorBoundary>
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
                    isLoading={isLoadingPlayers}
                  />
                </ErrorBoundary>
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
                <ErrorBoundary showDetails={true}>
                  <Games addAppNotification={addAppNotification} />
                </ErrorBoundary>
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
                <ErrorBoundary showDetails={true}>
                  <Matches />
                </ErrorBoundary>
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
                <ErrorBoundary>
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
                </ErrorBoundary>
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
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
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
    <ErrorBoundary showDetails={process.env.NODE_ENV === 'development'}>
      <AuthProvider>
        <GameProvider>
          <Router>
            <AppContent />
          </Router>
        </GameProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
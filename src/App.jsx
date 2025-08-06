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
import Applicants from './screens/Applicants';
import Chat from './screens/Chat';
import Matches from './screens/Matches';
import Profile from './screens/Profile';
import PhotoUploadDemo from './components/PhotoUploadDemo';
import Notification from './components/Notification';
import { GameProvider, useGameContext } from './context/GameContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { logPlayerLiked, logPlayerPassed, logMatchCreated, logPageView } from './utils/analytics';
import { config } from './config/app';
import { notificationService } from './services/notificationService';
import { createLike, createPass, getUserPasses, getUsersILiked, listenToIncomingLikes } from './services/matchService';
import { discoveryPreferencesService } from './services/discoveryPreferencesService';
import './App.css';
import './screens/Profile.css';
import './components/ProtectedRoute.css';

// App constants
const INITIAL_UNREAD_NOTIFICATIONS = 0;
const INITIAL_UNREAD_CHATS = 0;
const INITIAL_LIKED_PLAYERS = [1]; // Alex Johnson (id: 1) has already swiped right

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
  const { isAuthenticated, user } = useAuth();
  const [players, setPlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);
  const [connections, setConnections] = useState([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(INITIAL_UNREAD_NOTIFICATIONS);
  const [unreadChatCount, setUnreadChatCount] = useState(INITIAL_UNREAD_CHATS);
  const [notification, setNotification] = useState(null);
  const [appNotifications, setAppNotifications] = useState([]);
  const [firebaseNotifications, setFirebaseNotifications] = useState([]);
  // Track players who have already swiped right on the current user
  const [playersWhoLikedUser, setPlayersWhoLikedUser] = useState(INITIAL_LIKED_PLAYERS);
  // Track players the current user has already passed on (loaded from Firebase)
  const [passedUserIds, setPassedUserIds] = useState(new Set());
  const [isLoadingPasses, setIsLoadingPasses] = useState(true);
  // Track players the current user has already liked (loaded from Firebase)
  const [likedUserIds, setLikedUserIds] = useState(new Set());
  const [isLoadingLikes, setIsLoadingLikes] = useState(true);
  // Stable filtered players array to prevent mid-swipe changes
  const [stableFilteredPlayers, setStableFilteredPlayers] = useState([]);
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

  // Fetch users the current user has already passed on
  const fetchPassedUsers = async () => {
    if (!user?.id) {
      setPassedUserIds(new Set());
      setIsLoadingPasses(false);
      return;
    }

    try {
      setIsLoadingPasses(true);
      console.log('🔍 Fetching passed users for:', user.id);
      const passedIds = await getUserPasses(user.id);
      console.log('📋 Loaded passed users:', passedIds);
      setPassedUserIds(new Set(passedIds));
    } catch (error) {
      console.error('💥 Error fetching passed users:', error);
      setPassedUserIds(new Set());
    } finally {
      setIsLoadingPasses(false);
    }
  };

  // Fetch users the current user has already liked
  const fetchLikedUsers = async () => {
    if (!user?.id) {
      setLikedUserIds(new Set());
      setIsLoadingLikes(false);
      return;
    }

    try {
      setIsLoadingLikes(true);
      console.log('🔍 Fetching liked users for:', user.id);
      const likedIds = await getUsersILiked(user.id);
      console.log('💚 Loaded liked users:', likedIds); 
      setLikedUserIds(new Set(likedIds));
    } catch (error) {
      console.error('💥 Error fetching liked users:', error);
      setLikedUserIds(new Set());
    } finally {
      setIsLoadingLikes(false);
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

  // Fetch passed users when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchPassedUsers();
    } else {
      setPassedUserIds(new Set());
      setIsLoadingPasses(false);
    }
  }, [isAuthenticated, user?.id]);

  // Fetch liked users when component mounts or user changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchLikedUsers();
    } else {
      setLikedUserIds(new Set());
      setIsLoadingLikes(false);
    }
  }, [isAuthenticated, user?.id]);

  // Load discovery preferences when user is authenticated
  useEffect(() => {
    const loadPreferences = async () => {
      if (isAuthenticated && user?.id) {
        try {
          const result = await discoveryPreferencesService.getUserPreferences(user.id);
          if (result.success && result.preferences) {
            console.log('✅ Loaded discovery preferences:', result.preferences);
            // Set the loaded preferences
            setFilter(result.preferences.filter || 'All');
            setAdvancedFilters(result.preferences.advancedFilters || null);
            setCurrentIndex(result.preferences.currentIndex || 0);
          }
        } catch (error) {
          console.error('❌ Error loading discovery preferences:', error);
        }
      } else {
        // Reset to defaults when not authenticated
        setFilter('All');
        setAdvancedFilters(null);
        setCurrentIndex(0);
      }
      setIsLoadingPreferences(false);
    };

    loadPreferences();
  }, [isAuthenticated, user?.id]);

  // Save current discovery position when it changes
  useEffect(() => {
    const savePosition = async () => {
      if (isAuthenticated && user?.id && !isLoadingPreferences) {
        try {
          await discoveryPreferencesService.updateCurrentIndex(user.id, currentIndex);
          console.log('✅ Discovery position saved:', currentIndex);
        } catch (error) {
          console.error('❌ Error saving discovery position:', error);
        }
      }
    };

    // Only save position if preferences have been loaded (to avoid overwriting on initial load)
    if (!isLoadingPreferences) {
      savePosition();
    }
  }, [currentIndex, isAuthenticated, user?.id, isLoadingPreferences]);

  // Track page views when route changes
  useEffect(() => {
    if (user && location.pathname) {
      const pageName = location.pathname.substring(1) || 'home';
      logPageView(pageName, user.id);
    }
  }, [location.pathname, user]);

  // Compute filtered players and update stable array when dependencies change
  const computeFilteredPlayers = (playersArray, passedIds, likedIds, currentFilter, advancedFiltersState) => {
    return playersArray.filter(player => {
      // First filter out players that have already been passed on (from Firebase)
      if (passedIds.has(player.id)) {
        return false;
      }
      
      // Also filter out players that have already been liked (from Firebase)
      if (likedIds.has(player.id)) {
        return false;
      }
      
      // Handle basic 'All' filter
      if (currentFilter === 'All') {
        return true;
      }
    
      // Handle Advanced Matching filter
      if (currentFilter === 'Advanced Matching') {
        // If no advanced filters are set yet, show all players
        if (!advancedFiltersState) {
          return true;
        }
        // DUPR Rating filter (strict - only actual DUPR ratings)
        if (advancedFiltersState.duprRange) {
          const playerDupr = parseFloat(player.duprRating);
          const filterMinDupr = parseFloat(advancedFiltersState.duprRange.min);
          const filterMaxDupr = parseFloat(advancedFiltersState.duprRange.max);
          
          // Only include players who have a valid DUPR rating within the specified range
          if (!playerDupr || isNaN(playerDupr) || playerDupr < filterMinDupr || playerDupr > filterMaxDupr) {
            return false;
          }
        }
        
        // Gender filter
        if (advancedFiltersState.gender && advancedFiltersState.gender !== 'any') {
          if (player.gender !== advancedFiltersState.gender) {
            return false;
          }
        }
        
        // Age Range filter
        if (advancedFiltersState.ageRange) {
          const playerAge = parseInt(player.age) || 0;
          if (playerAge < advancedFiltersState.ageRange.min || playerAge > advancedFiltersState.ageRange.max) {
            return false;
          }
        }
        
        // Availability filter
        if (advancedFiltersState.availability && advancedFiltersState.availability.length > 0) {
          const playerAvailability = player.availability || [];
          // Check if player has at least one matching availability
          const hasMatchingAvailability = advancedFiltersState.availability.some(filterAvail => 
            playerAvailability.includes(filterAvail)
          );
          if (!hasMatchingAvailability) {
            return false;
          }
        }
        
        return true;
      }
      
      // Handle other filters (skill level based) - includes corresponding DUPR ratings
      const filterSkillLevel = currentFilter.toLowerCase();
      const playerSkillLevel = player.skillLevel?.toLowerCase() || '';
      const playerDupr = parseFloat(player.duprRating) || 0;
      
      // Define skill level to DUPR mapping
      const skillToDuprMap = {
        'beginner': { min: 2.0, max: 3.0 },
        'intermediate': { min: 3.0, max: 4.5 },
        'advanced': { min: 4.5, max: 6.0 }
      };
      
      // Check if player matches filter either by:
      // 1. Having the exact skill level, OR
      // 2. Having a DUPR rating that corresponds to the skill level
      let matchesSkillFilter = false;
      
      // Check direct skill level match
      if (playerSkillLevel === filterSkillLevel) {
        matchesSkillFilter = true;
      }
      
      // Check DUPR rating mapping to skill level
      if (!matchesSkillFilter && playerDupr > 0 && skillToDuprMap[filterSkillLevel]) {
        const skillDuprRange = skillToDuprMap[filterSkillLevel];
        if (playerDupr >= skillDuprRange.min && playerDupr <= skillDuprRange.max) {
          matchesSkillFilter = true;
        }
      }
      
      return matchesSkillFilter;
    });
  };

  // Update stable filtered players when data loads OR when filters change
  useEffect(() => {
    // Update when players, passes, and likes are loaded AND when filters change
    if (!isLoadingPlayers && !isLoadingPasses && !isLoadingLikes) {
      const newFilteredPlayers = computeFilteredPlayers(players, passedUserIds, likedUserIds, filter, advancedFilters);
      console.log('🔄 Updating stable filtered players:', {
        totalPlayers: players.length,
        passedCount: passedUserIds.size,
        likedCount: likedUserIds.size,
        filteredCount: newFilteredPlayers.length,
        currentIndex,
        filterType: filter,
        hasAdvancedFilters: !!advancedFilters,
        playerNames: newFilteredPlayers.slice(0, 5).map(p => p.name)
      });
      setStableFilteredPlayers(newFilteredPlayers);
    }
  }, [players, passedUserIds, likedUserIds, filter, advancedFilters, isLoadingPlayers, isLoadingPasses, isLoadingLikes]);

  const currentPlayer = stableFilteredPlayers[currentIndex];

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
    // Only include "match" notifications, exclude "like" and "action" (pass) notifications
    if (type === "match") {
      addAppNotification(`${emoji} ${message} ${name}`, type);
    }
  };

  const handlePass = async () => {
    if (!currentPlayer || !user?.id) return;
    
    // Store current player data before switching
    const passedPlayer = { ...currentPlayer };
    const passedPlayerId = passedPlayer.id;
    const passedPlayerName = passedPlayer.name;
    const passedPlayerSkillLevel = passedPlayer.skillLevel;
    
    // Add to local state immediately for smooth UX
    setPassedUserIds(prev => new Set([...prev, passedPlayerId]));
    
    // Remove current player from stable array to prevent recalculation issues
    setStableFilteredPlayers(prev => prev.filter(player => player.id !== passedPlayerId));
    
    console.log('📝 Passed player removed from stable array:', passedPlayerName);
    
    // Don't increment index since we removed the current player from the array
    
    // Handle Firebase operations in background
    try {
      console.log('📝 Creating pass record for:', passedPlayerName, passedPlayerId);
      const passResult = await createPass(user.id, passedPlayerId);
      console.log('✅ Pass result:', passResult);
      
      if (passResult.success) {
        // Log analytics event
        logPlayerPassed(user.id, passedPlayerId, passedPlayerSkillLevel);
        showNotification("You passed on", passedPlayerName, "👋", "action");
      } else {
        console.error('❌ Failed to create pass:', passResult.error);
        // Revert local state if Firebase operation failed
        setPassedUserIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(passedPlayerId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('💥 Error handling pass:', error);
      // Revert local state if there was an error
      setPassedUserIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(passedPlayerId);
        return newSet;
      });
    }
  };

  const handleConnect = async () => {
    if (!currentPlayer) return;
    
    // Store current player data before switching
    const likedPlayer = { ...currentPlayer };
    const playerId = likedPlayer.id;
    const playerName = likedPlayer.name;
    const playerSkillLevel = likedPlayer.skillLevel;
    
    // Add to liked users set so they won't show up again
    setLikedUserIds(prev => new Set([...prev, playerId]));
    
    setConnections(prev => [...prev, likedPlayer]);
    
    // Remove current player from stable array to prevent recalculation issues
    setStableFilteredPlayers(prev => prev.filter(player => player.id !== playerId));
    
    console.log('💚 Liked player removed from stable array:', playerName);
    
    // Don't increment index since we removed the current player from the array
    
    // Handle Firebase operations in background
    if (user) {
      try {
        console.log('💚 Creating like record for:', playerName, playerId);
        const likeResult = await createLike(user.id, playerId);
        console.log('✅ Like result:', likeResult);
        
        if (likeResult.success) {
          if (likeResult.isMatch) {
            // It's a match!
            showNotification("It's a match! You and", playerName, "🎉", "match");
            
            // Create notification for the OTHER user (Person A who swiped first)
            // They need to know that Person B matched with them!
            // NOTE: playerId is the person we just swiped right on, so they should get the notification
            try {
              await notificationService.createNotification({
                userId: playerId, // Send to the person we swiped right on (they swiped first)
                type: 'match',
                title: 'New Match! 🎉',
                message: `It's a match! You and ${user.name || 'someone'} matched!`,
                fromUserId: user.id,
                matchId: likeResult.matchId
              });
              console.log('✅ Match notification sent to user who swiped first:', playerId);
              
              // ALSO create notification for current user (Person B who just completed the match)
              await notificationService.createNotification({
                userId: user.id, // Send to current user too
                type: 'match', 
                title: 'New Match! 🎉',
                message: `It's a match! You and ${playerName} matched!`,
                fromUserId: playerId,
                matchId: likeResult.matchId
              });
              console.log('✅ Match notification sent to current user:', user.id);
            } catch (notifError) {
              console.error('❌ Failed to send match notification:', notifError);
            }
            
            // Log analytics for match
            logMatchCreated(user.id, playerId, 'swipe');
          } else {
            // Just a regular like
            showNotification("You liked", playerName, "💚", "like");
            // Log analytics for like
            logPlayerLiked(user.id, playerId, playerSkillLevel);
          }
        } else {
          console.error('❌ Failed to create like:', likeResult.error);
        }
      } catch (error) {
        console.error('💥 Error handling like:', error);
      }
    }
  };

  const nextPlayer = () => {
    // This function is no longer used since we remove players from array instead of incrementing index
    console.log('⚠️ nextPlayer called but should not be used with new approach');
  };

  const resetFeed = () => {
    setCurrentIndex(0);
    setConnections([]);
    setPlayersWhoLikedUser(INITIAL_LIKED_PLAYERS);
    setPassedUserIds(new Set()); // Clear passed players (local state only - Firebase records remain)
    setLikedUserIds(new Set()); // Clear liked players (local state only - Firebase records remain)
    setStableFilteredPlayers([]); // Clear stable array to trigger recalculation
    fetchUsers(); // Refetch from Firebase
    showNotification("Feed reset!", "", "🔄", "system");
  };

  // Set up Firebase notifications listener
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up Firebase notifications listener for user:', user.id);
    const unsubscribe = notificationService.setupNotificationsListener(
      user.id,
      (firebaseNotifs) => {
        console.log('Firebase notifications received:', firebaseNotifs);
        // Convert Firebase notifications to app notification format
        const convertedNotifs = firebaseNotifs.map(notif => ({
          id: notif.id,
          message: notif.message,
          timestamp: notif.createdAt?.toDate?.()?.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }) || 'Now',
          isRead: notif.read || false,
          type: notif.type || 'notification',
          targetUser: user.id // This notification is for the current user
        }));
        setFirebaseNotifications(convertedNotifs);
      }
    );

    return () => unsubscribe();
  }, [user?.id]);

  // Set up incoming likes listener
  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up incoming likes listener for user:', user.id);
    const unsubscribe = listenToIncomingLikes(user.id, (likes) => {
      // Extract user IDs from likes
      const likerIds = likes.map(like => like.likedBy);
      setPlayersWhoLikedUser(likerIds);
    });

    return () => unsubscribe();
  }, [user?.id]);

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
                    players={stableFilteredPlayers}
                    currentIndex={currentIndex}
                    connections={connections}
                    onLike={handleConnect}
                    onPass={handlePass}
                    onFilterChange={async (newFilter, filters) => {
                      setFilter(newFilter);
                      setAdvancedFilters(filters);
                      setCurrentIndex(0);
                      
                      // Save filter preferences to Firebase
                      if (user?.id) {
                        try {
                          await discoveryPreferencesService.updateFilterPreferences(
                            user.id, 
                            newFilter, 
                            filters
                          );
                          console.log('✅ Filter preferences saved to Firebase');
                        } catch (error) {
                          console.error('❌ Error saving filter preferences:', error);
                        }
                      }
                    }}
                    currentFilter={filter}
                    isLoading={isLoadingPlayers || isLoadingPasses || isLoadingLikes || isLoadingPreferences}
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
        
        <Route path="/applicants/:gameId" element={
          <ProtectedRoute>
            <div className="app-with-nav">
              <Navigation 
                unreadNotificationCount={unreadNotificationCount}
                unreadChatCount={unreadChatCount}
              />
              <main className="main-content">
                <ErrorBoundary>
                  <Applicants />
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
                    appNotifications={[...firebaseNotifications, ...appNotifications]}
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
        
        <Route path="/photo-demo" element={
          <ErrorBoundary>
            <PhotoUploadDemo />
          </ErrorBoundary>
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
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { gameService, applicationService, hasUserAppliedToGame } from '../services/gameService';
import { initializeFirestoreCollections, checkFirestoreSetup } from '../utils/firestoreSetup';
import { db } from '../config/firebase';

const GameContext = createContext(null);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  // Return a safe default if context is still initializing
  if (!context) {
    return {
      games: [],
      applications: [],
      chatRooms: [],
      matchedPlayers: [],
      messages: [],
      currentUserId: '',
      currentUserName: '',
      currentUserSkill: '',
      isInitialized: false,
      addGame: () => {},
      updateGame: () => {},
      removeGame: () => {},
      requestToJoinGame: () => ({ success: false, message: 'Context not ready' }),
      updateApplicationStatus: () => {},
      withdrawApplication: () => ({ success: false, message: 'Context not ready' }),
      getUserApplications: () => [],
      getGameApplications: () => [],
      hasUserApplied: () => false,
      getUserChatRooms: () => [],
      getChatRoom: () => null,
      addMatchedPlayer: () => {},
      sendMessage: () => ({ success: false, message: 'Context not ready' }),
      getMessages: () => [],
      getConversation: () => [],
      deleteChat: () => ({ success: false, message: 'Context not ready' })
    };
  }
  return context;
};

const mockGames = [
  {
    id: 1,
    location: "Central Park Courts",
    date: "2025-01-20",
    time: "10:00",
    skillLevel: "intermediate",
    openSpots: 2,
    totalSpots: 4,
    createdBy: "Sarah Johnson",
    createdAt: "2025-01-17T10:00:00Z",
    description: "Friendly doubles game, bring your own paddle!",
    gameType: "doubles",
    duprRating: "3.0",
    applicants: []
  },
  {
    id: 2,
    location: "Riverside Recreation Center",
    date: "2025-01-21",
    time: "14:30",
    skillLevel: "beginner",
    openSpots: 3,
    totalSpots: 4,
    createdBy: "Mike Chen",
    createdAt: "2025-01-17T11:00:00Z",
    description: "Great for beginners, we'll help you learn!",
    gameType: "doubles",
    duprRating: "unrated",
    applicants: []
  },
  {
    id: 3,
    location: "Downtown Sports Complex",
    date: "2025-01-22",
    time: "18:00",
    skillLevel: "advanced",
    openSpots: 1,
    totalSpots: 4,
    createdBy: "Emily Rodriguez",
    createdAt: "2025-01-17T12:00:00Z",
    description: "Competitive play, advanced players only.",
    gameType: "doubles",
    duprRating: "4.5",
    applicants: []
  },
  {
    id: 4,
    location: "Sunset Park Courts",
    date: "2025-01-23",
    time: "16:00",
    skillLevel: "mixed",
    openSpots: 4,
    totalSpots: 6,
    createdBy: "David Kim",
    createdAt: "2025-01-17T13:00:00Z",
    description: "All skill levels welcome! Fun and casual.",
    gameType: "mixed",
    duprRating: "unrated",
    applicants: []
  },
  {
    id: 5,
    location: "Golden Gate Park Courts",
    date: "2025-01-24",
    time: "16:00",
    skillLevel: "intermediate",
    openSpots: 3,
    totalSpots: 6,
    createdBy: "Alex Thompson",
    createdAt: "2025-01-17T10:00:00Z",
    description: "Competitive doubles play. Looking for solid intermediate players.",
    gameType: "doubles",
    duprRating: "3.5",
    applicants: []
  },
  {
    id: 6,
    location: "Mission Bay Courts",
    date: "2025-01-25",
    time: "10:30",
    skillLevel: "beginner",
    openSpots: 2,
    totalSpots: 4,
    createdBy: "Alex Thompson",
    createdAt: "2025-01-17T11:00:00Z",
    description: "Beginner-friendly game. Perfect for learning the basics!",
    gameType: "doubles",
    duprRating: "unrated",
    applicants: []
  },
  {
    id: 7,
    location: "Marina District Courts",
    date: "2025-01-26",
    time: "09:00",
    skillLevel: "intermediate",
    openSpots: 4,
    totalSpots: 4,
    createdBy: "Jessica Martinez",
    createdAt: "2025-01-17T14:00:00Z",
    description: "Morning doubles match. Coffee after the game!",
    gameType: "doubles",
    duprRating: "3.0",
    applicants: []
  },
  {
    id: 8,
    location: "Bay Area Pickleball Club",
    date: "2025-01-27",
    time: "19:00",
    skillLevel: "advanced",
    openSpots: 2,
    totalSpots: 4,
    createdBy: "Alex Thompson",
    createdAt: "2025-01-17T15:00:00Z",
    description: "Evening competitive play. Indoor courts available.",
    gameType: "doubles",
    duprRating: "4.0",
    applicants: []
  },
  {
    id: 9,
    location: "Community Center Courts",
    date: "2025-01-28",
    time: "15:00",
    skillLevel: "beginner",
    openSpots: 6,
    totalSpots: 8,
    createdBy: "Robert Chen",
    createdAt: "2025-01-17T16:00:00Z",
    description: "Large group game for beginners. All equipment provided!",
    gameType: "mixed",
    duprRating: "unrated",
    applicants: []
  },
  {
    id: 10,
    location: "Presidio Sports Complex",
    date: "2025-01-29",
    time: "11:00",
    skillLevel: "mixed",
    openSpots: 3,
    totalSpots: 6,
    createdBy: "Alex Thompson",
    createdAt: "2025-01-17T17:00:00Z",
    description: "Weekend fun for all skill levels. Great courts with city views!",
    gameType: "mixed",
    duprRating: "unrated",
    applicants: []
  }
];

const mockApplications = [
  {
    id: 1,
    gameId: 1,
    playerId: "current-user",
    playerName: "Alex Thompson",
    playerSkill: "Intermediate",
    applicationDate: "2025-01-17T14:00:00Z",
    message: "I'm really excited to join! I've been playing for 2 years.",
    status: "accepted",
    playerCount: 1
  },
  {
    id: 2,
    gameId: 1,
    playerId: "user-2",
    playerName: "Jessica Miller",
    playerSkill: "Beginner",
    applicationDate: "2025-01-17T15:30:00Z",
    message: "New to pickleball but eager to learn!",
    status: "pending",
    playerCount: 1
  },
  {
    id: 3,
    gameId: 2,
    playerId: "user-3",
    playerName: "Robert Chen",
    playerSkill: "Intermediate",
    applicationDate: "2025-01-17T16:00:00Z",
    message: "Available and ready to play!",
    status: "accepted",
    playerCount: 1
  },
  {
    id: 4,
    gameId: 3,
    playerId: "current-user",
    playerName: "Alex Thompson",
    playerSkill: "Intermediate",
    applicationDate: "2025-01-17T17:00:00Z",
    message: "Looking forward to some competitive play!",
    status: "accepted",
    playerCount: 1
  },
  {
    id: 5,
    gameId: 5,
    playerId: "user-5",
    playerName: "Sarah Martinez",
    playerSkill: "Intermediate",
    applicationDate: "2025-01-17T12:00:00Z",
    message: "I'm available for the doubles game! I've been playing for 3 years and love competitive play.",
    status: "pending",
    playerCount: 1
  },
  {
    id: 6,
    gameId: 5,
    playerId: "user-6",
    playerName: "Michael Johnson",
    playerSkill: "Intermediate",
    applicationDate: "2025-01-17T13:30:00Z",
    message: "My partner and I would love to join! We're both intermediate level players.",
    status: "pending",
    playerCount: 2
  },
  {
    id: 7,
    gameId: 8,
    playerId: "user-7",
    playerName: "Jennifer Lee",
    playerSkill: "Advanced",
    applicationDate: "2025-01-17T14:15:00Z",
    message: "Perfect timing for an evening game! Count me in.",
    status: "pending",
    playerCount: 1
  },
  {
    id: 8,
    gameId: 6,
    playerId: "user-8",
    playerName: "David Wilson",
    playerSkill: "Beginner",
    applicationDate: "2025-01-17T15:00:00Z",
    message: "Just started playing last month. Would love to join a beginner game!",
    status: "pending",
    playerCount: 1
  },
  {
    id: 9,
    gameId: 10,
    playerId: "user-9",
    playerName: "Lisa Chen",
    playerSkill: "Beginner",
    applicationDate: "2025-01-17T16:45:00Z",
    message: "Weekend game sounds perfect! I'm relatively new but excited to play.",
    status: "pending",
    playerCount: 1
  },
  {
    id: 10,
    gameId: 9,
    playerId: "user-10",
    playerName: "Mark Thompson",
    playerSkill: "Beginner",
    applicationDate: "2025-01-17T18:00:00Z",
    message: "Large group game sounds fun! Perfect for beginners like me.",
    status: "accepted",
    playerCount: 2
  }
];

export const GameProvider = ({ children }) => {
  // Get auth context
  const { user } = useAuth();
  
  // Initialize state with empty arrays first, then populate
  const [games, setGames] = useState([]);
  const [applications, setApplications] = useState([]);
  const [hostApplications, setHostApplications] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatRooms, setChatRooms] = useState([]);
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use real user data or fallback values
  const currentUserId = user?.uid || "anonymous-user";
  const currentUserName = user?.displayName || user?.name || "Anonymous User";
  const currentUserSkill = user?.skillLevel || "Intermediate";

  // Initialize Firestore data and set up real-time listeners
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        setIsLoading(true);
        
        try {
          // Check if Firestore is set up, if not initialize it
          const setupCheck = await checkFirestoreSetup();
          
          if (!setupCheck.isSetup) {
            console.log('Initializing Firestore collections...');
            await initializeFirestoreCollections();
          }
          
          // Set up real-time listeners for games
          const unsubscribeGames = gameService.setupGamesListener((gamesData) => {
            setGames(gamesData);
          }, user?.location);
          
          // Set up real-time listeners for user applications (including anonymous users)
          let unsubscribeApplications = null;
          let unsubscribeHostApplications = null;
          const userId = user?.uid || "anonymous-user";
          
          // Listen for user's own applications
          unsubscribeApplications = applicationService.setupUserApplicationsListener(
            userId, 
            (applicationsData) => {
              console.log('GameContext: User applications updated', { userId, applicationsData });
              setApplications(applicationsData);
            }
          );
          
          // Listen for applications to games hosted by user (only for authenticated users)
          if (user && user.uid) {
            unsubscribeHostApplications = applicationService.setupGameHostApplicationsListener(
              user.uid,
              (hostApplicationsData) => {
                console.log('GameContext: Host applications updated', hostApplicationsData);
                setHostApplications(hostApplicationsData);
              }
            );
          }
          
          // Initialize other data (keeping some mock data for now)
          setChatRooms([]);
          setMessages([]);
          setMatchedPlayers([]);
          
          setIsInitialized(true);
          setIsLoading(false);
          
          // Cleanup function
          return () => {
            unsubscribeGames();
            if (unsubscribeApplications) {
              unsubscribeApplications();
            }
            if (unsubscribeHostApplications) {
              unsubscribeHostApplications();
            }
          };
          
        } catch (error) {
          console.error('Error initializing Firestore data:', error);
          // Fallback to mock data on error
          setGames(mockGames);
          setApplications(mockApplications);
          setIsInitialized(true);
          setIsLoading(false);
        }
      }
    };
    
    initializeData();
  }, [isInitialized, user]);

  // Function to clean up expired games (games that are more than 1 hour past their start time)
  const cleanupExpiredGames = React.useCallback(() => {
    try {
      const now = new Date();
      
      setGames(prevGames => {
        if (!prevGames || !Array.isArray(prevGames)) return prevGames;
        
        const expiredGameIds = [];
        
        const activeGames = prevGames.filter(game => {
          try {
            // Parse the game date and time safely
            if (!game?.date || !game?.time) return true; // Keep games without date/time
            
            const gameDateTime = new Date(`${game.date}T${game.time}`);
            
            // Check if the date is valid
            if (isNaN(gameDateTime.getTime())) return true; // Keep invalid dates
            
            // Add 1 hour to the game start time
            const gameEndTime = new Date(gameDateTime.getTime() + 60 * 60 * 1000);
            
            // Check if current time is past the game end time (1 hour after start)
            if (now > gameEndTime) {
              expiredGameIds.push(game.id);
              return false; // Remove this game
            }
            return true; // Keep this game
          } catch (error) {
            // If there's any error processing this game, keep it
            return true;
          }
        });
        
        // If we removed any games, also clean up their applications and chat rooms
        if (expiredGameIds.length > 0) {
          // Use setTimeout to avoid state update during render
          setTimeout(() => {
            setApplications(prevApps => prevApps.filter(app => !expiredGameIds.includes(app.gameId)));
            setChatRooms(prevRooms => prevRooms.filter(room => !expiredGameIds.includes(room.gameId)));
          }, 0);
        }
        
        return activeGames;
      });
    } catch (error) {
      // If cleanup fails, don't crash the app
      console.warn('Game cleanup failed:', error);
    }
  }, []);

  // Set up periodic cleanup - run every 5 minutes, but only after initialization
  useEffect(() => {
    if (!isInitialized) return;
    
    // Run cleanup after a short delay to ensure context is fully initialized
    const initialCleanup = setTimeout(() => {
      cleanupExpiredGames();
    }, 2000);
    
    // Set up interval to run cleanup every 5 minutes
    const cleanupInterval = setInterval(cleanupExpiredGames, 5 * 60 * 1000);
    
    // Cleanup interval on unmount
    return () => {
      clearTimeout(initialCleanup);
      clearInterval(cleanupInterval);
    };
  }, [cleanupExpiredGames, isInitialized]);

  const addGame = async (gameData) => {
    try {
      const result = await gameService.createGame(gameData, currentUserId, currentUserName);
      if (result.success) {
        // Game will be added to state via real-time listener
        return { success: true, message: "Game created successfully!" };
      } else {
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Error adding game:', error);
      return { success: false, message: "Failed to create game" };
    }
  };

  const updateGame = async (gameId, updateData) => {
    try {
      const result = await gameService.updateGame(gameId, updateData);
      if (result.success) {
        // Game will be updated in state via real-time listener
        return { success: true, message: "Game updated successfully!" };
      } else {
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Error updating game:', error);
      return { success: false, message: "Failed to update game" };
    }
  };

  const removeGame = async (gameId) => {
    try {
      const result = await gameService.deleteGame(gameId);
      if (result.success) {
        // Game and related data will be removed via real-time listeners
        return { success: true, message: "Game removed successfully!" };
      } else {
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Error removing game:', error);
      return { success: false, message: "Failed to remove game" };
    }
  };

  const requestToJoinGame = async (gameId, message = "", playerCount = 1) => {
    try {
      console.log('GameContext: requestToJoinGame called', { 
        gameId, 
        currentUserId, 
        currentUserName,
        isInitialized,
        gamesCount: games.length,
        db: !!db
      });
      
      // Check if Firestore is available
      if (!db) {
        console.error('GameContext: Firestore not initialized');
        return { success: false, message: "Database connection not available" };
      }
      
      // Check if user already applied
      console.log('GameContext: Checking if user already applied...');
      const hasApplied = await hasUserAppliedToGame(currentUserId, gameId);
      if (hasApplied) {
        console.log('GameContext: User has already applied to this game');
        return { success: false, message: "You have already applied to this game." };
      }

      // Check if game exists and has open spots
      const game = games.find(g => g.id === gameId);
      if (!game) {
        console.log('GameContext: Game not found', { 
          gameId, 
          availableGames: games.map(g => ({ id: g.id, location: g.location })) 
        });
        return { success: false, message: "Game not found." };
      }
      
      if (game.openSpots <= 0) {
        console.log('GameContext: Game is full', { gameId, openSpots: game.openSpots });
        return { success: false, message: "This game is full." };
      }

      // Create new application
      const applicationData = {
        gameId,
        playerId: currentUserId,
        playerName: currentUserName,
        playerSkill: currentUserSkill,
        playerCount,
        message
      };

      console.log('GameContext: Creating application with data:', applicationData);
      
      // Check if applicationService exists
      if (!applicationService || !applicationService.createApplication) {
        console.error('GameContext: applicationService.createApplication not available');
        return { success: false, message: "Application service not available" };
      }
      
      const result = await applicationService.createApplication(applicationData);
      
      if (result && result.success) {
        console.log('GameContext: Application created successfully', result);
        // Application will be added to state via real-time listener
        return { success: true, message: "Application submitted successfully!" };
      } else {
        console.log('GameContext: Application creation failed', result);
        return { success: false, message: result?.error || "Failed to create application" };
      }
    } catch (error) {
      console.error('GameContext: Error submitting application:', { 
        error, 
        message: error.message,
        stack: error.stack 
      });
      return { success: false, message: error.message || "Failed to submit application" };
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      // First update in Firebase
      const result = await applicationService.updateApplicationStatus(applicationId, status);
      
      if (result.success) {
        // Update local state - the real-time listener will handle this, but we update optimistically
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status } : app
          )
        );
        
        setHostApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status } : app
          )
        );

        // If accepted, reduce the game's open spots
        if (status === 'accepted') {
          const application = [...applications, ...hostApplications].find(app => app.id === applicationId);
          if (application) {
            // Update game's open spots in Firebase
            const game = games.find(g => g.id === application.gameId);
            if (game) {
              await gameService.updateGame(application.gameId, {
                openSpots: Math.max(0, game.openSpots - (application.playerCount || 1))
              });
            }
            
            // Create or update chat room for this game
            createOrUpdateChatRoom(application.gameId, application.playerId);
          }
        }
        
        return { success: true, message: `Application ${status}!` };
      } else {
        return { success: false, message: result.error };
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      return { success: false, message: "Failed to update application status" };
    }
  };

  const withdrawApplication = async (applicationId) => {
    try {
      console.log('GameContext: Withdrawing application', { applicationId });
      const result = await applicationService.deleteApplication(applicationId);
      
      if (result.success) {
        console.log('GameContext: Application withdrawn successfully');
        return { success: true, message: "Application withdrawn successfully!" };
      } else {
        console.error('GameContext: Failed to withdraw application', result);
        return { success: false, message: result.error || "Failed to withdraw application" };
      }
    } catch (error) {
      console.error('GameContext: Error withdrawing application', error);
      return { success: false, message: "Failed to withdraw application" };
    }
  };

  const createOrUpdateChatRoom = (gameId, newPlayerId) => {
    setChatRooms(prev => {
      const existingRoom = prev.find(room => room.gameId === gameId);
      
      if (existingRoom) {
        // Add player to existing chat room if not already there
        if (!existingRoom.participants.includes(newPlayerId)) {
          return prev.map(room =>
            room.gameId === gameId
              ? { ...room, participants: [...room.participants, newPlayerId] }
              : room
          );
        }
        return prev;
      } else {
        // Create new chat room
        const game = games.find(g => g.id === gameId);
        const newRoom = {
          id: `chat-${gameId}`,
          gameId,
          gameName: game?.location || 'Game Chat',
          participants: ['host-user', newPlayerId], // Host + accepted player
          createdAt: new Date().toISOString()
        };
        return [...prev, newRoom];
      }
    });
  };


  const getUserApplications = React.useCallback(() => {
    return applications.filter(app => app.playerId === currentUserId);
  }, [applications, currentUserId]);

  const getGameApplications = React.useCallback((gameId) => {
    if (gameId) {
      // Get applications for a specific game from hostApplications
      return hostApplications.filter(app => app.gameId === gameId && app.status === 'pending');
    }
    // Get all pending applications for games created by current user
    return hostApplications.filter(app => app.status === 'pending');
  }, [hostApplications]);

  const hasUserApplied = React.useCallback((gameId) => {
    return applications.some(
      app => app.gameId === gameId && app.playerId === currentUserId
    );
  }, [applications, currentUserId]);

  const getUserChatRooms = React.useCallback(() => {
    
    const filteredRooms = chatRooms.filter(room => 
      room.participants.includes(currentUserId) || 
      room.participants.includes('host-user') ||
      room.participants.includes(currentUserName)
    );
    
    return filteredRooms;
  }, [chatRooms, currentUserId, currentUserName]);

  const getChatRoom = React.useCallback((gameId) => {
    return chatRooms.find(room => room.gameId === gameId);
  }, [chatRooms]);

  const addMatchedPlayer = (player) => {
    setMatchedPlayers(prev => [...prev, { 
      ...player, 
      matchedAt: new Date().toISOString() 
    }]);
  };

  const sendMessage = (recipientName, messageText) => {
    const newMessage = {
      id: Date.now(),
      from: currentUserName,
      to: recipientName,
      message: messageText,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Also create a chat room entry if it doesn't exist
    const chatId = `chat-${recipientName.replace(/\s+/g, '-').toLowerCase()}`;
    setChatRooms(prev => {
      const existingRoom = prev.find(room => room.id === chatId);
      if (!existingRoom) {
        const newRoom = {
          id: chatId,
          gameId: null, // This is a direct message, not a game chat
          gameName: recipientName,
          participants: [currentUserName, recipientName],
          createdAt: new Date().toISOString(),
          lastMessage: messageText,
          lastMessageTime: new Date().toISOString()
        };
        return [...prev, newRoom];
      } else {
        // Update existing room with new message info
        return prev.map(room =>
          room.id === chatId
            ? { ...room, lastMessage: messageText, lastMessageTime: new Date().toISOString() }
            : room
        );
      }
    });
    
    return { success: true, message: "Message sent successfully!" };
  };

  const getMessages = React.useCallback(() => {
    return messages;
  }, [messages]);

  const getConversation = React.useCallback((recipientName) => {
    return messages.filter(msg => 
      (msg.from === currentUserName && msg.to === recipientName) ||
      (msg.from === recipientName && msg.to === currentUserName)
    );
  }, [messages, currentUserName]);

  const deleteChat = (recipientName) => {
    // Remove all messages for this conversation
    setMessages(prev => prev.filter(msg => 
      !((msg.from === currentUserName && msg.to === recipientName) ||
        (msg.from === recipientName && msg.to === currentUserName))
    ));
    
    // Remove the chat room
    const chatId = `chat-${recipientName.replace(/\s+/g, '-').toLowerCase()}`;
    setChatRooms(prev => prev.filter(room => room.id !== chatId));
    
    return { success: true, message: "Chat deleted successfully!" };
  };

  const value = useMemo(() => ({
    games,
    applications,
    chatRooms,
    matchedPlayers,
    messages,
    currentUserId,
    currentUserName,
    currentUserSkill,
    isInitialized,
    isLoading,
    addGame,
    updateGame,
    removeGame,
    requestToJoinGame,
    updateApplicationStatus,
    withdrawApplication,
    getUserApplications,
    getGameApplications,
    hasUserApplied,
    getUserChatRooms,
    getChatRoom,
    addMatchedPlayer,
    sendMessage,
    getMessages,
    getConversation,
    deleteChat
  }), [
    games, 
    applications, 
    chatRooms, 
    matchedPlayers, 
    messages, 
    currentUserId, 
    currentUserName, 
    currentUserSkill,
    isInitialized,
    isLoading,
    getUserApplications,
    getGameApplications,
    hasUserApplied,
    getUserChatRooms,
    getChatRoom,
    getMessages,
    getConversation
  ]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
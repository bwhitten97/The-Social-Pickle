import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const GameContext = createContext();

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
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
  const [games, setGames] = useState(mockGames);
  const [applications, setApplications] = useState(mockApplications);
  const [chatRooms, setChatRooms] = useState([
    // Game chat rooms for accepted applications
    {
      id: 'chat-1',
      gameId: 1,
      gameName: 'Central Park Courts',
      participants: ['host-user', 'current-user'],
      createdAt: new Date().toISOString(),
      lastMessage: 'Welcome to the game chat! Looking forward to playing.',
      lastMessageTime: new Date().toISOString()
    },
    {
      id: 'chat-3',
      gameId: 3,
      gameName: 'Downtown Sports Complex',
      participants: ['host-user', 'current-user'],
      createdAt: new Date().toISOString(),
      lastMessage: 'Ready for some competitive play!',
      lastMessageTime: new Date().toISOString()
    },
    // Direct message chat rooms
    {
      id: 'chat-jessica-martinez',
      gameId: null,
      gameName: 'Jessica Martinez',
      participants: ['Alex Thompson', 'Jessica Martinez'],
      createdAt: new Date().toISOString(),
      lastMessage: 'Looking forward to our game tomorrow!',
      lastMessageTime: new Date().toISOString()
    },
    {
      id: 'chat-priya-patel',
      gameId: null,
      gameName: 'Priya Patel',
      participants: ['Alex Thompson', 'Priya Patel'],
      createdAt: new Date().toISOString(),
      lastMessage: 'Thanks for the great match today!',
      lastMessageTime: new Date().toISOString()
    },
    {
      id: 'chat-maria-gonzalez',
      gameId: null,
      gameName: 'Maria Gonzalez',
      participants: ['Alex Thompson', 'Maria Gonzalez'],
      createdAt: new Date().toISOString(),
      lastMessage: 'What time should we meet at the courts?',
      lastMessageTime: new Date().toISOString()
    }
  ]);
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'Jessica Martinez',
      to: 'Alex Thompson',
      message: 'Looking forward to our game tomorrow!',
      timestamp: new Date().toISOString(),
      read: false
    }
  ]);
  const currentUserId = "current-user";
  const currentUserName = "Alex Thompson";
  const currentUserSkill = "Intermediate";

  // Function to clean up expired games (games that are more than 1 hour past their start time)
  const cleanupExpiredGames = () => {
    const now = new Date();
    
    setGames(prevGames => {
      const expiredGameIds = [];
      
      const activeGames = prevGames.filter(game => {
        // Parse the game date and time
        const gameDateTime = new Date(`${game.date}T${game.time}`);
        
        // Add 1 hour to the game start time
        const gameEndTime = new Date(gameDateTime.getTime() + 60 * 60 * 1000);
        
        // Check if current time is past the game end time (1 hour after start)
        if (now > gameEndTime) {
          expiredGameIds.push(game.id);
          return false; // Remove this game
        }
        return true; // Keep this game
      });
      
      // If we removed any games, also clean up their applications and chat rooms
      if (expiredGameIds.length > 0) {
        setApplications(prevApps => prevApps.filter(app => !expiredGameIds.includes(app.gameId)));
        setChatRooms(prevRooms => prevRooms.filter(room => !expiredGameIds.includes(room.gameId)));
        
        console.log(`Cleaned up ${expiredGameIds.length} expired games`);
      }
      
      return activeGames;
    });
  };

  // Set up periodic cleanup - run every 5 minutes
  useEffect(() => {
    // Define cleanup function inside useEffect to avoid stale closures
    const runCleanup = () => {
      const now = new Date();
      setGames(prevGames => {
        const expiredGameIds = [];
        const activeGames = prevGames.filter(game => {
          const gameDateTime = new Date(`${game.date}T${game.time}`);
          const gameEndTime = new Date(gameDateTime.getTime() + 60 * 60 * 1000);
          
          if (now > gameEndTime) {
            expiredGameIds.push(game.id);
            return false;
          }
          return true;
        });
        
        if (expiredGameIds.length > 0) {
          setApplications(prevApps => prevApps.filter(app => !expiredGameIds.includes(app.gameId)));
          setChatRooms(prevRooms => prevRooms.filter(room => !expiredGameIds.includes(room.gameId)));
          
          console.log(`Cleaned up ${expiredGameIds.length} expired games`);
        }
        
        return activeGames;
      });
    };
    
    // Run cleanup immediately when component mounts
    runCleanup();
    
    // Set up interval to run cleanup every 5 minutes
    const cleanupInterval = setInterval(runCleanup, 5 * 60 * 1000);
    
    // Cleanup interval on unmount
    return () => clearInterval(cleanupInterval);
  }, []);

  const addGame = (gameData) => {
    const newGame = {
      ...gameData,
      id: Date.now(),
      createdBy: currentUserName,
      createdAt: new Date().toISOString(),
      applicants: []
    };
    setGames(prev => [newGame, ...prev]);
    return newGame;
  };

  const updateGame = (gameId, updateData) => {
    setGames(prev => prev.map(game => 
      game.id === gameId 
        ? { ...game, ...updateData, totalSpots: updateData.openSpots }
        : game
    ));
  };

  const removeGame = (gameId) => {
    setGames(prev => prev.filter(game => game.id !== gameId));
    // Also remove related applications
    setApplications(prev => prev.filter(app => app.gameId !== gameId));
  };

  const requestToJoinGame = (gameId, message = "") => {
    // Check if user already applied
    const existingApplication = applications.find(
      app => app.gameId === gameId && app.playerId === currentUserId
    );
    
    if (existingApplication) {
      return { success: false, message: "You have already applied to this game." };
    }

    // Check if game exists and has open spots
    const game = games.find(g => g.id === gameId);
    if (!game) {
      return { success: false, message: "Game not found." };
    }
    
    if (game.openSpots <= 0) {
      return { success: false, message: "This game is full." };
    }

    // Create new application
    const newApplication = {
      id: Date.now(),
      gameId,
      playerId: currentUserId,
      playerName: currentUserName,
      playerSkill: currentUserSkill,
      applicationDate: new Date().toISOString(),
      message,
      status: "pending"
    };

    setApplications(prev => [...prev, newApplication]);
    return { success: true, message: "Application submitted successfully!" };
  };

  const updateApplicationStatus = (applicationId, status) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === applicationId ? { ...app, status } : app
      )
    );

    // If accepted, reduce the game's open spots and create/update chat room
    if (status === 'accepted') {
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        setGames(prev =>
          prev.map(game =>
            game.id === application.gameId
              ? { ...game, openSpots: Math.max(0, game.openSpots - (application.playerCount || 1)) }
              : game
          )
        );
        
        // Create or update chat room for this game
        createOrUpdateChatRoom(application.gameId, application.playerId);
      }
    }
  };

  const withdrawApplication = (applicationId) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
    return { success: true, message: "Application withdrawn successfully!" };
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


  const getUserApplications = () => {
    return applications.filter(app => app.playerId === currentUserId);
  };

  const getGameApplications = () => {
    // Get applications for games created by current user
    const userGames = games.filter(game => game.createdBy === currentUserName);
    const userGameIds = userGames.map(game => game.id);
    return applications.filter(app => userGameIds.includes(app.gameId));
  };

  const hasUserApplied = (gameId) => {
    return applications.some(
      app => app.gameId === gameId && app.playerId === currentUserId
    );
  };

  const getUserChatRooms = () => {
    console.log('Getting user chat rooms...');
    console.log('Current user ID:', currentUserId);
    console.log('Current user name:', currentUserName);
    console.log('All chat rooms:', chatRooms);
    
    const filteredRooms = chatRooms.filter(room => 
      room.participants.includes(currentUserId) || 
      room.participants.includes('host-user') ||
      room.participants.includes(currentUserName)
    );
    
    console.log('Filtered chat rooms:', filteredRooms);
    return filteredRooms;
  };

  const getChatRoom = (gameId) => {
    return chatRooms.find(room => room.gameId === gameId);
  };

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

  const getMessages = () => {
    return messages;
  };

  const getConversation = (recipientName) => {
    return messages.filter(msg => 
      (msg.from === currentUserName && msg.to === recipientName) ||
      (msg.from === recipientName && msg.to === currentUserName)
    );
  };

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
  }), [games, applications, chatRooms, matchedPlayers, messages, currentUserId, currentUserName, currentUserSkill]);

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
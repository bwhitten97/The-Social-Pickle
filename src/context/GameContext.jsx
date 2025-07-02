import { createContext, useContext, useState } from 'react';

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
    date: "2025-07-05",
    time: "10:00",
    skillLevel: "intermediate",
    openSpots: 2,
    createdBy: "Sarah Johnson",
    createdAt: "2025-07-01T10:00:00Z",
    description: "Friendly doubles game, bring your own paddle!",
    applicants: []
  },
  {
    id: 2,
    location: "Riverside Recreation Center",
    date: "2025-07-06",
    time: "14:30",
    skillLevel: "beginner",
    openSpots: 3,
    createdBy: "Mike Chen",
    createdAt: "2025-07-01T11:00:00Z",
    description: "Great for beginners, we'll help you learn!",
    applicants: []
  },
  {
    id: 3,
    location: "Downtown Sports Complex",
    date: "2025-07-07",
    time: "18:00",
    skillLevel: "advanced",
    openSpots: 1,
    createdBy: "Emily Rodriguez",
    createdAt: "2025-07-01T12:00:00Z",
    description: "Competitive play, advanced players only.",
    applicants: []
  },
  {
    id: 4,
    location: "Sunset Park Courts",
    date: "2025-07-08",
    time: "16:00",
    skillLevel: "mixed",
    openSpots: 4,
    createdBy: "David Kim",
    createdAt: "2025-07-01T13:00:00Z",
    description: "All skill levels welcome! Fun and casual.",
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
    applicationDate: "2025-07-01T14:00:00Z",
    message: "I'm really excited to join! I've been playing for 2 years.",
    status: "pending"
  },
  {
    id: 2,
    gameId: 1,
    playerId: "user-2",
    playerName: "Jessica Miller",
    playerSkill: "Beginner",
    applicationDate: "2025-07-01T15:30:00Z",
    message: "New to pickleball but eager to learn!",
    status: "pending"
  },
  {
    id: 3,
    gameId: 2,
    playerId: "user-3",
    playerName: "Robert Chen",
    playerSkill: "Intermediate",
    applicationDate: "2025-07-01T16:00:00Z",
    message: "Available and ready to play!",
    status: "accepted"
  }
];

export const GameProvider = ({ children }) => {
  const [games, setGames] = useState(mockGames);
  const [applications, setApplications] = useState(mockApplications);
  const [chatRooms, setChatRooms] = useState([]);
  const [matchedPlayers, setMatchedPlayers] = useState([]);
  const currentUserId = "current-user";
  const currentUserName = "Alex Thompson";
  const currentUserSkill = "Intermediate";

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
              ? { ...game, openSpots: Math.max(0, game.openSpots - 1) }
              : game
          )
        );
        
        // Create or update chat room for this game
        createOrUpdateChatRoom(application.gameId, application.playerId);
      }
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

  const withdrawApplication = (applicationId) => {
    setApplications(prev => prev.filter(app => app.id !== applicationId));
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
    return chatRooms.filter(room => 
      room.participants.includes(currentUserId) || 
      room.participants.includes('host-user')
    );
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

  const value = {
    games,
    applications,
    chatRooms,
    matchedPlayers,
    currentUserId,
    currentUserName,
    currentUserSkill,
    addGame,
    requestToJoinGame,
    updateApplicationStatus,
    withdrawApplication,
    getUserApplications,
    getGameApplications,
    hasUserApplied,
    getUserChatRooms,
    getChatRoom,
    addMatchedPlayer
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
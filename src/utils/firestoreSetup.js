import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Initialize Firestore collections with proper structure
export const initializeFirestoreCollections = async () => {
  try {
    console.log('Setting up Firestore collections...');
    
    // Create games collection with sample data
    const gamesRef = collection(db, 'games');
    
    const sampleGames = [
      {
        location: "Central Park Courts",
        date: "2025-01-25",
        time: "10:00",
        skillLevel: "intermediate",
        openSpots: 2,
        totalSpots: 4,
        createdBy: "Sarah Johnson",
        createdById: "user-sarah",
        gameType: "doubles",
        duprRating: "3.0",
        description: "Friendly doubles game, bring your own paddle!",
        createdAt: serverTimestamp(),
        status: "active"
      },
      {
        location: "Riverside Recreation Center", 
        date: "2025-01-26",
        time: "14:30",
        skillLevel: "beginner",
        openSpots: 3,
        totalSpots: 4,
        createdBy: "Mike Chen",
        createdById: "user-mike",
        gameType: "doubles",
        duprRating: "unrated",
        description: "Great for beginners, we'll help you learn!",
        createdAt: serverTimestamp(),
        status: "active"
      },
      {
        location: "Downtown Sports Complex",
        date: "2025-01-27", 
        time: "18:00",
        skillLevel: "advanced",
        openSpots: 1,
        totalSpots: 4,
        createdBy: "Emily Rodriguez",
        createdById: "user-emily",
        gameType: "doubles",
        duprRating: "4.5",
        description: "Competitive play, advanced players only.",
        createdAt: serverTimestamp(),
        status: "active"
      }
    ];

    // Add sample games
    for (const game of sampleGames) {
      await addDoc(gamesRef, game);
    }

    // Create applications collection structure (empty for now)
    const applicationsRef = collection(db, 'applications');
    // Applications will be created when users apply to games
    
    // Create chats collection structure (empty for now)
    const chatsRef = collection(db, 'chats');
    // Chats will be created when games are accepted
    
    // Create notifications collection structure (empty for now)
    const notificationsRef = collection(db, 'notifications');
    // Notifications will be created for game events

    console.log('Firestore collections initialized successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
    return { success: false, error };
  }
};

// Collection schemas for reference
export const COLLECTION_SCHEMAS = {
  games: {
    location: 'string',
    date: 'string (YYYY-MM-DD)',
    time: 'string (HH:MM)',
    skillLevel: 'string (beginner|intermediate|advanced|mixed)',
    openSpots: 'number',
    totalSpots: 'number', 
    createdBy: 'string (display name)',
    createdById: 'string (user ID)',
    gameType: 'string (singles|doubles|mixed-doubles|round-robin)',
    duprRating: 'string',
    description: 'string',
    createdAt: 'timestamp',
    status: 'string (active|cancelled|completed)'
  },
  
  applications: {
    gameId: 'string (game document ID)',
    playerId: 'string (user ID)', 
    playerName: 'string (display name)',
    playerSkill: 'string',
    playerCount: 'number',
    message: 'string',
    status: 'string (pending|accepted|rejected)',
    appliedAt: 'timestamp'
  },
  
  chats: {
    gameId: 'string (game document ID)',
    gameName: 'string',
    participants: 'array of user IDs',
    createdAt: 'timestamp',
    lastMessage: 'string',
    lastMessageTime: 'timestamp',
    type: 'string (game|direct)'
  },
  
  messages: {
    chatId: 'string (chat document ID)',
    senderId: 'string (user ID)',
    senderName: 'string (display name)', 
    message: 'string',
    timestamp: 'timestamp',
    read: 'boolean'
  },
  
  notifications: {
    userId: 'string (recipient user ID)',
    type: 'string (application|match|game_update)',
    title: 'string',
    message: 'string', 
    gameId: 'string (optional)',
    fromUserId: 'string (optional)',
    read: 'boolean',
    createdAt: 'timestamp'
  }
};

// Helper function to check if collections exist and have data
export const checkFirestoreSetup = async () => {
  try {
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    return {
      gamesCount: gamesSnapshot.size,
      isSetup: gamesSnapshot.size > 0
    };
  } catch (error) {
    console.error('Error checking Firestore setup:', error);
    return { gamesCount: 0, isSetup: false, error };
  }
};
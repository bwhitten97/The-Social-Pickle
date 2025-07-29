import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { config } from '../config/app';

// Games service functions
export const gameService = {
  // Create a new game
  async createGame(gameData, userId, userName) {
    try {
      const gamesRef = collection(db, 'games');
      const newGame = {
        ...gameData,
        createdBy: userName,
        createdById: userId,
        createdAt: serverTimestamp(),
        status: 'active'
      };
      
      const docRef = await addDoc(gamesRef, newGame);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating game:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all active games
  async getAllGames() {
    try {
      const gamesRef = collection(db, 'games');
      // Get all games, filter on client side to avoid indexes
      
      const snapshot = await getDocs(gamesRef);
      const games = [];
      snapshot.forEach(doc => {
        const gameData = { id: doc.id, ...doc.data() };
        // Filter active games on client side
        if (gameData.status === 'active') {
          games.push(gameData);
        }
      });
      
      // Sort by createdAt on the client side
      games.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      return { success: true, games };
    } catch (error) {
      console.error('Error fetching games:', error);
      return { success: false, error: error.message, games: [] };
    }
  },

  // Get games created by a specific user
  async getUserGames(userId) {
    try {
      const gamesRef = collection(db, 'games');
      // Get all games, filter on client side to avoid indexes
      
      const snapshot = await getDocs(gamesRef);
      const games = [];
      snapshot.forEach(doc => {
        const gameData = { id: doc.id, ...doc.data() };
        // Filter user's active games on client side
        if (gameData.createdById === userId && gameData.status === 'active') {
          games.push(gameData);
        }
      });
      
      // Sort by createdAt on the client side
      games.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      return { success: true, games };
    } catch (error) {
      console.error('Error fetching user games:', error);
      return { success: false, error: error.message, games: [] };
    }
  },

  // Update a game
  async updateGame(gameId, updateData) {
    try {
      const gameRef = doc(db, 'games', gameId);
      await updateDoc(gameRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating game:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete a game
  async deleteGame(gameId) {
    try {
      const batch = writeBatch(db);
      
      // Delete the game
      const gameRef = doc(db, 'games', gameId);
      batch.delete(gameRef);
      
      // Delete related applications
      const applicationsRef = collection(db, 'applications');
      const appQuery = query(applicationsRef, where('gameId', '==', gameId));
      const appSnapshot = await getDocs(appQuery);
      
      appSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      return { success: true };
    } catch (error) {
      console.error('Error deleting game:', error);
      return { success: false, error: error.message };
    }
  },

  // Set up real-time listener for games
  setupGamesListener(callback, userLocation = null) {
    const gamesRef = collection(db, 'games');
    // Get all games, filter status on client side to avoid indexes
    
    return onSnapshot(gamesRef, (snapshot) => {
      const games = [];
      snapshot.forEach(doc => {
        const gameData = { id: doc.id, ...doc.data() };
        
        // Filter active games on client side
        if (gameData.status !== 'active') {
          return;
        }
        
        // Location filtering when multi-city is enabled
        if (config.MULTI_CITY_ENABLED && userLocation && gameData.location) {
          // Only show games in the same location
          if (userLocation.zip !== gameData.location?.zip) {
            return;
          }
        }
        
        games.push(gameData);
      });
      
      // Sort by createdAt on the client side
      games.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      callback(games);
    }, (error) => {
      console.error('Error in games listener:', error);
      callback([]);
    });
  }
};

// Applications service functions
export const applicationService = {
  // Create a new application
  async createApplication(applicationData) {
    try {
      const applicationsRef = collection(db, 'applications');
      const newApplication = {
        ...applicationData,
        status: 'pending',
        appliedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(applicationsRef, newApplication);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error creating application:', error);
      return { success: false, error: error.message };
    }
  },

  // Get applications for a user
  async getUserApplications(userId) {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('playerId', '==', userId));
      
      const snapshot = await getDocs(q);
      const applications = [];
      snapshot.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by appliedAt on the client side
      applications.sort((a, b) => {
        const aTime = a.appliedAt?.toDate?.() || new Date(0);
        const bTime = b.appliedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      return { success: true, applications };
    } catch (error) {
      console.error('Error fetching user applications:', error);
      return { success: false, error: error.message, applications: [] };
    }
  },

  // Get applications for a game
  async getGameApplications(gameId) {
    try {
      const applicationsRef = collection(db, 'applications');
      const q = query(applicationsRef, where('gameId', '==', gameId));
      
      const snapshot = await getDocs(q);
      const applications = [];
      snapshot.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by appliedAt on the client side
      applications.sort((a, b) => {
        const aTime = a.appliedAt?.toDate?.() || new Date(0);
        const bTime = b.appliedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      return { success: true, applications };
    } catch (error) {
      console.error('Error fetching game applications:', error);
      return { success: false, error: error.message, applications: [] };
    }
  },

  // Update application status
  async updateApplicationStatus(applicationId, status) {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating application status:', error);
      return { success: false, error: error.message };
    }
  },

  // Delete an application
  async deleteApplication(applicationId) {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await deleteDoc(applicationRef);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting application:', error);
      return { success: false, error: error.message };
    }
  },

  // Set up real-time listener for user applications
  setupUserApplicationsListener(userId, callback) {
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('playerId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      const applications = [];
      snapshot.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by appliedAt on the client side
      applications.sort((a, b) => {
        const aTime = a.appliedAt?.toDate?.() || new Date(0);
        const bTime = b.appliedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      callback(applications);
    }, (error) => {
      console.error('Error in applications listener:', error);
      callback([]);
    });
  },

  // Set up real-time listener for applications to games hosted by user
  setupGameHostApplicationsListener(userId, callback) {
    // First get all games created by this user
    const gamesRef = collection(db, 'games');
    const gamesQuery = query(gamesRef, where('createdById', '==', userId));
    
    return onSnapshot(gamesQuery, async (gamesSnapshot) => {
      const gameIds = [];
      gamesSnapshot.forEach(doc => {
        gameIds.push(doc.id);
      });
      
      if (gameIds.length === 0) {
        callback([]);
        return;
      }
      
      // Then get all applications for those games
      const applicationsRef = collection(db, 'applications');
      const applicationsQuery = query(applicationsRef, where('gameId', 'in', gameIds));
      
      const unsubscribe = onSnapshot(applicationsQuery, (snapshot) => {
        const applications = [];
        snapshot.forEach(doc => {
          applications.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort by appliedAt on the client side
        applications.sort((a, b) => {
          const aTime = a.appliedAt?.toDate?.() || new Date(0);
          const bTime = b.appliedAt?.toDate?.() || new Date(0);
          return bTime - aTime;
        });
        
        callback(applications);
      }, (error) => {
        console.error('Error in game host applications listener:', error);
        callback([]);
      });
      
      return unsubscribe;
    }, (error) => {
      console.error('Error in games listener:', error);
      callback([]);
    });
  }
};

// Helper function to check if user has already applied to a game
export const hasUserAppliedToGame = async (userId, gameId) => {
  try {
    const applicationsRef = collection(db, 'applications');
    const q = query(
      applicationsRef,
      where('playerId', '==', userId),
      where('gameId', '==', gameId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.size > 0;
  } catch (error) {
    console.error('Error checking user application:', error);
    return false;
  }
};
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

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...', { dbExists: !!db });
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }
    
    // Try to read from a collection
    const testRef = collection(db, 'applications');
    const snapshot = await getDocs(query(testRef, where('test', '==', 'test')));
    console.log('Firebase connection test successful');
    return { success: true };
  } catch (error) {
    console.error('Firebase connection test failed:', {
      error,
      code: error.code,
      message: error.message
    });
    return { success: false, error: error.message, code: error.code };
  }
};

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
      const targetGameIds = ['77fHWTlEfTh713J5Pkt2', 'AmT64CdEVVJnGKYJEi23'];
      let filteredOutGames = [];
      
      snapshot.forEach(doc => {
        const gameData = { id: doc.id, ...doc.data() };
        
        // Debug target games
        if (targetGameIds.includes(doc.id)) {
          console.log('gameService: FIXED VERSION - Found target game in snapshot', {
            id: doc.id,
            status: gameData.status,
            location: gameData.location,
            userLocation,
            multiCityEnabled: config.MULTI_CITY_ENABLED,
            locationFilteringDisabled: true
          });
        }
        
        // TEMPORARILY REMOVE ALL FILTERING - load everything
        // if (gameData.status !== 'active') {
        //   if (targetGameIds.includes(doc.id)) {
        //     console.log('gameService: Target game filtered out - not active', doc.id, gameData.status);
        //   }
        //   return;
        // }
        
        // Location filtering COMPLETELY REMOVED
        
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
      console.log('applicationService: createApplication called', applicationData);
      
      // Check if db is initialized
      if (!db) {
        console.error('applicationService: Firestore db not initialized');
        return { success: false, error: 'Database not initialized' };
      }
      
      const applicationsRef = collection(db, 'applications');
      const newApplication = {
        ...applicationData,
        status: 'pending',
        appliedAt: serverTimestamp()
      };
      
      console.log('applicationService: About to add to Firestore', {
        applicationData: newApplication,
        dbExists: !!db,
        collectionPath: 'applications'
      });
      
      const docRef = await addDoc(applicationsRef, newApplication);
      console.log('applicationService: Successfully added to Firestore', { 
        id: docRef.id,
        path: docRef.path,
        applicationData: newApplication
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('applicationService: Error creating application:', {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        return { success: false, error: 'Permission denied. Please ensure you are logged in.' };
      } else if (error.code === 'unavailable') {
        return { success: false, error: 'Service unavailable. Please check your internet connection.' };
      }
      
      return { success: false, error: error.message || 'Failed to create application' };
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
    console.log('applicationService: Setting up listener for userId:', userId);
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('playerId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      console.log('applicationService: setupUserApplicationsListener snapshot received', {
        userId,
        snapshotSize: snapshot.size,
        snapshotEmpty: snapshot.empty
      });
      
      const applications = [];
      snapshot.forEach(doc => {
        const appData = { id: doc.id, ...doc.data() };
        console.log('applicationService: Found application for user', {
          applicationId: doc.id,
          playerId: appData.playerId,
          gameId: appData.gameId,
          status: appData.status
        });
        applications.push(appData);
      });
      
      // Sort by appliedAt on the client side
      applications.sort((a, b) => {
        const aTime = a.appliedAt?.toDate?.() || new Date(0);
        const bTime = b.appliedAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      console.log('applicationService: Calling callback with applications', {
        userId,
        applicationsCount: applications.length
      });
      callback(applications);
    }, (error) => {
      console.error('applicationService: Error in applications listener for user', userId, error);
      callback([]);
    });
  },

  // Set up real-time listener for applications to games hosted by user
  setupGameHostApplicationsListener(userId, callback) {
    try {
      // Get all applications and filter on client side
      const applicationsRef = collection(db, 'applications');
      
      return onSnapshot(applicationsRef, async (snapshot) => {
        // First get all games created by this user
        const gamesRef = collection(db, 'games');
        const gamesSnapshot = await getDocs(gamesRef);
        
        const userGameIds = new Set();
        gamesSnapshot.forEach(doc => {
          const gameData = doc.data();
          if (gameData.createdById === userId) {
            userGameIds.add(doc.id);
          }
        });
        
        if (userGameIds.size === 0) {
          callback([]);
          return;
        }
        
        // Filter applications for user's games
        const applications = [];
        snapshot.forEach(doc => {
          const appData = { id: doc.id, ...doc.data() };
          if (userGameIds.has(appData.gameId)) {
            applications.push(appData);
          }
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
    } catch (error) {
      console.error('Error setting up game host applications listener:', error);
      callback([]);
      return () => {}; // Return empty cleanup function
    }
  }
};

// Helper function to check if user has already applied to a game
export const hasUserAppliedToGame = async (userId, gameId) => {
  try {
    console.log('hasUserAppliedToGame: Checking', { userId, gameId });
    const applicationsRef = collection(db, 'applications');
    
    // Use a simpler query that doesn't require composite index
    // First get all applications for the user
    const userQuery = query(applicationsRef, where('playerId', '==', userId));
    const snapshot = await getDocs(userQuery);
    
    // Then filter by gameId on the client side
    let hasApplied = false;
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.gameId === gameId) {
        hasApplied = true;
      }
    });
    
    console.log('hasUserAppliedToGame: Result', { 
      hasApplied, 
      totalUserApplications: snapshot.size 
    });
    return hasApplied;
  } catch (error) {
    console.error('hasUserAppliedToGame: Error checking user application:', {
      error,
      code: error.code,
      message: error.message
    });
    // Return false on error to allow application to proceed
    return false;
  }
};
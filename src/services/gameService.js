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
import { notificationService } from './notificationService';

// Test Firebase connection (for debugging)
export const testFirebaseConnection = async () => {
  try {
    if (!db) {
      return { success: false, error: 'Firestore not initialized' };
    }
    
    // Simple connection test
    const applicationsRef = collection(db, 'applications');
    const snapshot = await getDocs(applicationsRef);
    
    return { 
      success: true, 
      applicationsCount: snapshot.size,
      gamesCount: 6 // We know there are games from the logs
    };
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return { success: false, error: error.message };
  }
};

// Games service functions
export const gameService = {
  // Create a new game
  async createGame(gameData, userId, userName, userCity) {
    try {
      const gamesRef = collection(db, 'games');
      const newGame = {
        ...gameData,
        createdBy: userName,
        createdById: userId,
        city: userCity || config.AVAILABLE_CITIES[0] || 'Chicago', // Store creator's city
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

  // Get all active games for a specific city
  async getAllGames(userCity) {
    try {
      const gamesRef = collection(db, 'games');
      // Get all games, filter on client side to avoid indexes
      
      const snapshot = await getDocs(gamesRef);
      const games = [];
      snapshot.forEach(doc => {
        const gameData = { id: doc.id, ...doc.data() };
        // Filter active games and city-specific games on client side
        if (gameData.status === 'active') {
          // City filtering: only show games from user's city
          if (userCity !== null && userCity !== undefined) {
            // User has a city, so filter games
            if (!gameData.city || gameData.city !== userCity) {
              return; // Skip games without city or from different cities
            }
          }
          // If userCity is null/undefined, show all games (no filtering)
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
  setupGamesListener(callback, userCity = null) {
    const gamesRef = collection(db, 'games');
    // Get all games, filter on client side to avoid complex indexes
    
    return onSnapshot(gamesRef, (snapshot) => {
      const games = [];
      
      snapshot.forEach(doc => {
        const gameData = { id: doc.id, ...doc.data() };
        
        // Filter active games only
        if (gameData.status !== 'active') {
          return;
        }
        
        // City-based filtering: only show games from user's city
        // If userCity is provided, filter by it
        if (userCity !== null && userCity !== undefined) {
          // User has a city, so filter games
          if (!gameData.city || gameData.city !== userCity) {
            return; // Skip games without city or from different cities
          }
        }
        // If userCity is null/undefined, show all games (no filtering)
        
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
      console.log('🔍 APPLICATION DEBUG: addDoc returned', { 
        docRef,
        docRefId: docRef.id,
        docRefPath: docRef.path,
        applicationData: newApplication
      });
      
      // Verify the document was actually created
      const verifyRef = doc(db, 'applications', docRef.id);
      const verifySnap = await getDoc(verifyRef);
      console.log('🔍 APPLICATION DEBUG: Verification check', {
        docId: docRef.id,
        exists: verifySnap.exists(),
        data: verifySnap.exists() ? verifySnap.data() : null
      });
      
      // Get game details to find the host and send notification
      try {
        console.log('🔔 Creating notification for game host...', {
          gameId: applicationData.gameId,
          playerId: applicationData.playerId,
          playerName: applicationData.playerName
        });
        
        const gameRef = doc(db, 'games', applicationData.gameId);
        const gameSnap = await getDoc(gameRef);
        
        if (gameSnap.exists()) {
          const gameData = gameSnap.data();
          const gameHostId = gameData.createdById;
          
          console.log('🔔 Game found for notification:', {
            gameId: applicationData.gameId,
            gameHostId,
            applicantId: applicationData.playerId,
            location: gameData.location
          });
          
          if (gameHostId && gameHostId !== applicationData.playerId) {
            console.log('🔔 About to create notification for host:', gameHostId);
            
            // Create notification for the game host
            const notificationResult = await notificationService.createNotification({
              userId: gameHostId,
              type: 'game_application',
              title: 'New Game Application! 🏓',
              message: `${applicationData.playerName || 'Someone'} applied to join your game at ${gameData.location}`,
              fromUserId: applicationData.playerId,
              gameId: applicationData.gameId,
              applicationId: docRef.id
            });
            
            console.log('🔔 Game application notification result:', notificationResult);
            console.log('🔔 Game application notification sent to host:', gameHostId);
          } else {
            console.log('🔔 Skipping notification - host is same as applicant or host ID not found', {
              gameHostId,
              applicantId: applicationData.playerId,
              areEqual: gameHostId === applicationData.playerId
            });
          }
        } else {
          console.log('🔔 Game not found for notification:', applicationData.gameId);
        }
      } catch (notificationError) {
        // Don't fail the entire application if notification fails
        console.error('🔔 Failed to send game application notification:', notificationError);
      }
      
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
      // Get application details first to send notification
      const applicationRef = doc(db, 'applications', applicationId);
      const applicationSnap = await getDoc(applicationRef);
      
      if (!applicationSnap.exists()) {
        return { success: false, error: 'Application not found' };
      }
      
      const applicationData = applicationSnap.data();
      
      // Update the application status
      await updateDoc(applicationRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      // Send notification to the applicant about status change
      if (status === 'accepted' || status === 'rejected') {
        try {
          console.log('🔔 Creating status update notification for applicant...');
          
          // Get game details for better notification message
          const gameRef = doc(db, 'games', applicationData.gameId);
          const gameSnap = await getDoc(gameRef);
          
          let gameLocation = 'the game';
          if (gameSnap.exists()) {
            gameLocation = gameSnap.data().location || 'the game';
          }
          
          const statusEmoji = status === 'accepted' ? '🎉' : '😔';
          const statusMessage = status === 'accepted' 
            ? `Your application to join the game at ${gameLocation} was accepted!`
            : `Your application to join the game at ${gameLocation} was declined.`;
          
          await notificationService.createNotification({
            userId: applicationData.playerId,
            type: 'application_status',
            title: `Application ${status === 'accepted' ? 'Accepted' : 'Declined'} ${statusEmoji}`,
            message: statusMessage,
            gameId: applicationData.gameId,
            applicationId: applicationId,
            status: status
          });
          
          console.log('🔔 Application status notification sent to applicant:', applicationData.playerId);
        } catch (notificationError) {
          // Don't fail the update if notification fails
          console.error('🔔 Failed to send application status notification:', notificationError);
        }
      }
      
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
    console.log('🔍 LISTENER DEBUG: Setting up listener for userId:', userId);
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('playerId', '==', userId));
    
    console.log('🔍 LISTENER DEBUG: Query created, about to call onSnapshot');
    
    return onSnapshot(q, (snapshot) => {
      console.log('🔍 LISTENER DEBUG: onSnapshot callback fired!', {
        userId,
        snapshotSize: snapshot.size,
        snapshotEmpty: snapshot.empty,
        docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
      });
      
      const applications = [];
      snapshot.forEach(doc => {
        const appData = { id: doc.id, ...doc.data() };
        console.log('🔍 USER_LISTENER: Found application for user', {
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
    console.log('🔍 HOST_LISTENER: Setting up host applications listener for:', userId);
    try {
      // Get all applications and filter on client side
      const applicationsRef = collection(db, 'applications');
      
      return onSnapshot(applicationsRef, async (snapshot) => {
        console.log('🔍 HOST_LISTENER: Applications snapshot fired with', snapshot.size, 'documents');
        
        try {
          // First get all games created by this user
          const gamesRef = collection(db, 'games');
          console.log('🔍 HOST_LISTENER: About to fetch games for userId:', userId);
          const gamesSnapshot = await getDocs(gamesRef);
          console.log('🔍 HOST_LISTENER: Games snapshot returned', gamesSnapshot.size, 'games');
          
          const userGameIds = new Set();
          gamesSnapshot.forEach(doc => {
            const gameData = doc.data();
            console.log('🔍 HOST_LISTENER: Checking game:', doc.id, 'createdById:', gameData.createdById, 'vs userId:', userId);
            if (gameData.createdById === userId) {
              userGameIds.add(doc.id);
              console.log('🔍 HOST_LISTENER: Added user game:', doc.id);
            }
          });
          
          console.log('🔍 HOST_LISTENER: User games found:', Array.from(userGameIds));
          
          if (userGameIds.size === 0) {
            console.log('🔍 HOST_LISTENER: No games found for user, calling callback with empty array');
            callback([]);
            return;
          }
          
          // Filter applications for user's games
          const applications = [];
          snapshot.forEach(doc => {
            const appData = { id: doc.id, ...doc.data() };
            console.log('🔍 HOST_LISTENER: Checking application:', appData.id, 'gameId:', appData.gameId, 'in userGames?', userGameIds.has(appData.gameId));
            if (userGameIds.has(appData.gameId)) {
              applications.push(appData);
              console.log('🔍 HOST_LISTENER: Added application:', appData.id);
            }
          });
          
          console.log('🔍 HOST_LISTENER: Filtered applications:', applications.length);
          
          // Sort by appliedAt on the client side
          applications.sort((a, b) => {
            const aTime = a.appliedAt?.toDate?.() || new Date(0);
            const bTime = b.appliedAt?.toDate?.() || new Date(0);
            return bTime - aTime;
          });
          
          console.log('🔍 HOST_LISTENER: Calling callback with', applications.length, 'applications');
          callback(applications);
        } catch (innerError) {
          console.error('🔍 HOST_LISTENER: Error in snapshot callback:', innerError);
          callback([]);
        }
      }, (error) => {
        console.error('🔍 HOST_LISTENER: Error in applications listener:', error);
        callback([]);
      });
    } catch (error) {
      console.error('🔍 HOST_LISTENER: Error setting up host applications listener:', error);
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
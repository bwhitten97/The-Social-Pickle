import { 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  query, 
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const userService = {
  /**
   * Get a user's complete profile data by user ID
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} User profile data or null if not found
   */
  async getUserProfile(userId) {
    try {
      if (!userId) {
        console.warn('userService: getUserProfile called with empty userId');
        return { success: false, error: 'User ID is required', user: null };
      }

      console.log('userService: Fetching profile for user:', userId);
      
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log('userService: Found user profile:', {
          id: userId,
          name: userData.name,
          hasBasicInfo: !!(userData.age && userData.gender && userData.skillLevel)
        });
        
        return {
          success: true,
          user: {
            id: userId,
            ...userData
          }
        };
      } else {
        console.warn('userService: User profile not found for ID:', userId);
        return { success: false, error: 'User profile not found', user: null };
      }
    } catch (error) {
      console.error('userService: Error fetching user profile:', error);
      return { success: false, error: error.message, user: null };
    }
  },

  /**
   * Get multiple users' profile data by their IDs
   * @param {Array<string>} userIds - Array of user IDs
   * @returns {Promise<Object>} Object with user profiles keyed by user ID
   */
  async getUserProfiles(userIds) {
    try {
      if (!userIds || userIds.length === 0) {
        return { success: true, users: {} };
      }

      console.log('userService: Fetching profiles for users:', userIds);
      
      const users = {};
      const fetchPromises = userIds.map(async (userId) => {
        const result = await this.getUserProfile(userId);
        if (result.success && result.user) {
          users[userId] = result.user;
        }
        return result;
      });

      await Promise.all(fetchPromises);
      
      console.log('userService: Fetched profiles for', Object.keys(users).length, 'users');
      return { success: true, users };
    } catch (error) {
      console.error('userService: Error fetching user profiles:', error);
      return { success: false, error: error.message, users: {} };
    }
  },

  /**
   * Search for users by name (for chat/messaging purposes)
   * @param {string} searchTerm - Name to search for
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise<Array>} Array of matching user profiles
   */
  async searchUsersByName(searchTerm, limit = 10) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return { success: false, error: 'Search term must be at least 2 characters', users: [] };
      }

      console.log('userService: Searching for users with name:', searchTerm);
      
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const matchingUsers = [];
      const searchTermLower = searchTerm.toLowerCase();
      
      snapshot.forEach(doc => {
        const userData = doc.data();
        const userName = userData.name || '';
        
        // Simple name matching - you could enhance this with better search logic
        if (userName.toLowerCase().includes(searchTermLower) && matchingUsers.length < limit) {
          matchingUsers.push({
            id: doc.id,
            ...userData
          });
        }
      });
      
      console.log('userService: Found', matchingUsers.length, 'matching users');
      return { success: true, users: matchingUsers };
    } catch (error) {
      console.error('userService: Error searching users:', error);
      return { success: false, error: error.message, users: [] };
    }
  },

  /**
   * Get user profile data with chat-specific formatting
   * This includes the full profile data needed for chat profile modals
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} Chat-formatted user profile
   */
  async getChatUserProfile(userId) {
    try {
      const result = await this.getUserProfile(userId);
      
      if (!result.success || !result.user) {
        return result;
      }

      const user = result.user;
      
      // Format user data for chat components
      const chatProfile = {
        id: user.id,
        name: user.name || 'Unknown User',
        age: user.age,
        gender: user.gender,
        skillLevel: user.skillLevel,
        duprRating: user.duprRating || 'unrated',
        availability: user.availability || [],
        bio: user.bio || '',
        profilePicture: user.profilePicture || '',
        location: user.location,
        
        // Generate avatar initials if no profile picture
        avatar: this.generateUserInitials(user.name || 'U'),
        
        // Additional chat-specific data
        isOnline: true, // You could enhance this with real online status
        lastSeen: user.updatedAt || user.createdAt
      };

      return { success: true, user: chatProfile };
    } catch (error) {
      console.error('userService: Error getting chat user profile:', error);
      return { success: false, error: error.message, user: null };
    }
  },

  /**
   * Set up a real-time listener for a user's profile changes
   * @param {string} userId - The user's ID to listen to
   * @param {Function} callback - Callback function to handle profile updates
   * @returns {Function} Unsubscribe function
   */
  setupUserProfileListener(userId, callback) {
    if (!userId) {
      console.warn('userService: setupUserProfileListener called with empty userId');
      return () => {};
    }

    console.log('userService: Setting up profile listener for user:', userId);
    
    const userDocRef = doc(db, 'users', userId);
    
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = { id: doc.id, ...doc.data() };
        console.log('userService: Profile updated for user:', userId);
        callback({ success: true, user: userData });
      } else {
        console.warn('userService: User profile no longer exists:', userId);
        callback({ success: false, error: 'User profile not found', user: null });
      }
    }, (error) => {
      console.error('userService: Error in profile listener:', error);
      callback({ success: false, error: error.message, user: null });
    });
  },

  /**
   * Helper function to generate user initials from name
   * @param {string} name - User's full name
   * @returns {string} User initials (max 2 characters)
   */
  generateUserInitials(name) {
    if (!name || typeof name !== 'string') return '?';
    
    const trimmedName = name.trim();
    if (trimmedName.length === 0) return '?';
    
    const words = trimmedName.split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      // Single name - return first character
      return words[0][0].toUpperCase();
    } else if (words.length >= 2) {
      // Multiple names - return first letter of first and last name
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    
    return trimmedName[0].toUpperCase();
  },

  /**
   * Check if a user profile has complete information
   * @param {Object} userProfile - User profile object
   * @returns {boolean} True if profile is complete
   */
  isProfileComplete(userProfile) {
    if (!userProfile) return false;
    
    const requiredFields = ['name', 'age', 'gender', 'skillLevel'];
    return requiredFields.every(field => userProfile[field] && userProfile[field] !== '');
  },

  /**
   * Get basic user info (name, avatar) for chat lists
   * This is a lightweight version for performance
   * @param {string} userId - The user's ID
   * @returns {Promise<Object>} Basic user info
   */
  async getBasicUserInfo(userId) {
    try {
      if (!userId) {
        return { success: false, error: 'User ID is required', user: null };
      }

      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        return {
          success: true,
          user: {
            id: userId,
            name: userData.name || 'Unknown User',
            profilePicture: userData.profilePicture || '',
            avatar: this.generateUserInitials(userData.name || 'U')
          }
        };
      } else {
        return { success: false, error: 'User not found', user: null };
      }
    } catch (error) {
      console.error('userService: Error fetching basic user info:', error);
      return { success: false, error: error.message, user: null };
    }
  }
};

export default userService;
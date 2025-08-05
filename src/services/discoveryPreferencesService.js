import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const discoveryPreferencesService = {
  // Get user's discovery preferences
  async getUserPreferences(userId) {
    try {
      const preferencesRef = doc(db, 'discoveryPreferences', userId);
      const preferencesSnap = await getDoc(preferencesRef);
      
      if (preferencesSnap.exists()) {
        return { success: true, preferences: preferencesSnap.data() };
      } else {
        // Return default preferences if none exist
        return {
          success: true,
          preferences: {
            filter: 'All',
            advancedFilters: {
              duprRange: { min: 1.0, max: 5.5 },
              gender: 'any',
              playStyle: 'any',
              ageRange: { min: 18, max: 80 },
              availability: []
            },
            currentIndex: 0,
            lastUpdated: null
          }
        };
      }
    } catch (error) {
      console.error('Error fetching discovery preferences:', error);
      return { success: false, error: error.message };
    }
  },

  // Save user's discovery preferences
  async saveUserPreferences(userId, preferences) {
    try {
      const preferencesRef = doc(db, 'discoveryPreferences', userId);
      
      const updatedPreferences = {
        ...preferences,
        lastUpdated: serverTimestamp()
      };
      
      await setDoc(preferencesRef, updatedPreferences, { merge: true });
      
      console.log('✅ Discovery preferences saved:', updatedPreferences);
      return { success: true };
    } catch (error) {
      console.error('❌ Error saving discovery preferences:', error);
      return { success: false, error: error.message };
    }
  },

  // Update only the current discovery position
  async updateCurrentIndex(userId, currentIndex) {
    try {
      const preferencesRef = doc(db, 'discoveryPreferences', userId);
      
      await updateDoc(preferencesRef, {
        currentIndex,
        lastUpdated: serverTimestamp()
      });
      
      console.log('✅ Discovery position updated:', currentIndex);
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating discovery position:', error);
      return { success: false, error: error.message };
    }
  },

  // Update only the filter preferences (not position)
  async updateFilterPreferences(userId, filter, advancedFilters) {
    try {
      const preferencesRef = doc(db, 'discoveryPreferences', userId);
      
      await updateDoc(preferencesRef, {
        filter,
        advancedFilters,
        lastUpdated: serverTimestamp()
      });
      
      console.log('✅ Filter preferences updated:', { filter, advancedFilters });
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating filter preferences:', error);
      return { success: false, error: error.message };
    }
  },

  // Reset all preferences to defaults
  async resetPreferences(userId) {
    try {
      const defaultPreferences = {
        filter: 'All',
        advancedFilters: {
          duprRange: { min: 1.0, max: 5.5 },
          gender: 'any',
          playStyle: 'any',
          ageRange: { min: 18, max: 80 },
          availability: []
        },
        currentIndex: 0,
        lastUpdated: serverTimestamp()
      };
      
      const preferencesRef = doc(db, 'discoveryPreferences', userId);
      await setDoc(preferencesRef, defaultPreferences);
      
      console.log('✅ Discovery preferences reset to defaults');
      return { success: true, preferences: defaultPreferences };
    } catch (error) {
      console.error('❌ Error resetting preferences:', error);
      return { success: false, error: error.message };
    }
  }
};
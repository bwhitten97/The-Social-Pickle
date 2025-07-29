// Migration script to add location to existing users
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { config } from '../config/app';

export const migrateUsersLocation = async () => {
  try {
    console.log('Starting user location migration...');
    
    // Get all users
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    // Process each user
    for (const userDoc of snapshot.docs) {
      const userData = userDoc.data();
      
      // Skip if user already has location
      if (userData.location) {
        skippedCount++;
        continue;
      }
      
      // Add default location
      try {
        await updateDoc(doc(db, 'users', userDoc.id), {
          location: config.DEFAULT_LOCATION,
          updatedAt: new Date()
        });
        migratedCount++;
        console.log(`Migrated user ${userDoc.id}`);
      } catch (error) {
        console.error(`Failed to migrate user ${userDoc.id}:`, error);
      }
    }
    
    console.log(`Migration complete. Migrated: ${migratedCount}, Skipped: ${skippedCount}`);
    return { success: true, migrated: migratedCount, skipped: skippedCount };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, error: error.message };
  }
};

// Function to run migration on app startup (optional)
export const checkAndMigrateUsers = async () => {
  const migrationKey = 'location_migration_completed';
  
  // Check if migration has already been run
  const migrationCompleted = localStorage.getItem(migrationKey);
  if (migrationCompleted) {
    console.log('Location migration already completed');
    return;
  }
  
  // Run migration
  const result = await migrateUsersLocation();
  
  if (result.success) {
    // Mark migration as completed
    localStorage.setItem(migrationKey, new Date().toISOString());
    console.log('Location migration marked as completed');
  }
};
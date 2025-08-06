/**
 * User City Migration Script
 * Assigns default city to existing users without city data
 * Run with: node migrate-users-city.js
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase config - Use environment variables for security
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "demo-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.FIREBASE_APP_ID || "1:000000000000:web:demo",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-DEMO"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const DEFAULT_CITY = 'Chicago'; // Your current primary city

const migrateUsersToCity = async () => {
  console.log('🚀 Starting User City Migration');
  console.log('================================\n');
  
  try {
    console.log('📝 Fetching all users...');
    const usersRef = collection(db, 'users');
    const allUsersSnapshot = await getDocs(usersRef);
    
    let totalUsers = 0;
    let usersWithCity = 0;
    let usersWithoutCity = 0;
    let migrationCount = 0;
    
    const usersToMigrate = [];
    
    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      totalUsers++;
      
      if (!userData.city) {
        usersWithoutCity++;
        usersToMigrate.push({ id: doc.id, data: userData });
      } else {
        usersWithCity++;
      }
    });
    
    console.log(`📊 Migration Analysis:`);
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Users with city: ${usersWithCity}`);
    console.log(`   Users without city: ${usersWithoutCity}`);
    console.log(`   Users to migrate: ${usersToMigrate.length}\n`);
    
    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration! All users have city data.');
      return;
    }
    
    console.log(`🔄 Starting migration of ${usersToMigrate.length} users to ${DEFAULT_CITY}...\n`);
    
    // Migrate users in batches to avoid rate limiting
    for (let i = 0; i < usersToMigrate.length; i++) {
      const userToMigrate = usersToMigrate[i];
      
      try {
        const userRef = doc(db, 'users', userToMigrate.id);
        await updateDoc(userRef, {
          city: DEFAULT_CITY,
          updatedAt: new Date()
        });
        
        migrationCount++;
        console.log(`✅ [${migrationCount}/${usersToMigrate.length}] Migrated user ${userToMigrate.data.name || userToMigrate.data.email || userToMigrate.id} to ${DEFAULT_CITY}`);
        
        // Rate limiting - wait 100ms between updates
        if (i < usersToMigrate.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`❌ Failed to migrate user ${userToMigrate.id}:`, error.message);
      }
    }
    
    console.log('\n================================');
    console.log('🏁 Migration Complete!');
    console.log('================================');
    console.log(`✅ Successfully migrated ${migrationCount} users to ${DEFAULT_CITY}`);
    console.log(`❌ Failed to migrate ${usersToMigrate.length - migrationCount} users`);
    
    if (migrationCount === usersToMigrate.length) {
      console.log('\n🎉 ALL USERS SUCCESSFULLY MIGRATED!');
      console.log('🔒 City-based filtering is now fully secure.');
      console.log('🚀 App is ready for multi-city launch.');
    }
    
  } catch (error) {
    console.error('❌ Fatal error during migration:', error);
  }
};

// Run the migration
migrateUsersToCity().catch((error) => {
  console.error('❌ Unhandled error in migration:', error);
  process.exit(1);
});
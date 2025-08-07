// Migration script to add city field to existing users
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBd3jPwosw1YusjQPTePKMEkErb0rQ5BiA",
  authDomain: "the-social-pickle-6be90.firebaseapp.com",
  projectId: "the-social-pickle-6be90",
  storageBucket: "the-social-pickle-6be90.firebasestorage.app",
  messagingSenderId: "540638001787",
  appId: "1:540638001787:web:46337ea06eee5c55f6c0de",
  measurementId: "G-WCJS8GDG0N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const migrateUsersCity = async () => {
  console.log('🚀 Starting city migration for existing users...');
  
  try {
    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    console.log(`📊 Found ${usersSnapshot.size} total users`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      console.log(`\n👤 Processing user: ${userData.name || 'Unnamed'} (${userId})`);
      console.log(`   Current city: ${userData.city || 'NOT SET'}`);
      
      // Skip if user already has a city
      if (userData.city) {
        console.log(`   ✅ User already has city: ${userData.city}, skipping`);
        skippedCount++;
        continue;
      }
      
      // Add default city (Chicago) to users without city
      try {
        await updateDoc(doc(db, 'users', userId), {
          city: 'Chicago',
          updatedAt: new Date()
        });
        
        console.log(`   ✅ Successfully added city: Chicago`);
        migratedCount++;
      } catch (updateError) {
        console.error(`   ❌ Failed to update user ${userId}:`, updateError);
      }
    }
    
    console.log(`\n🎉 Migration completed!`);
    console.log(`   📊 Users migrated: ${migratedCount}`);
    console.log(`   📊 Users skipped: ${skippedCount}`);
    console.log(`   📊 Total processed: ${migratedCount + skippedCount}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
  }
};

// Run the migration
migrateUsersCity().then(() => {
  console.log('\n✨ Script finished');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
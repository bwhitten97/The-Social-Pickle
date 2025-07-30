// Check if applications exist for current user
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBd3jPwosw1YusjQPTePKMEkErb0rQ5BiA",
  authDomain: "the-social-pickle-6be90.firebaseapp.com",
  projectId: "the-social-pickle-6be90",
  storageBucket: "the-social-pickle-6be90.firebasestorage.app",
  messagingSenderId: "540638001787",
  appId: "1:540638001787:web:46337ea06eee5c55f6c0de"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkCurrentUserApps() {
  const currentUserId = '0zef7rTurfMFIJiuqTlvCQVhwAY2';
  
  console.log(`🔍 Checking applications for user: ${currentUserId}`);
  
  try {
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('playerId', '==', currentUserId));
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} applications for current user\n`);
    
    if (snapshot.size > 0) {
      snapshot.forEach(doc => {
        const app = doc.data();
        console.log(`Application ID: ${doc.id}`);
        console.log(`  Game ID: ${app.gameId}`);
        console.log(`  Player ID: ${app.playerId}`);
        console.log(`  Status: ${app.status}`);
        console.log(`  Applied At: ${app.appliedAt?.toDate?.() || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('❌ No applications found for current user');
      console.log('This means either:');
      console.log('  1. Applications weren\'t created properly');
      console.log('  2. User ID mismatch');
      console.log('  3. Firestore permissions issue');
    }
    
  } catch (error) {
    console.error('Error checking applications:', error);
  }
}

checkCurrentUserApps().then(() => {
  process.exit(0);
});
// Check applications for a specific user
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

// Get user ID from command line
const userId = process.argv[2];

async function checkUserApplications() {
  if (!userId) {
    console.log('Please provide a user ID as argument');
    console.log('Usage: node check-specific-user.js <userId>');
    return;
  }
  
  console.log(`\n🔍 Checking applications for user ID: ${userId}\n`);
  
  try {
    // Query applications for this specific user
    const applicationsRef = collection(db, 'applications');
    const q = query(applicationsRef, where('playerId', '==', userId));
    const snapshot = await getDocs(q);
    
    console.log(`Found ${snapshot.size} applications for this user\n`);
    
    if (snapshot.size > 0) {
      snapshot.forEach(doc => {
        const app = doc.data();
        console.log(`Application ID: ${doc.id}`);
        console.log(`  Game ID: ${app.gameId}`);
        console.log(`  Status: ${app.status}`);
        console.log(`  Applied At: ${app.appliedAt?.toDate?.() || 'N/A'}`);
        console.log('');
      });
    }
    
    // Also check games created by this user
    console.log(`\n🎮 Checking games created by user ID: ${userId}\n`);
    const gamesRef = collection(db, 'games');
    const gamesQuery = query(gamesRef, where('createdById', '==', userId));
    const gamesSnapshot = await getDocs(gamesQuery);
    
    console.log(`Found ${gamesSnapshot.size} games created by this user\n`);
    
    if (gamesSnapshot.size > 0) {
      gamesSnapshot.forEach(doc => {
        const game = doc.data();
        console.log(`Game ID: ${doc.id}`);
        console.log(`  Location: ${game.location}`);
        console.log(`  Open Spots: ${game.openSpots}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserApplications().then(() => {
  process.exit(0);
});
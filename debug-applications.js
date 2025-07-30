// Debug script to check what's in the applications collection
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function debugApplications() {
  console.log('🔍 Debugging applications in Firestore...\n');
  
  try {
    // Get all applications
    const applicationsSnapshot = await getDocs(collection(db, 'applications'));
    
    console.log(`Total applications in database: ${applicationsSnapshot.size}\n`);
    
    if (applicationsSnapshot.size === 0) {
      console.log('❌ No applications found in Firestore!');
      console.log('This means applications are NOT being created at all.\n');
    } else {
      console.log('Applications found:');
      applicationsSnapshot.forEach(doc => {
        const app = doc.data();
        console.log(`\nApplication ID: ${doc.id}`);
        console.log(`  Player ID: ${app.playerId}`);
        console.log(`  Player Name: ${app.playerName}`);
        console.log(`  Game ID: ${app.gameId}`);
        console.log(`  Status: ${app.status}`);
        console.log(`  Applied At: ${app.appliedAt?.toDate?.() || 'N/A'}`);
      });
    }
    
    // Also check games to see if they exist
    console.log('\n\n🎮 Checking games collection...');
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    console.log(`Total games in database: ${gamesSnapshot.size}`);
    
    if (gamesSnapshot.size > 0) {
      console.log('\nGames found:');
      gamesSnapshot.forEach(doc => {
        const game = doc.data();
        console.log(`\nGame ID: ${doc.id}`);
        console.log(`  Location: ${game.location}`);
        console.log(`  Created By: ${game.createdBy}`);
        console.log(`  Created By ID: ${game.createdById}`);
        console.log(`  Open Spots: ${game.openSpots}`);
      });
    }
    
  } catch (error) {
    console.error('Error debugging:', error);
  }
}

debugApplications().then(() => {
  console.log('\n✅ Debug complete');
  process.exit(0);
});
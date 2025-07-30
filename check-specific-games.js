// Check specific games
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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

async function checkSpecificGames() {
  const gameIds = ['77fHWTlEfTh713J5Pkt2', 'AmT64CdEVVJnGKYJEi23'];
  
  console.log('🎮 Checking specific games that user applied to...\n');
  
  for (const gameId of gameIds) {
    try {
      const gameDoc = await getDoc(doc(db, 'games', gameId));
      
      if (gameDoc.exists()) {
        const game = gameDoc.data();
        console.log(`Game ID: ${gameId}`);
        console.log(`  Location: ${game.location}`);
        console.log(`  Status: ${game.status}`);
        console.log(`  Created By: ${game.createdBy}`);
        console.log(`  Created By ID: ${game.createdById}`);
        console.log(`  Date: ${game.date}`);
        console.log(`  Time: ${game.time}`);
        console.log('');
      } else {
        console.log(`❌ Game ${gameId} does NOT exist!`);
      }
    } catch (error) {
      console.error(`Error checking game ${gameId}:`, error.message);
    }
  }
}

checkSpecificGames().then(() => {
  process.exit(0);
});
// Check why specific game isn't loading
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

async function checkMissingGame() {
  const gameId = '3LGGG9pvF2WRsUoUYpyc';
  
  console.log(`🔍 Checking why game ${gameId} isn't loading...`);
  
  try {
    const gameDoc = await getDoc(doc(db, 'games', gameId));
    
    if (gameDoc.exists()) {
      const game = gameDoc.data();
      console.log('✅ Game EXISTS in Firestore:');
      console.log(`  Location: ${game.location}`);
      console.log(`  Status: ${game.status}`);
      console.log(`  Created By: ${game.createdBy}`);
      console.log(`  Created By ID: ${game.createdById}`);
      console.log(`  Date: ${game.date}`);
      console.log(`  Time: ${game.time}`);
      console.log(`  Full game data:`, game);
      
      // Check why it might be filtered out
      console.log('\n🔍 Checking filtering conditions:');
      console.log(`  Status is 'active': ${game.status === 'active'}`);
      
      if (game.status !== 'active') {
        console.log(`❌ FILTERING ISSUE: Game status is '${game.status}', not 'active'`);
      }
      
    } else {
      console.log('❌ Game does NOT exist in Firestore');
    }
    
  } catch (error) {
    console.error('Error checking game:', error);
  }
}

checkMissingGame().then(() => {
  process.exit(0);
});
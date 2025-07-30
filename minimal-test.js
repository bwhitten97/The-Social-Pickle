// Minimal test to see what's actually in Firestore right now
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

async function minimalTest() {
  const currentUserId = '0zef7rTurfMFIJiuqTlvCQVhwAY2';
  
  console.log('🔍 MINIMAL TEST - Current state of Firestore');
  console.log(`User ID: ${currentUserId}\n`);
  
  try {
    // Check applications
    console.log('1. APPLICATIONS:');
    const appsQuery = query(collection(db, 'applications'), where('playerId', '==', currentUserId));
    const appsSnapshot = await getDocs(appsQuery);
    
    console.log(`   Found ${appsSnapshot.size} applications for user`);
    appsSnapshot.forEach(doc => {
      const app = doc.data();
      console.log(`   - App ${doc.id}: gameId=${app.gameId}, status=${app.status}`);
    });
    
    // Check first few games  
    console.log('\n2. GAMES (first 5):');
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    let count = 0;
    gamesSnapshot.forEach(doc => {
      if (count < 5) {
        const game = doc.data();
        console.log(`   - Game ${doc.id}: ${game.location}, status=${game.status}`);
        count++;
      }
    });
    
    console.log(`\n   Total games in database: ${gamesSnapshot.size}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

minimalTest().then(() => {
  process.exit(0);
});
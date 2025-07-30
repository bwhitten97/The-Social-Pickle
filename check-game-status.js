// Check game status fields
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

async function checkGameStatus() {
  console.log('🎮 Checking game status fields...\n');
  
  try {
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    
    let activeGames = 0;
    let gamesWithoutStatus = 0;
    let otherStatus = {};
    
    gamesSnapshot.forEach(doc => {
      const game = doc.data();
      
      if (!game.status) {
        gamesWithoutStatus++;
        console.log(`Game ${doc.id} (${game.location}) has NO status field`);
      } else if (game.status === 'active') {
        activeGames++;
      } else {
        otherStatus[game.status] = (otherStatus[game.status] || 0) + 1;
        console.log(`Game ${doc.id} (${game.location}) has status: ${game.status}`);
      }
    });
    
    console.log('\n📊 Summary:');
    console.log(`Total games: ${gamesSnapshot.size}`);
    console.log(`Active games: ${activeGames}`);
    console.log(`Games without status field: ${gamesWithoutStatus}`);
    console.log(`Other statuses:`, otherStatus);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkGameStatus().then(() => {
  process.exit(0);
});
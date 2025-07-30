// Create applications for games that are actually loading in the UI
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';

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

async function fixWithCurrentGames() {
  const currentUserId = '0zef7rTurfMFIJiuqTlvCQVhwAY2';
  const userName = 'Current User';
  
  // Games that ARE showing in the console logs (from availableGames array)
  const workingGameIds = [
    '3nDqoG43zSvwwOg6wBen', // These are from your latest screenshot
    'AmT64CdEVVJnGKYJEi23',
    'RwrMoJPFAkFkrfxOyH98'
  ];
  
  console.log('🔧 Creating applications for games that are actually loading...');
  
  try {
    // Delete all existing applications for this user
    console.log('1. Deleting old applications...');
    const oldAppsQuery = query(collection(db, 'applications'), where('playerId', '==', currentUserId));
    const oldAppsSnapshot = await getDocs(oldAppsQuery);
    
    for (const doc of oldAppsSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log(`   Deleted application ${doc.id}`);
    }
    
    // Create applications for games that are actually loading
    console.log('2. Creating applications for games that show in UI...');
    for (let i = 0; i < 2; i++) { // Create 2 applications
      const gameId = workingGameIds[i];
      const applicationData = {
        gameId,
        playerId: currentUserId,
        playerName: userName,
        playerSkill: 'Intermediate',
        playerCount: 1,
        message: `Working application ${i + 1} - for games that actually load`,
        status: 'pending',
        appliedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      console.log(`✅ Created application ${docRef.id} for game ${gameId}`);
    }
    
    console.log('🎉 Applications created for games that are definitely loading!');
    console.log('Now check "My Requests" - they should appear.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixWithCurrentGames().then(() => {
  process.exit(0);
});
// Fix applications for current user ID
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

async function fixCurrentUser() {
  const currentUserId = '0zef7rTurfMFIJiuqTlvCQVhwAY2';
  const userName = 'Current User';
  
  // Games that ARE loading (from console screenshots)
  const workingGameIds = [
    '3LGGG9pvF2WRsUoUYpyc', // Test Court
    'RwrMoJPFAkFkrfxOyH98'  // Host Court
  ];
  
  console.log('🔧 Creating applications for current user...');
  
  try {
    // Create applications for games that actually load
    for (let i = 0; i < workingGameIds.length; i++) {
      const gameId = workingGameIds[i];
      const applicationData = {
        gameId,
        playerId: currentUserId,
        playerName: userName,
        playerSkill: 'Intermediate',
        playerCount: 1,
        message: `Test application ${i + 1} - current user bug fix`,
        status: 'pending',
        appliedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      console.log(`✅ Created application ${docRef.id} for game ${gameId}`);
    }
    
    console.log('🎉 Applications created for current user! Check "My Requests" now.');
    
  } catch (error) {
    console.error('Error creating applications:', error);
  }
}

fixCurrentUser().then(() => {
  process.exit(0);
});
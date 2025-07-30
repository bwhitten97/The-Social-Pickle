// Quick fix: Create new applications for games that are actually loading
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

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

async function fixApplications() {
  const userId = 'EO56KNK3OONim5MS7sY9WJ7VtB23';
  const userName = 'test 4';
  
  // Games that ARE loading (from the console screenshot)
  const workingGameIds = [
    '3LGGG9pvF2WRsUoUYpyc',
    'RwrMoJPFAkFkrfxOyH98', 
    'szaC2Dm0wmSEGRr4bHil'
  ];
  
  console.log('🔧 Fixing applications by creating new ones for games that load...');
  
  try {
    // Delete existing broken applications
    console.log('1. Deleting old broken applications...');
    const oldAppsQuery = query(collection(db, 'applications'), where('playerId', '==', userId));
    const oldAppsSnapshot = await getDocs(oldAppsQuery);
    
    for (const doc of oldAppsSnapshot.docs) {
      await deleteDoc(doc.ref);
      console.log(`   Deleted application ${doc.id}`);
    }
    
    // Create new applications for games that actually load
    console.log('2. Creating new applications for working games...');
    for (let i = 0; i < 2; i++) { // Create 2 applications
      const gameId = workingGameIds[i];
      const applicationData = {
        gameId,
        playerId: userId,
        playerName: userName,
        playerSkill: 'Intermediate',
        playerCount: 1,
        message: `Fixed application ${i + 1} - testing the bug fix`,
        status: 'pending',
        appliedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'applications'), applicationData);
      console.log(`   Created application ${docRef.id} for game ${gameId}`);
    }
    
    console.log('✅ Applications fixed! Now test "My Requests" tab.');
    
  } catch (error) {
    console.error('Error fixing applications:', error);
  }
}

fixApplications().then(() => {
  process.exit(0);
});
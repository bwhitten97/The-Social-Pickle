import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCj8oGjgC8hFG5LvLh3m7wv7tKFcN7lAEs",
  authDomain: "the-social-pickle.firebaseapp.com",
  projectId: "the-social-pickle",
  storageBucket: "the-social-pickle.firebasestorage.app",
  messagingSenderId: "358052700329",
  appId: "1:358052700329:web:3a3a81d39f7a35cb30c3e0",
  measurementId: "G-6J9VYZFXED"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugApplications() {
  console.log('🔍 FIRESTORE DEBUG: Checking all applications in Firestore...');
  
  try {
    const applicationsRef = collection(db, 'applications');
    const snapshot = await getDocs(applicationsRef);
    
    console.log('🔍 FIRESTORE DEBUG: Found', snapshot.size, 'applications total');
    
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`🔍 FIRESTORE DEBUG: Application ${index + 1}:`, {
        id: doc.id,
        hasPlayerId: 'playerId' in data,
        hasUserId: 'userId' in data,
        playerId: data.playerId,
        userId: data.userId,
        gameId: data.gameId,
        status: data.status,
        playerName: data.playerName,
        allFields: Object.keys(data),
        fullData: data
      });
    });
    
    // Also check for your specific user ID
    const yourUserId = '0zef7rTurfMFIJiuqTlvCQVhwAY2';
    console.log('🔍 FIRESTORE DEBUG: Looking for applications for userId:', yourUserId);
    
    let foundForUser = 0;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.playerId === yourUserId || data.userId === yourUserId) {
        foundForUser++;
        console.log('🔍 FIRESTORE DEBUG: Found application for your user:', {
          id: doc.id,
          playerId: data.playerId,
          userId: data.userId,
          gameId: data.gameId,
          status: data.status
        });
      }
    });
    
    console.log('🔍 FIRESTORE DEBUG: Total applications for your user:', foundForUser);
    
  } catch (error) {
    console.error('🔍 FIRESTORE DEBUG: Error:', error);
  }
}

debugApplications();
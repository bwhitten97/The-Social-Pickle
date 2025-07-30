// Script to clean up bad applications in Firestore
// This removes applications where users applied to their own games

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBUVMEL-Hf0dJ2rN5YE61pCGNqLjqf3QII",
  authDomain: "social-pickle.firebaseapp.com",
  projectId: "social-pickle",
  storageBucket: "social-pickle.appspot.com",
  messagingSenderId: "368765905409",
  appId: "1:368765905409:web:ce9c3c988b4db5c45d8ad0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupBadApplications() {
  console.log('Starting cleanup of bad applications...');
  
  try {
    // Get all games
    const gamesSnapshot = await getDocs(collection(db, 'games'));
    const gamesByCreator = {};
    
    // Map games by creator ID
    gamesSnapshot.forEach(doc => {
      const game = doc.data();
      if (game.createdById) {
        if (!gamesByCreator[game.createdById]) {
          gamesByCreator[game.createdById] = [];
        }
        gamesByCreator[game.createdById].push(doc.id);
      }
    });
    
    console.log('Games by creator:', gamesByCreator);
    
    // Get all applications
    const applicationsSnapshot = await getDocs(collection(db, 'applications'));
    let badApplications = 0;
    let totalApplications = 0;
    
    for (const appDoc of applicationsSnapshot.docs) {
      totalApplications++;
      const application = appDoc.data();
      
      // Check if this user applied to their own game
      if (gamesByCreator[application.playerId]?.includes(application.gameId)) {
        console.log(`Found bad application: User ${application.playerName} (${application.playerId}) applied to their own game ${application.gameId}`);
        
        // Delete the bad application
        await deleteDoc(doc(db, 'applications', appDoc.id));
        badApplications++;
        console.log(`Deleted application ${appDoc.id}`);
      }
    }
    
    console.log(`\nCleanup complete!`);
    console.log(`Total applications checked: ${totalApplications}`);
    console.log(`Bad applications removed: ${badApplications}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupBadApplications().then(() => {
  console.log('Cleanup script finished');
  process.exit(0);
});
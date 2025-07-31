// Debug script to check Firebase message and notification data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBd3jPwosw1YusjQPTePKMEkErb0rQ5BiA",
  authDomain: "the-social-pickle-6be90.firebaseapp.com",
  projectId: "the-social-pickle-6be90",
  storageBucket: "the-social-pickle-6be90.firebasestorage.app",
  messagingSenderId: "540638001787",
  appId: "1:540638001787:web:46337ea06eee5c55f6c0de",
  measurementId: "G-WCJS8GDG0N"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugMessages() {
  console.log('🔍 DEBUG: Checking all messages in Firestore...');
  
  try {
    const messagesRef = collection(db, 'messages');
    const snapshot = await getDocs(messagesRef);
    
    console.log(`🔍 DEBUG: Found ${snapshot.size} total messages`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('🔍 MESSAGE:', {
        id: doc.id,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        toUserId: data.toUserId,
        toUserName: data.toUserName,
        message: data.message,
        participants: data.participants,
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
        read: data.read
      });
    });
  } catch (error) {
    console.error('🔍 ERROR fetching messages:', error);
  }
}

async function debugNotifications() {
  console.log('🔍 DEBUG: Checking all notifications in Firestore...');
  
  try {
    const notificationsRef = collection(db, 'notifications');
    const snapshot = await getDocs(notificationsRef);
    
    console.log(`🔍 DEBUG: Found ${snapshot.size} total notifications`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('🔍 NOTIFICATION:', {
        id: doc.id,
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        read: data.read,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
  } catch (error) {
    console.error('🔍 ERROR fetching notifications:', error);
  }
}

async function runDebug() {
  await debugMessages();
  console.log('\n' + '='.repeat(50) + '\n');
  await debugNotifications();
  process.exit(0);
}

runDebug();
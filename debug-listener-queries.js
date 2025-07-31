// Debug script to test the exact queries used by message and notification listeners
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

// Test user ID from the data - this is 'hope' who should be receiving messages
const testUserId = '49Ua1ZeZToae8KCenjjG7vp9K7u2';

async function testNotificationQuery() {
  console.log('🔍 Testing notification query for user:', testUserId);
  
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', testUserId)
    );
    
    const snapshot = await getDocs(q);
    console.log(`🔍 Found ${snapshot.size} notifications for user ${testUserId}`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('🔍 NOTIFICATION for user:', {
        id: doc.id,
        userId: data.userId,
        message: data.message,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
  } catch (error) {
    console.error('🔍 ERROR in notification query:', error);
  }
}

async function testMessageQuery() {
  console.log('🔍 Testing message query for user:', testUserId);
  
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', testUserId)
    );
    
    const snapshot = await getDocs(q);
    console.log(`🔍 Found ${snapshot.size} messages involving user ${testUserId}`);
    
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('🔍 MESSAGE involving user:', {
        id: doc.id,
        fromUserId: data.fromUserId,
        fromUserName: data.fromUserName,
        toUserId: data.toUserId,
        toUserName: data.toUserName,
        message: data.message,
        participants: data.participants,
        createdAt: data.createdAt?.toDate?.() || data.createdAt
      });
    });
  } catch (error) {
    console.error('🔍 ERROR in message query:', error);
  }
}

async function testConversationQuery() {
  // Test specific conversation between like and hope
  const userId1 = 'xsjn4uoaMbbf0OcjOudbbuHOFiy1'; // like
  const userId2 = '49Ua1ZeZToae8KCenjjG7vp9K7u2'; // hope
  
  console.log(`🔍 Testing conversation query between ${userId1} and ${userId2}`);
  
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains-any', [userId1, userId2])
    );
    
    const snapshot = await getDocs(q);
    console.log(`🔍 Found ${snapshot.size} messages in conversation`);
    
    const messages = [];
    snapshot.forEach(doc => {
      const messageData = { id: doc.id, ...doc.data() };
      // Only include messages between these two specific users
      if ((messageData.fromUserId === userId1 && messageData.toUserId === userId2) ||
          (messageData.fromUserId === userId2 && messageData.toUserId === userId1)) {
        messages.push(messageData);
        console.log('🔍 CONVERSATION MESSAGE:', {
          id: doc.id,
          from: `${messageData.fromUserName} (${messageData.fromUserId})`,
          to: `${messageData.toUserName} (${messageData.toUserId})`,
          message: messageData.message,
          createdAt: messageData.createdAt?.toDate?.() || messageData.createdAt
        });
      }
    });
    
    console.log(`🔍 After filtering: ${messages.length} messages in conversation`);
  } catch (error) {
    console.error('🔍 ERROR in conversation query:', error);
  }
}

async function runAllTests() {
  await testNotificationQuery();
  console.log('\n' + '='.repeat(50) + '\n');
  await testMessageQuery();
  console.log('\n' + '='.repeat(50) + '\n');
  await testConversationQuery();
  process.exit(0);
}

runAllTests();
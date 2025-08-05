import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';

export const notificationService = {
  // Create a new notification
  async createNotification(notificationData) {
    try {
      console.log('🔍 NOTIFICATION_SERVICE: createNotification called with data', notificationData);
      
      const notificationsRef = collection(db, 'notifications');
      console.log('🔍 NOTIFICATION_SERVICE: Got notifications collection reference');
      
      const newNotification = {
        ...notificationData,
        read: false,
        createdAt: serverTimestamp()
      };
      
      console.log('🔍 NOTIFICATION_SERVICE: About to add document to Firebase', newNotification);
      const docRef = await addDoc(notificationsRef, newNotification);
      console.log('🔍 NOTIFICATION_SERVICE: Successfully added document', { id: docRef.id, path: docRef.path });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('🔍 NOTIFICATION_SERVICE: Error creating notification:', error);
      return { success: false, error: error.message };
    }
  },

  // Get notifications for a specific user
  async getUserNotifications(userId) {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, notifications };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      return { success: false, error: error.message, notifications: [] };
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Set up real-time listener for user notifications
  setupNotificationsListener(userId, callback) {
    console.log('🔍 NOTIFICATION_SERVICE: Setting up notifications listener for userId:', userId);
    const notificationsRef = collection(db, 'notifications');
    // Remove orderBy to avoid composite index requirement
    const q = query(
      notificationsRef, 
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      console.log('🔍 NOTIFICATION_SERVICE: Notifications onSnapshot fired with', snapshot.size, 'documents');
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by createdAt on the client side
      notifications.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime; // Most recent first
      });
      
      console.log('🔍 NOTIFICATION_SERVICE: Calling callback with', notifications.length, 'notifications');
      callback(notifications);
    }, (error) => {
      console.error('🔍 NOTIFICATION_SERVICE: Error in notifications listener:', error);
      callback([]);
    });
  }
};

// Helper function to create notification for game application responses
export const createApplicationNotification = async (applicantId, hostName, gameData, status) => {
  console.log('🔍 NOTIFICATION_SERVICE: createApplicationNotification called', {
    applicantId,
    hostName,
    gameData,
    status
  });
  
  const notificationData = {
    userId: applicantId,
    type: 'application',
    title: status === 'accepted' ? 'Game Application Accepted!' : 
           status === 'applied' ? 'New Game Application!' :
           status === 'cancelled' ? 'Game Cancelled' :
           status === 'updated' ? 'Game Updated' :
           'Game Application Update',
    message: status === 'accepted' 
      ? `${hostName} accepted you into their game on ${gameData.date} at ${gameData.time}`
      : status === 'applied'
      ? `${hostName} applied to join your game on ${gameData.date} at ${gameData.time}`
      : status === 'cancelled'
      ? `${hostName} cancelled their game on ${gameData.date} at ${gameData.time}`
      : status === 'updated'
      ? `${hostName} updated their game details on ${gameData.date} at ${gameData.time}`
      : `${hostName} rejected your application for their game on ${gameData.date} at ${gameData.time}`,
    gameId: gameData.id,
    fromUserId: gameData.hostId,
    status: status
  };

  console.log('🔍 NOTIFICATION_SERVICE: About to create notification with data', notificationData);
  const result = await notificationService.createNotification(notificationData);
  console.log('🔍 NOTIFICATION_SERVICE: createApplicationNotification result', result);
  
  return result;
};
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  updateDoc,
  and
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { config } from '../config/app';

export const messageService = {
  // Build a deterministic key for a conversation between two users
  buildConversationKey(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  },
  // Mark messages as read in a conversation
  async markMessagesAsRead(userId1, userId2) {
    try {
      console.log('🔍 MESSAGE_SERVICE: Marking messages as read', { userId1, userId2 });
      
      const messagesRef = collection(db, 'messages');
      const conversationKey = [userId1, userId2].sort().join('_');
      const q = query(messagesRef, where('conversationKey', '==', conversationKey));
      
      const snapshot = await getDocs(q);
      const updatePromises = [];
      
      snapshot.forEach(doc => {
        const messageData = doc.data();
        // Mark messages as read if they were sent TO the current user and are unread
        if (messageData.toUserId === userId1 && !messageData.read) {
          const messageRef = doc.ref;
          updatePromises.push(updateDoc(messageRef, { read: true }));
        }
      });
      
      await Promise.all(updatePromises);
      console.log('🔍 MESSAGE_SERVICE: Marked', updatePromises.length, 'messages as read');
      
      return { success: true, markedCount: updatePromises.length };
    } catch (error) {
      console.error('🔍 MESSAGE_SERVICE: Error marking messages as read:', error);
      return { success: false, error: error.message };
    }
  },

  // Create a new message - SIMPLIFIED VERSION
  async createMessage(messageData) {
    try {
      console.log('🔍 MESSAGE_SERVICE: createMessage called with data', messageData);
      
      const messagesRef = collection(db, 'messages');
      console.log('🔍 MESSAGE_SERVICE: Got messages collection reference');
      
      const newMessage = {
        ...messageData,
        city: 'default', // Temporary default city
        createdAt: serverTimestamp(),
        read: false,
        participants: [messageData.fromUserId, messageData.toUserId], // Add participants array
        conversationKey: [messageData.fromUserId, messageData.toUserId].sort().join('_')
      };
      
      console.log('🔍 MESSAGE_SERVICE: About to add document to Firebase', newMessage);
      const docRef = await addDoc(messagesRef, newMessage);
      console.log('🔍 MESSAGE_SERVICE: Successfully added document', { id: docRef.id, path: docRef.path });
      
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('🔍 MESSAGE_SERVICE: Error creating message:', error);
      return { success: false, error: error.message };
    }
  },

  // Get conversation between two users - SIMPLIFIED VERSION
  async getConversation(userId1, userId2) {
    try {
      const messagesRef = collection(db, 'messages');
      const conversationKey = [userId1, userId2].sort().join('_');
      const q = query(messagesRef, where('conversationKey', '==', conversationKey));
      
      const snapshot = await getDocs(q);
      const messages = [];
      snapshot.forEach(doc => {
        const messageData = { id: doc.id, ...doc.data() };
        // Only include messages between these two specific users
        if ((messageData.fromUserId === userId1 && messageData.toUserId === userId2) ||
            (messageData.fromUserId === userId2 && messageData.toUserId === userId1)) {
          messages.push(messageData);
        }
      });
      
      // Sort by createdAt on the client side
      messages.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return aTime - bTime; // Oldest first for conversation order
      });
      
      return { success: true, messages };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return { success: false, error: error.message, messages: [] };
    }
  },

  // Get all chat rooms for a user
  async getUserChatRooms(userId) {
    try {
      const messagesRef = collection(db, 'messages');
      // Remove orderBy to avoid composite index requirement
      const q = query(
        messagesRef,
        where('participants', 'array-contains', userId)
      );
      
      const snapshot = await getDocs(q);
      const chatRooms = new Map();
      
      snapshot.forEach(doc => {
        const messageData = { id: doc.id, ...doc.data() };
        const otherUserId = messageData.fromUserId === userId ? messageData.toUserId : messageData.fromUserId;
        const otherUserName = messageData.fromUserId === userId ? messageData.toUserName : messageData.fromUserName;
        
        const chatId = `chat-${[userId, otherUserId].sort().join('-')}`;
        
        if (!chatRooms.has(chatId)) {
          chatRooms.set(chatId, {
            id: chatId,
            gameId: null,
            gameName: otherUserName,
            participants: [userId, otherUserId],
            createdAt: messageData.createdAt,
            lastMessage: messageData.message,
            lastMessageTime: messageData.createdAt,
            otherUserName: otherUserName,
            unreadCount: 0
          });
        } else {
          // Update with more recent message if this one is newer
          const existing = chatRooms.get(chatId);
          if (messageData.createdAt > existing.lastMessageTime) {
            existing.lastMessage = messageData.message;
            existing.lastMessageTime = messageData.createdAt;
          }
        }
      });
      
      return { success: true, chatRooms: Array.from(chatRooms.values()) };
    } catch (error) {
      console.error('Error fetching user chat rooms:', error);
      return { success: false, error: error.message, chatRooms: [] };
    }
  },

  // Set up real-time listener for conversation
  setupConversationListener(userId1, userId2, callback) {
    const messagesRef = collection(db, 'messages');
    const conversationKey = [userId1, userId2].sort().join('_');
    const q = query(messagesRef, where('conversationKey', '==', conversationKey));
    
    return onSnapshot(q, (snapshot) => {
      const messages = [];
      snapshot.forEach(doc => {
        const messageData = { id: doc.id, ...doc.data() };
        messages.push(messageData);
      });
      
      // Sort by createdAt on the client side
      messages.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return aTime - bTime; // Oldest first for conversation order
      });
      
      try {
        callback(messages);
      } catch (e) {
        console.error('Error delivering conversation listener callback:', e);
      }
    }, (error) => {
      console.error('Error in conversation listener:', error);
      // Do not clear UI on transient errors; keep last known messages
    });
  },

  // Set up real-time listener for user's chat rooms
  setupChatRoomsListener(userId, callback) {
    console.log('🔍 MESSAGE_SERVICE: Setting up chat rooms listener for userId:', userId);
    const messagesRef = collection(db, 'messages');
    // Remove orderBy to avoid composite index requirement
    const q = query(
      messagesRef,
      where('participants', 'array-contains', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      console.log('🔍 MESSAGE_SERVICE: Chat rooms onSnapshot fired with', snapshot.size, 'documents');
      const chatRooms = new Map();
      
      snapshot.forEach(doc => {
        const messageData = { id: doc.id, ...doc.data() };
        const otherUserId = messageData.fromUserId === userId ? messageData.toUserId : messageData.fromUserId;
        const otherUserName = messageData.fromUserId === userId ? messageData.toUserName : messageData.fromUserName;
        
        const chatId = `chat-${[userId, otherUserId].sort().join('-')}`;
        
        if (!chatRooms.has(chatId)) {
          chatRooms.set(chatId, {
            id: chatId,
            gameId: null,
            gameName: otherUserName,
            participants: [userId, otherUserId],
            createdAt: messageData.createdAt,
            lastMessage: messageData.message,
            lastMessageTime: messageData.createdAt,
            otherUserName: otherUserName,
            unreadCount: 0,
            messages: []
          });
        } else {
          // Update with more recent message if this one is newer
          const existing = chatRooms.get(chatId);
          if (messageData.createdAt > existing.lastMessageTime) {
            existing.lastMessage = messageData.message;
            existing.lastMessageTime = messageData.createdAt;
          }
        }
        
        // Add message to the chat room for unread count calculation
        chatRooms.get(chatId).messages.push(messageData);
      });
      
      // Calculate unread counts for each chat room
      chatRooms.forEach(chatRoom => {
        chatRoom.unreadCount = chatRoom.messages.filter(msg => 
          !msg.read && msg.fromUserId !== userId
        ).length;
      });
      
      const chatRoomsArray = Array.from(chatRooms.values());
      console.log('🔍 MESSAGE_SERVICE: Calling callback with', chatRoomsArray.length, 'chat rooms');
      try {
        callback(chatRoomsArray);
      } catch (e) {
        console.error('Error delivering chat rooms listener callback:', e);
      }
    }, (error) => {
      console.error('🔍 MESSAGE_SERVICE: Error in chat rooms listener:', error);
      // Do not clear chats on transient errors; keep last known list
    });
  }
};

// Helper function to send a message between users with city validation
export const sendMessageBetweenUsers = async (fromUserId, fromUserName, toUserId, toUserName, messageText) => {
  console.log('🔍 MESSAGE_SERVICE: sendMessageBetweenUsers called', {
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    messageText
  });
  
  const messageData = {
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    message: messageText,
    participants: [fromUserId, toUserId], // For easier querying
    conversationKey: [fromUserId, toUserId].sort().join('_')
  };

  console.log('🔍 MESSAGE_SERVICE: About to create message with data', messageData);
  const result = await messageService.createMessage(messageData);
  console.log('🔍 MESSAGE_SERVICE: createMessage result', result);
  
  return result;
};
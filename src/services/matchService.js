import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Match Service - Handles likes and matches in Firebase
 * 
 * Collections:
 * - likes: { id, likedBy, likedUser, createdAt }
 * - matches: { id, users[], createdAt, lastActivity }
 */

// Create a like document
export const createLike = async (currentUserId, likedUserId) => {
  try {
    // Create like document ID using both user IDs
    const likeId = `${currentUserId}_${likedUserId}`;
    
    // Check if like already exists
    const likeRef = doc(db, 'likes', likeId);
    const likeSnap = await getDoc(likeRef);
    
    if (likeSnap.exists()) {
      console.log('Like already exists');
      return { success: true, alreadyLiked: true };
    }
    
    // Create the like
    await setDoc(likeRef, {
      likedBy: currentUserId,
      likedUser: likedUserId,
      createdAt: serverTimestamp()
    });
    
    // Check if other user has liked back (to create a match)
    const reciprocalLikeId = `${likedUserId}_${currentUserId}`;
    const reciprocalLikeRef = doc(db, 'likes', reciprocalLikeId);
    const reciprocalLikeSnap = await getDoc(reciprocalLikeRef);
    
    if (reciprocalLikeSnap.exists()) {
      // It's a match! Create match document
      const match = await createMatch(currentUserId, likedUserId);
      return { success: true, isMatch: true, matchId: match.id };
    }
    
    return { success: true, isMatch: false };
  } catch (error) {
    console.error('Error creating like:', error);
    return { success: false, error: error.message };
  }
};

// Create a match document
export const createMatch = async (userId1, userId2) => {
  try {
    // Sort user IDs to ensure consistent match ID
    const sortedIds = [userId1, userId2].sort();
    const matchId = `${sortedIds[0]}_${sortedIds[1]}`;
    
    // Check if match already exists
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      console.log('Match already exists');
      return { id: matchId, ...matchSnap.data() };
    }
    
    // Create the match
    const matchData = {
      users: sortedIds,
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      active: true
    };
    
    await setDoc(matchRef, matchData);
    
    return { id: matchId, ...matchData };
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

// Get all matches for a user
export const getUserMatches = async (userId) => {
  try {
    const matchesRef = collection(db, 'matches');
    const q = query(
      matchesRef,
      where('users', 'array-contains', userId),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const matches = [];
    
    querySnapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return matches;
  } catch (error) {
    console.error('Error fetching matches:', error);
    return [];
  }
};

// Get all users who have liked the current user
export const getUsersWhoLikedMe = async (userId) => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('likedUser', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const likers = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      likers.push(data.likedBy);
    });
    
    return likers;
  } catch (error) {
    console.error('Error fetching likers:', error);
    return [];
  }
};

// Listen to real-time likes for a user
export const listenToIncomingLikes = (userId, callback) => {
  const likesRef = collection(db, 'likes');
  const q = query(
    likesRef,
    where('likedUser', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  return onSnapshot(q, (snapshot) => {
    const likes = [];
    snapshot.forEach((doc) => {
      likes.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(likes);
  });
};

// Listen to real-time matches for a user
export const listenToMatches = (userId, callback) => {
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('users', 'array-contains', userId),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const matches = [];
    snapshot.forEach((doc) => {
      matches.push({
        id: doc.id,
        ...doc.data()
      });
    });
    callback(matches);
  });
};

// Remove a match (unmatch)
export const removeMatch = async (matchId) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    await deleteDoc(matchRef);
    return { success: true };
  } catch (error) {
    console.error('Error removing match:', error);
    return { success: false, error: error.message };
  }
};

// Check if user has liked another user
export const hasUserLiked = async (userId, targetUserId) => {
  try {
    const likeId = `${userId}_${targetUserId}`;
    const likeRef = doc(db, 'likes', likeId);
    const likeSnap = await getDoc(likeRef);
    
    return likeSnap.exists();
  } catch (error) {
    console.error('Error checking like status:', error);
    return false;
  }
};

// Get match details with user information
export const getMatchWithUserInfo = async (matchId, currentUserId) => {
  try {
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (!matchSnap.exists()) {
      return null;
    }
    
    const matchData = matchSnap.data();
    const otherUserId = matchData.users.find(id => id !== currentUserId);
    
    // Get other user's information
    const userRef = doc(db, 'users', otherUserId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return {
      id: matchId,
      ...matchData,
      matchedUser: {
        id: otherUserId,
        ...userSnap.data()
      }
    };
  } catch (error) {
    console.error('Error fetching match with user info:', error);
    return null;
  }
};
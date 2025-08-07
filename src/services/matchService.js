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
  limit,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { config } from '../config/app';

/**
 * Match Service - Handles likes, passes, and matches in Firebase
 * 
 * Collections:
 * - likes: { id, likedBy, likedUser, createdAt }
 * - passes: { id, passedBy, passedUser, createdAt }
 * - matches: { id, users[], createdAt, lastActivity }
 */

// Create a like document with atomic match creation using transactions
export const createLike = async (currentUserId, likedUserId) => {
  try {
    // Run the entire like/match creation process in a transaction
    const result = await runTransaction(db, async (transaction) => {
      // SECURITY: Verify both users are from the same city
      const currentUserRef = doc(db, 'users', currentUserId);
      const likedUserRef = doc(db, 'users', likedUserId);
      
      const [currentUserSnap, likedUserSnap] = await Promise.all([
        transaction.get(currentUserRef),
        transaction.get(likedUserRef)
      ]);
      
      if (!currentUserSnap.exists() || !likedUserSnap.exists()) {
        throw new Error('One or both users not found');
      }
      
      const currentUserData = currentUserSnap.data();
      const likedUserData = likedUserSnap.data();
      
      // TEMPORARY: Disable city-based security check to restore functionality
      // TODO: Re-enable once city data is properly populated for all users
      /*
      if (!currentUserData.city || !likedUserData.city) {
        throw new Error('One or both users missing city data');
      }
      
      if (currentUserData.city !== likedUserData.city) {
        console.error('Cross-city like attempt blocked:', currentUserData.city, 'vs', likedUserData.city);
        throw new Error('Users must be from the same city');
      }
      */
      
      // Create like document references
      const likeId = `${currentUserId}_${likedUserId}`;
      const reciprocalLikeId = `${likedUserId}_${currentUserId}`;
      const likeRef = doc(db, 'likes', likeId);
      const reciprocalLikeRef = doc(db, 'likes', reciprocalLikeId);
      
      // Check if like already exists
      const likeSnap = await transaction.get(likeRef);
      if (likeSnap.exists()) {
        return { success: true, alreadyLiked: true };
      }
      
      // Check for reciprocal like
      const reciprocalLikeSnap = await transaction.get(reciprocalLikeRef);
      const isMatch = reciprocalLikeSnap.exists();
      
      // Create the like document
      transaction.set(likeRef, {
        likedBy: currentUserId,
        likedUser: likedUserId,
        city: currentUserData.city || 'default',
        createdAt: serverTimestamp()
      });
      
      let matchId = null;
      
      // If it's a match, create match document atomically
      if (isMatch) {
        const sortedIds = [currentUserId, likedUserId].sort();
        matchId = `${sortedIds[0]}_${sortedIds[1]}`;
        const matchRef = doc(db, 'matches', matchId);
        
        // Check if match already exists
        const matchSnap = await transaction.get(matchRef);
        if (!matchSnap.exists()) {
          transaction.set(matchRef, {
            users: sortedIds,
            city: currentUserData.city || 'default',
            createdAt: serverTimestamp(),
            lastActivity: serverTimestamp(),
            active: true
          });
        }
      }
      
      return { success: true, isMatch, matchId };
    });
    
    console.log('Transaction completed successfully:', result);
    return result;
    
  } catch (error) {
    console.error('Error in createLike transaction:', error);
    return { success: false, error: error.message };
  }
};

// Create a match document with city validation
export const createMatch = async (userId1, userId2) => {
  try {
    console.log('🔄 MATCH_DEBUG: Creating match between users:', userId1, 'and', userId2);
    console.log('🔄 MATCH_DEBUG: userId1 type:', typeof userId1, 'userId2 type:', typeof userId2);
    
    // SECURITY: Double-check both users are from the same city
    const user1Ref = doc(db, 'users', userId1);
    const user2Ref = doc(db, 'users', userId2);
    
    const [user1Snap, user2Snap] = await Promise.all([
      getDoc(user1Ref),
      getDoc(user2Ref)
    ]);
    
    if (!user1Snap.exists() || !user2Snap.exists()) {
      throw new Error('One or both users not found');
    }
    
    const user1Data = user1Snap.data();
    const user2Data = user2Snap.data();
    
    // TEMPORARY: Disable city-based security check to restore functionality
    /*
    if (!user1Data.city || !user2Data.city) {
      throw new Error('One or both users missing city data');
    }
    
    if (user1Data.city !== user2Data.city) {
      throw new Error('Cannot create match between users from different cities');
    }
    */
    
    // Sort user IDs to ensure consistent match ID
    const sortedIds = [userId1, userId2].sort();
    const matchId = `${sortedIds[0]}_${sortedIds[1]}`;
    console.log('📝 MATCH_DEBUG: Match ID will be:', matchId);
    console.log('📝 MATCH_DEBUG: Sorted user IDs:', sortedIds);
    
    // Check if match already exists
    const matchRef = doc(db, 'matches', matchId);
    const matchSnap = await getDoc(matchRef);
    
    if (matchSnap.exists()) {
      console.log('✅ MATCH_DEBUG: Match already exists, returning existing match');
      const existingData = matchSnap.data();
      console.log('✅ MATCH_DEBUG: Existing match data:', existingData);
      return { id: matchId, ...existingData };
    }
    
    // Create the match with client-side timestamp first for immediate use
    const now = new Date();
    const matchData = {
      users: sortedIds,
      city: user1Data.city || 'default', // Store city for additional security and filtering
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
      active: true,
      // Add temporary client timestamp for immediate display
      tempCreatedAt: now.toISOString()
    };
    
    console.log('💾 MATCH_DEBUG: Saving match to Firebase with data:', matchData);
    console.log('💾 MATCH_DEBUG: Match users array:', matchData.users);
    console.log('💾 MATCH_DEBUG: Match city:', matchData.city);
    console.log('💾 MATCH_DEBUG: Match active status:', matchData.active);
    
    await setDoc(matchRef, matchData);
    
    // Fetch the document back to get resolved timestamps
    console.log('🔍 MATCH_DEBUG: Fetching saved match to verify...');
    const savedMatchSnap = await getDoc(matchRef);
    
    if (savedMatchSnap.exists()) {
      const savedData = savedMatchSnap.data();
      console.log('✅ MATCH_DEBUG: Match successfully saved and verified in Firebase!');
      console.log('✅ MATCH_DEBUG: Saved match data:', savedData);
      console.log('✅ MATCH_DEBUG: Saved users array:', savedData.users);
      console.log('✅ MATCH_DEBUG: Saved match city:', savedData.city);
      console.log('✅ MATCH_DEBUG: Saved active status:', savedData.active);
      return { id: matchId, ...savedData };
    } else {
      console.error('❌ MATCH_DEBUG: Match was not found after saving!');
      throw new Error('Match creation failed - document not found after save');
    }
  } catch (error) {
    console.error('❌ MATCH_DEBUG: Error creating match:', error);
    console.error('❌ MATCH_DEBUG: Error details:', error.message, error.code);
    throw error;
  }
};

// Create a pass document with city validation
export const createPass = async (currentUserId, passedUserId) => {
  try {
    // SECURITY: Verify both users are from the same city before allowing pass
    const currentUserRef = doc(db, 'users', currentUserId);
    const passedUserRef = doc(db, 'users', passedUserId);
    
    const [currentUserSnap, passedUserSnap] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(passedUserRef)
    ]);
    
    if (!currentUserSnap.exists() || !passedUserSnap.exists()) {
      console.error('One or both users not found');
      return { success: false, error: 'User not found' };
    }
    
    const currentUserData = currentUserSnap.data();
    const passedUserData = passedUserSnap.data();
    
    // TEMPORARY: Disable city-based security check to restore functionality
    /*
    if (!currentUserData.city || !passedUserData.city) {
      console.error('One or both users missing city data');
      return { success: false, error: 'City data missing' };
    }
    
    if (currentUserData.city !== passedUserData.city) {
      console.error('Cross-city pass attempt blocked:', currentUserData.city, 'vs', passedUserData.city);
      return { success: false, error: 'Users must be from the same city' };
    }
    */
    
    // Create pass document ID using both user IDs
    const passId = `${currentUserId}_${passedUserId}`;
    
    // Check if pass already exists
    const passRef = doc(db, 'passes', passId);
    const passSnap = await getDoc(passRef);
    
    if (passSnap.exists()) {
      console.log('Pass already exists');
      return { success: true, alreadyPassed: true };
    }
    
    // Create the pass with city information
    await setDoc(passRef, {
      passedBy: currentUserId,
      passedUser: passedUserId,
      city: currentUserData.city || 'default', // Store city for additional security
      createdAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error creating pass:', error);
    return { success: false, error: error.message };
  }
};

// Get all users the current user has passed on
export const getUserPasses = async (userId) => {
  try {
    const passesRef = collection(db, 'passes');
    const q = query(
      passesRef,
      where('passedBy', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const passedUserIds = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      passedUserIds.push(data.passedUser);
    });
    
    return passedUserIds;
  } catch (error) {
    console.error('Error fetching user passes:', error);
    return [];
  }
};

// Check if user has passed another user
export const hasUserPassed = async (userId, targetUserId) => {
  try {
    const passId = `${userId}_${targetUserId}`;
    const passRef = doc(db, 'passes', passId);
    const passSnap = await getDoc(passRef);
    
    return passSnap.exists();
  } catch (error) {
    console.error('Error checking pass status:', error);
    return false;
  }
};

// Get all matches for a user - fallback method for when listeners fail
export const getUserMatches = async (userId) => {
  try {
    console.log('🔍 QUERY_DEBUG: Fetching matches for userId:', userId);
    console.log('🔍 QUERY_DEBUG: userId type:', typeof userId);
    
    // Try the simplest possible approach first - get all matches and filter client-side  
    const matchesRef = collection(db, 'matches');
    
    console.log('🔍 QUERY_DEBUG: Getting all match documents (no query filters)');
    const querySnapshot = await getDocs(matchesRef);
    console.log('🔍 QUERY_DEBUG: Retrieved', querySnapshot.size, 'total documents');
    
    const matches = [];
    
    querySnapshot.forEach((doc) => {
      const matchData = doc.data();
      console.log('🔍 QUERY_DEBUG: Examining match document:', doc.id);
      console.log('🔍 QUERY_DEBUG: Match data:', matchData);
      console.log('🔍 QUERY_DEBUG: Match users array:', matchData.users);
      console.log('🔍 QUERY_DEBUG: Match active status:', matchData.active);
      
      // Check if this match contains the user (client-side filtering)
      if (matchData.users && Array.isArray(matchData.users) && matchData.users.includes(userId)) {
        console.log('🔍 QUERY_DEBUG: Match contains userId, checking if active');
        
        // Only include active matches
        if (matchData.active !== false) {
          console.log('🔍 QUERY_DEBUG: Match is active, adding to results');
          matches.push({
            id: doc.id,
            ...matchData
          });
        } else {
          console.log('🔍 QUERY_DEBUG: Match is inactive, excluding from results');
        }
      } else {
        console.log('🔍 QUERY_DEBUG: Match does not contain userId, skipping');
      }
    });
    
    // Sort by createdAt on client side to avoid needing index
    matches.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(a.tempCreatedAt || 0);
      const bTime = b.createdAt?.toDate?.() || new Date(b.tempCreatedAt || 0);
      return bTime - aTime; // Newest first
    });
    
    console.log('🔍 QUERY_DEBUG: Final matches count:', matches.length);
    console.log('🔍 QUERY_DEBUG: Final matches data:', matches);
    return matches;
  } catch (error) {
    console.error('❌ QUERY_DEBUG: Error fetching matches:', error);
    return [];
  }
};

// Get all users who have liked the current user
export const getUsersWhoLikedMe = async (userId) => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('likedUser', '==', userId)
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

// Get all users the current user has liked
export const getUsersILiked = async (userId) => {
  try {
    const likesRef = collection(db, 'likes');
    const q = query(
      likesRef,
      where('likedBy', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const likedUserIds = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      likedUserIds.push(data.likedUser);
    });
    
    return likedUserIds;
  } catch (error) {
    console.error('Error fetching liked users:', error);
    return [];
  }
};

// Listen to real-time likes for a user
export const listenToIncomingLikes = (userId, callback) => {
  const likesRef = collection(db, 'likes');
  const q = query(
    likesRef,
    where('likedUser', '==', userId),
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
  console.log('🎯 Setting up match listener for userId:', userId);
  
  const matchesRef = collection(db, 'matches');
  
  // Try a simple query first without composite index
  const q = query(
    matchesRef,
    where('users', 'array-contains', userId)
  );
  
  return onSnapshot(q, 
    (snapshot) => {
      console.log('📨 Match listener triggered, found', snapshot.size, 'matches');
      const matches = [];
      snapshot.forEach((doc) => {
        const matchData = doc.data();
        console.log('📋 Match found:', doc.id, 'with users:', matchData.users);
        
        // Only include active matches
        if (matchData.active !== false) { // Include if active is true or undefined
          matches.push({
            id: doc.id,
            ...matchData
          });
        }
      });
      
      // Sort by createdAt on client side to avoid needing index
      matches.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.tempCreatedAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.tempCreatedAt || 0);
        return bTime - aTime; // Newest first
      });
      
      callback(matches);
    },
    (error) => {
      console.error('❌ Match listener error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      if (error.code === 'failed-precondition') {
        console.error('🚨 MISSING INDEX! You need to create a composite index in Firebase Console:');
        console.error('Collection: matches');
        console.error('Fields: users (Arrays), active (Ascending), createdAt (Descending)');
      } else if (error.code === 'permission-denied') {
        console.error('🚨 PERMISSION DENIED! Check your Firebase security rules');
      }
      
      // Still call callback with empty array so UI doesn't hang
      callback([]);
    }
  );
};

// Alternative simple match listener without orderBy - most basic version
export const listenToMatchesSimple = (userId, callback) => {
  console.log('🎯 LISTENER_DEBUG: Setting up SIMPLE match listener for userId:', userId);
  console.log('🎯 LISTENER_DEBUG: userId type:', typeof userId);
  
  const matchesRef = collection(db, 'matches');
  const q = query(
    matchesRef,
    where('users', 'array-contains', userId)
  );
  
  console.log('🎯 LISTENER_DEBUG: Created query with array-contains for userId:', userId);
  
  return onSnapshot(q, 
    (snapshot) => {
      console.log('📨 LISTENER_DEBUG: Match listener triggered, found', snapshot.size, 'documents');
      const matches = [];
      
      snapshot.forEach((doc) => {
        const matchData = doc.data();
        console.log('📋 LISTENER_DEBUG: Processing match document:', doc.id);
        console.log('📋 LISTENER_DEBUG: Match data:', matchData);
        console.log('📋 LISTENER_DEBUG: Match users array:', matchData.users);
        console.log('📋 LISTENER_DEBUG: Match active status:', matchData.active);
        console.log('📋 LISTENER_DEBUG: Does users array contain queried userId?', matchData.users?.includes?.(userId));
        
        // Only include matches where active is not explicitly false
        if (matchData.active !== false) {
          console.log('📋 LISTENER_DEBUG: Match is active, adding to results');
          matches.push({
            id: doc.id,
            ...matchData
          });
        } else {
          console.log('📋 LISTENER_DEBUG: Match is inactive, excluding from results');
        }
      });
      
      // Sort by creation date client-side
      matches.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.tempCreatedAt || 0);
        const bTime = b.createdAt?.toDate?.() || new Date(b.tempCreatedAt || 0);
        return bTime - aTime; // Newest first
      });
      
      console.log('📨 LISTENER_DEBUG: Final listener results:', matches.length, 'matches');
      console.log('📨 LISTENER_DEBUG: Final matches data:', matches);
      callback(matches);
    },
    (error) => {
      console.error('❌ LISTENER_DEBUG: Match listener error:', error);
      console.error('❌ LISTENER_DEBUG: Error details:', {
        code: error.code,
        message: error.message
      });
      
      // Return empty array on error so UI doesn't hang
      callback([]);
    }
  );
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

// DEBUG FUNCTION: Test matches for a specific user (call this manually to debug)
export const debugUserMatches = async (userId) => {
  console.log('🚨 DEBUG_TEST: Starting debug for userId:', userId);
  
  try {
    // Test 1: Direct collection scan to find any matches containing this user
    console.log('🚨 DEBUG_TEST: Test 1 - Direct collection scan');
    const matchesRef = collection(db, 'matches');
    const allMatchesSnapshot = await getDocs(matchesRef);
    
    const allMatches = [];
    const matchesContainingUser = [];
    
    allMatchesSnapshot.forEach((doc) => {
      const matchData = doc.data();
      allMatches.push({ id: doc.id, ...matchData });
      
      if (matchData.users && matchData.users.includes(userId)) {
        matchesContainingUser.push({ id: doc.id, ...matchData });
        console.log('🚨 DEBUG_TEST: Found match containing user:', doc.id, matchData);
      }
    });
    
    console.log('🚨 DEBUG_TEST: Total matches in database:', allMatches.length);
    console.log('🚨 DEBUG_TEST: Matches containing userId:', matchesContainingUser.length);
    
    // Test 2: Use the array-contains query
    console.log('🚨 DEBUG_TEST: Test 2 - Array-contains query');
    const queryMatches = await getUserMatches(userId);
    console.log('🚨 DEBUG_TEST: Array-contains query returned:', queryMatches.length, 'matches');
    
    return {
      allMatches: allMatches.length,
      directScan: matchesContainingUser,
      queryResults: queryMatches
    };
  } catch (error) {
    console.error('🚨 DEBUG_TEST: Error in debug function:', error);
    return null;
  }
};

// Make debug function available globally for testing
if (typeof window !== 'undefined') {
  window.debugUserMatches = debugUserMatches;
}
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage, googleProvider, appleProvider } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user profile data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            
            // If user has basic profile data, assume profile is complete
            const hasBasicProfile = userData.name && userData.age && userData.skillLevel;
            
            // For returning users: if they have ANY previous profile data, skip onboarding
            const isReturningUser = userData.createdAt && (userData.name || userData.age || userData.skillLevel || userData.profileComplete);
            
            // One-time migration: Update profileComplete field for existing users
            if ((userData.profileComplete === undefined && hasBasicProfile) || isReturningUser) {
              try {
                await updateDoc(userDocRef, { 
                  profileComplete: true, 
                  hasSeenWelcome: true 
                });
              } catch (error) {
                console.error('Error updating profileComplete:', error);
              }
            }
            
            // For existing users with complete profiles, automatically set hasSeenWelcome
            const shouldHaveSeenWelcome = userData.profileComplete || hasBasicProfile || isReturningUser;
            const finalProfileComplete = userData.profileComplete !== undefined ? userData.profileComplete : (hasBasicProfile || isReturningUser);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData,
              // Set profileComplete to true if they have basic profile data or are returning user
              profileComplete: finalProfileComplete,
              // For returning users with complete profiles, skip welcome screen
              hasSeenWelcome: userData.hasSeenWelcome !== undefined ? userData.hasSeenWelcome : shouldHaveSeenWelcome
            });
          } else {
            // User exists in Auth but not in Firestore (social login first time)
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || '',
              profilePicture: firebaseUser.photoURL || '',
              provider: firebaseUser.providerData[0]?.providerId || 'email',
              profileComplete: false
            });
          }
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // User state will be updated by onAuthStateChanged listener
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Sign in failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signUp = async (email, password, additionalData = {}) => {
    try {
      console.log('SignUp: Starting account creation for:', email);
      console.log('SignUp: Additional data:', additionalData);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('SignUp: Firebase user created successfully:', firebaseUser.uid);
      
      // Handle profile picture upload
      let profilePictureUrl = additionalData.profilePictureUrl || '';
      
      if (additionalData.profilePicture) {
        try {
          const imageRef = ref(storage, `profile-pictures/${firebaseUser.uid}`);
          await uploadBytes(imageRef, additionalData.profilePicture);
          profilePictureUrl = await getDownloadURL(imageRef);
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          // Continue without profile picture if upload fails
        }
      }
      
      // Update Firebase Auth profile
      console.log('SignUp: Updating Firebase Auth profile...');
      await updateProfile(firebaseUser, {
        displayName: additionalData.name || '',
        photoURL: profilePictureUrl || additionalData.profilePictureUrl || ''
      });
      
      // Save user data to Firestore
      const userData = {
        name: additionalData.name || '',
        age: additionalData.age || '',
        gender: additionalData.gender || '',
        skillLevel: additionalData.skillLevel || '',
        duprRating: additionalData.duprRating || '',
        availability: additionalData.availability || [],
        profilePicture: profilePictureUrl || additionalData.profilePictureUrl || '',
        bio: additionalData.bio || '',
        profileComplete: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('SignUp: Saving user data to Firestore:', userData);
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        console.log('SignUp: User data saved successfully');
      } catch (firestoreError) {
        console.error('SignUp: Firestore error details:', {
          code: firestoreError.code,
          message: firestoreError.message,
          details: firestoreError
        });
        throw firestoreError; // Re-throw to be caught by outer try-catch
      }
      
      return { success: true, user: firebaseUser };
    } catch (error) {
      console.error('Sign up error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error details:', error);
      
      // Provide user-friendly error messages
      let errorMessage = 'Account creation failed';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Database access denied. Please check Firebase rules.';
      } else if (error.code === 'failed-precondition') {
        errorMessage = 'Database not properly configured.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Database temporarily unavailable. Please try again.';
      } else {
        errorMessage = `Account creation failed: ${error.message}`;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Check if this is a new user by checking Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const isNewUser = !userDocSnap.exists();
      
      if (isNewUser) {
        // Create basic user document for new Google users
        const userData = {
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          profilePicture: firebaseUser.photoURL || '',
          provider: 'google',
          profileComplete: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(userDocRef, userData);
      }
      
      return { success: true, user: firebaseUser, isNewUser };
    } catch (error) {
      console.error('Google sign in error:', error);
      
      let errorMessage = 'Google sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signInWithApple = async () => {
    try {
      console.log('Apple sign-in: Starting authentication...');
      const result = await signInWithPopup(auth, appleProvider);
      const firebaseUser = result.user;
      console.log('Apple sign-in: Firebase user created:', firebaseUser);
      
      // Check if this is a new user by checking Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const isNewUser = !userDocSnap.exists();
      console.log('Apple sign-in: Is new user?', isNewUser);
      
      if (isNewUser) {
        // Create basic user document for new Apple users
        const userData = {
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          profilePicture: firebaseUser.photoURL || '',
          provider: 'apple',
          profileComplete: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        console.log('Apple sign-in: Creating user document:', userData);
        await setDoc(userDocRef, userData);
        console.log('Apple sign-in: User document created successfully');
      }
      
      return { success: true, user: firebaseUser, isNewUser };
    } catch (error) {
      console.error('Apple sign in error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      let errorMessage = 'Apple sign-in failed';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled';
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      // User state will be updated by onAuthStateChanged listener
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      const firebaseUser = auth.currentUser;
      
      // Handle profile picture upload
      let profilePictureUrl = profileData.profilePictureUrl || '';
      
      if (profileData.profilePicture) {
        try {
          const imageRef = ref(storage, `profile-pictures/${firebaseUser.uid}`);
          await uploadBytes(imageRef, profileData.profilePicture);
          profilePictureUrl = await getDownloadURL(imageRef);
        } catch (uploadError) {
          console.error('Error uploading profile picture:', uploadError);
          // Continue without profile picture if upload fails
        }
      }
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: profileData.name || firebaseUser.displayName,
        photoURL: profilePictureUrl || firebaseUser.photoURL
      });
      
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const updateData = {
        ...profileData,
        profilePicture: profilePictureUrl || profileData.profilePictureUrl || '',
        profileComplete: true,
        updatedAt: new Date()
      };
      
      await updateDoc(userDocRef, updateData);
      
      // Immediately update local user state to prevent navigation timing issues
      const finalProfilePicture = profilePictureUrl || updateData.profilePicture || '';
      
      setUser(prevUser => ({
        ...prevUser,
        ...updateData,
        profilePicture: finalProfilePicture,
        profileComplete: true
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    signOut,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
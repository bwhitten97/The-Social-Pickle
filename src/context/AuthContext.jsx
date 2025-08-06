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
import { config } from '../config/app';
import { logUserSignUp, logUserLogin } from '../utils/analytics';

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
  const [isUpdatingWelcome, setIsUpdatingWelcome] = useState(false);
  
  // Use sessionStorage to track welcome status updates
  const [welcomeUpdated, setWelcomeUpdated] = useState(
    sessionStorage.getItem('welcomeUpdated') === 'true'
  );

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
            
            // Don't overwrite hasSeenWelcome if we're in the process of updating it
            const currentUser = user;
            const hasSeenWelcomeValue = welcomeUpdated || (isUpdatingWelcome && currentUser?.hasSeenWelcome === true)
              ? true 
              : (userData.hasSeenWelcome !== undefined ? userData.hasSeenWelcome : shouldHaveSeenWelcome);
            
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData,
              // Set profileComplete to true if they have basic profile data or are returning user
              profileComplete: finalProfileComplete,
              // For returning users with complete profiles, skip welcome screen
              hasSeenWelcome: hasSeenWelcomeValue
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
      // Log analytics event
      logUserLogin('email', userCredential.user.uid);
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
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Handle profile picture upload
      let profilePictureUrl = additionalData.profilePictureUrl || '';
      
      if (additionalData.profilePicture) {
        try {
          console.log('SignUp: Starting profile picture upload for user:', firebaseUser.uid);
          console.log('SignUp: File details:', {
            name: additionalData.profilePicture.name,
            size: additionalData.profilePicture.size,
            type: additionalData.profilePicture.type
          });
          
          const imageRef = ref(storage, `profile-pictures/${firebaseUser.uid}`);
          const uploadResult = await uploadBytes(imageRef, additionalData.profilePicture);
          profilePictureUrl = await getDownloadURL(imageRef);
          
          console.log('SignUp: Upload successful!');
          console.log('SignUp: Download URL:', profilePictureUrl);
        } catch (uploadError) {
          console.error('SignUp: Error uploading profile picture:', uploadError);
          console.error('SignUp: Upload error details:', {
            code: uploadError.code,
            message: uploadError.message
          });
          // Continue without profile picture if upload fails
        }
      }
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: additionalData.name || '',
        photoURL: profilePictureUrl || additionalData.profilePictureUrl || ''
      });
      
      // Save user data to Firestore (exclude File object)
      const { profilePicture: fileObj, ...additionalDataWithoutFile } = additionalData;
      
      const userData = {
        name: additionalDataWithoutFile.name || '',
        age: additionalDataWithoutFile.age || '',
        gender: additionalDataWithoutFile.gender || '',
        skillLevel: additionalDataWithoutFile.skillLevel || '',
        duprRating: additionalDataWithoutFile.duprRating || '',
        availability: additionalDataWithoutFile.availability || [],
        city: additionalDataWithoutFile.city || config.AVAILABLE_CITIES[0] || 'Chicago',
        profilePicture: profilePictureUrl || additionalDataWithoutFile.profilePictureUrl || '',
        bio: additionalDataWithoutFile.bio || '',
        location: additionalDataWithoutFile.location || config.DEFAULT_LOCATION,
        profileComplete: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('SignUp: Saving user data to Firestore:', {
        uid: firebaseUser.uid,
        profilePictureUrl,
        hasProfilePicture: !!userData.profilePicture,
        userData
      });
      
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        console.log('SignUp: User data saved to Firestore successfully');
        
        // Add a small delay to ensure Firestore write completes
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (firestoreError) {
        console.error('SignUp: Firestore error details:', {
          code: firestoreError.code,
          message: firestoreError.message,
          details: firestoreError
        });
        throw firestoreError; // Re-throw to be caught by outer try-catch
      }
      
      // Log analytics event
      logUserSignUp('email', firebaseUser.uid);
      
      // Force reload user data from Firestore to ensure auth state has latest data
      const userDocRefReload = doc(db, 'users', firebaseUser.uid);
      const userDocSnapReload = await getDoc(userDocRefReload);
      
      if (userDocSnapReload.exists()) {
        const latestUserData = userDocSnapReload.data();
        console.log('SignUp: Reloaded user data from Firestore:', latestUserData);
        
        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...latestUserData
        });
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
          city: config.AVAILABLE_CITIES[0] || 'Chicago', // Assign default city for social login users
          location: config.DEFAULT_LOCATION,
          profileComplete: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(userDocRef, userData);
        // Log analytics for new user signup
        logUserSignUp('google', firebaseUser.uid);
      } else {
        // Log analytics for returning user login
        logUserLogin('google', firebaseUser.uid);
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
      const result = await signInWithPopup(auth, appleProvider);
      const firebaseUser = result.user;
      
      // Check if this is a new user by checking Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      const isNewUser = !userDocSnap.exists();
      
      if (isNewUser) {
        // Create basic user document for new Apple users
        const userData = {
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          profilePicture: firebaseUser.photoURL || '',
          provider: 'apple',
          city: config.AVAILABLE_CITIES[0] || 'Chicago', // Assign default city for social login users
          location: config.DEFAULT_LOCATION,
          profileComplete: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await setDoc(userDocRef, userData);
        // Log analytics for new user signup
        logUserSignUp('apple', firebaseUser.uid);
      } else {
        // Log analytics for returning user login
        logUserLogin('apple', firebaseUser.uid);
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
      // Clear welcome status from sessionStorage
      sessionStorage.removeItem('welcomeUpdated');
      setWelcomeUpdated(false);
      // User state will be updated by onAuthStateChanged listener
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (profileData, profileImage = null) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      const firebaseUser = auth.currentUser;
      
      // Handle profile picture upload
      let profilePictureUrl = profileData.profilePictureUrl || '';
      
      // Use the separate profileImage parameter if provided, otherwise fall back to profileData.profilePicture
      const imageToUpload = profileImage || profileData.profilePicture;
      
      if (imageToUpload) {
        try {
          console.log('UpdateProfile: Starting profile picture upload for user:', firebaseUser.uid);
          console.log('UpdateProfile: File details:', {
            name: imageToUpload.name,
            size: imageToUpload.size,
            type: imageToUpload.type
          });
          
          const imageRef = ref(storage, `profile-pictures/${firebaseUser.uid}`);
          console.log('UpdateProfile: Uploading to path:', `profile-pictures/${firebaseUser.uid}`);
          
          const uploadResult = await uploadBytes(imageRef, imageToUpload);
          console.log('UpdateProfile: Upload result:', uploadResult);
          
          profilePictureUrl = await getDownloadURL(imageRef);
          console.log('UpdateProfile: Got download URL:', profilePictureUrl);
          
          if (!profilePictureUrl) {
            throw new Error('Failed to get download URL after upload');
          }
          
          console.log('UpdateProfile: Upload successful!');
          console.log('UpdateProfile: Download URL:', profilePictureUrl);
        } catch (uploadError) {
          console.error('UpdateProfile: Error uploading profile picture:', uploadError);
          console.error('UpdateProfile: Upload error details:', {
            code: uploadError.code,
            message: uploadError.message
          });
          // Don't fail the entire update if only image upload fails
          // But preserve existing profile picture URL if available
          profilePictureUrl = profileData.profilePictureUrl || '';
          console.log('UpdateProfile: Image upload failed, continuing with existing URL:', profilePictureUrl);
        }
      }
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: profileData.name || firebaseUser.displayName,
        photoURL: profilePictureUrl || firebaseUser.photoURL
      });
      
      // Update user document in Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      // Build update data explicitly to ensure profilePicture is included
      const updateData = {
        name: profileData.name || '',
        age: profileData.age || '',
        gender: profileData.gender || '',
        skillLevel: profileData.skillLevel || '',
        duprRating: profileData.duprRating || '',
        availability: profileData.availability || [],
        bio: profileData.bio || '',
        location: profileData.location || config.DEFAULT_LOCATION,
        profilePicture: profilePictureUrl || profileData.profilePictureUrl || '',
        profileComplete: true,
        updatedAt: new Date()
      };
      
      console.log('UpdateProfile: Profile picture URL to save:', profilePictureUrl);
      console.log('UpdateProfile: Update data profilePicture field:', updateData.profilePicture);
      console.log('UpdateProfile: Full update data:', JSON.stringify(updateData, null, 2));
      
      try {
        await updateDoc(userDocRef, updateData);
        console.log('UpdateProfile: User data saved to Firestore successfully');
      } catch (updateError) {
        console.error('UpdateProfile: Failed to save to Firestore:', updateError);
        console.error('UpdateProfile: Update data that failed:', updateData);
        throw updateError;
      }
      
      // Add a small delay to ensure Firestore write completes
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Immediately update local user state to prevent navigation timing issues
      const finalProfilePicture = profilePictureUrl || updateData.profilePicture || '';
      
      // First update Firebase Auth profile with the new photo URL
      if (finalProfilePicture) {
        try {
          await updateProfile(firebaseUser, {
            displayName: profileData.name || firebaseUser.displayName,
            photoURL: finalProfilePicture
          });
        } catch (authUpdateError) {
          console.error('Error updating Firebase Auth profile:', authUpdateError);
        }
      }
      
      // Force reload user data from Firestore to ensure we have the latest data
      const userDocRefReload = doc(db, 'users', firebaseUser.uid);
      const userDocSnapReload = await getDoc(userDocRefReload);
      
      if (userDocSnapReload.exists()) {
        const latestUserData = userDocSnapReload.data();
        console.log('UpdateProfile: Reloaded user data from Firestore:', JSON.stringify(latestUserData, null, 2));
        console.log('UpdateProfile: Reloaded profilePicture field:', latestUserData.profilePicture);
        
        setUser({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...latestUserData,
          profileComplete: true
        });
      } else {
        // Fallback to local update
        setUser(prevUser => ({
          ...prevUser,
          ...updateData,
          profilePicture: finalProfilePicture,
          profileComplete: true
        }));
      }
      
      return { success: true };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateWelcomeStatus = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      const firebaseUser = auth.currentUser;
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      
      // Set flag to prevent auth state listener from overwriting
      setIsUpdatingWelcome(true);
      
      // Mark in sessionStorage that welcome has been updated
      sessionStorage.setItem('welcomeUpdated', 'true');
      setWelcomeUpdated(true);
      
      // Update local state FIRST to prevent redirect loops
      setUser(prevUser => ({
        ...prevUser,
        hasSeenWelcome: true
      }));
      
      // Then update Firestore
      await updateDoc(userDocRef, {
        hasSeenWelcome: true
      });
      
      // Clear the flag immediately after Firestore update
      setIsUpdatingWelcome(false);
      
      return { success: true };
    } catch (error) {
      console.error('Error updating welcome status:', error);
      // Revert local state on error
      setUser(prevUser => ({
        ...prevUser,
        hasSeenWelcome: false
      }));
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
    updateUserProfile,
    updateWelcomeStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
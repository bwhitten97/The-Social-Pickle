# Firebase Setup Instructions

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `the-social-pickle` (or your preferred name)
4. Disable Google Analytics for now (you can enable later)
5. Click "Create project"

## Step 2: Set up Firebase Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Enable the following providers:

### Email/Password
- Click on "Email/Password"
- Enable the first option (Email/Password)
- Click "Save"

### Google
- Click on "Google"
- Enable Google sign-in
- Add your project support email
- Click "Save"

### Apple (Optional - requires Apple Developer account)
- Click on "Apple"
- Enable Apple sign-in
- You'll need Apple Developer credentials
- Click "Save"

## Step 3: Set up Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose "Start in test mode" for now
4. Select your region (choose closest to your users)
5. Click "Done"

## Step 4: Set up Firebase Storage (Optional)

**Note: Storage requires the Blaze (pay-as-you-go) plan. For now, we've disabled profile picture uploads.**

If you want to enable profile picture uploads:

1. **Upgrade to Blaze plan**:
   - Go to "Usage and billing" in project settings
   - Click "Modify plan" → Select "Blaze"
   - Add billing account (has generous free tier)

2. **Set up Storage**:
   - Go to **Storage** in the left sidebar
   - Click "Get started"
   - Keep default security rules for now
   - Select the same region as your Firestore
   - Click "Done"

**For now, you can skip this step - authentication will work without it!**

## Step 5: Get Your Firebase Configuration

1. Go to **Project Settings** (gear icon in left sidebar)
2. Scroll down to "Your apps"
3. Click the web icon (`</>`)
4. Enter app nickname: "The Social Pickle Web"
5. DON'T check "Firebase Hosting" for now
6. Click "Register app"
7. Copy the `firebaseConfig` object

## Step 6: Configure Your App

1. Create a `.env` file in your project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. Save the file

## Step 7: Update Security Rules (Production Ready)

### Firestore Rules
Go to **Firestore Database** → **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Add other collections as needed
  }
}
```

### Storage Rules
Go to **Storage** → **Rules** and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures - users can only upload their own
    match /profile-pictures/{userId} {
      allow read: if true; // Anyone can view profile pictures
      allow write: if request.auth != null && request.auth.uid == userId
        && resource.size < 5 * 1024 * 1024 // Max 5MB
        && resource.contentType.matches('image/.*'); // Images only
    }
  }
}
```

## Step 8: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`
3. Try signing up with email/password
4. Try signing in with Google
5. Complete the onboarding flow

## Security Notes

- Your Firebase API key is safe to expose in frontend code
- The real security comes from Firestore/Storage rules
- Never put sensitive server-side keys in frontend code
- Consider enabling App Check for production

## Next Steps (Optional)

1. **Set up Firebase Hosting** for deployment
2. **Enable App Check** for additional security
3. **Set up Firebase Analytics** for user insights
4. **Configure email verification** for new users
5. **Set up password reset** functionality

## Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Make sure your `.env` file has all required variables
   - Restart your dev server after adding `.env`

2. **"Firebase: Error (auth/popup-blocked)"**
   - Browser is blocking the popup
   - Try in an incognito window or different browser

3. **"Firebase: Error (auth/unauthorized-domain)"**
   - Add your domain to authorized domains in Firebase Console
   - Go to Authentication → Settings → Authorized domains

4. **Images not uploading**
   - Check Storage rules are correctly set
   - Verify Storage is enabled in Firebase Console

Need help? Check the [Firebase Documentation](https://firebase.google.com/docs) or reach out!
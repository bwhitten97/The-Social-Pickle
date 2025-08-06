# The Social Pickle - Comprehensive QA Testing Guide

## 📋 Overview
The Social Pickle is a location-based pickleball social networking app that connects players for games and matches. Users swipe through profiles, match with other players, join/create games, and message their matches.

**Core Concept**: Tinder-style app for pickleball players + game organizing + messaging

---

## 🚀 CRITICAL: Multi-Account Testing Required

**⚠️ IMPORTANT**: Most features require multiple test accounts to properly test matching, games, and messaging functionality. Create at least 3-4 test accounts before starting comprehensive testing.

---

## 📱 App Architecture & Navigation

### Main Navigation (Bottom Tab Bar)
- **Discover** 🔍 - Swipe through other players
- **Games** 🎾 - View/create/join pickleball games  
- **Matches** 💬 - See your matches and start conversations
- **Chat** 💬 - Active conversations with matches
- **Profile** 👤 - Edit your profile and settings

---

## 🔐 Authentication System Testing

### 1. Registration/Signup Options
**Location**: Landing page → "Sign Up" button

#### Email/Password Signup
**Test Flow**:
1. Click "Sign Up with Email"
2. **Onboarding Steps** (8 total steps):

##### Step 1: Email & Password
- **Fields**: Email, Password (min 6 characters)
- **Validation Testing**:
  - Invalid email formats
  - Weak passwords (< 6 chars)
  - Already registered emails
- **Expected**: Error messages for invalid inputs

##### Step 2: Full Name
- **Field**: Text input for full name
- **Test**: Empty field, special characters, very long names
- **Expected**: Required field validation

##### Step 3: Age
- **Field**: Number input (13-100)
- **Test**: Invalid ages (< 13, > 100), non-numbers
- **Expected**: Age validation with error messages

##### Step 4: Gender Selection
- **Options**: Male, Female, Non-binary, Prefer not to say
- **Test**: Each option should be selectable
- **Expected**: One selection required to proceed

##### Step 5: Skill Level & DUPR Rating
- **DUPR Rating**: Optional number input (1.0-7.0)
- **Skill Options**: Beginner, Intermediate, Advanced
- **Test Scenarios**:
  - DUPR auto-selects skill level (1.0-2.4=Beginner, 2.5-3.9=Intermediate, 4.0+=Advanced)
  - Manual skill selection without DUPR
  - Invalid DUPR values
- **Expected**: Both DUPR and manual selection should work

##### Step 6: Availability (Multi-select)
- **Options**: Mornings, Afternoons, Evenings, Weekdays, Weekends, Flexible
- **Test**: Select multiple options, deselect options
- **Expected**: At least one selection required

##### Step 7: City Selection 🆕
- **Field**: Dropdown showing "Choose your city..."
- **Options**: Currently only "Chicago"
- **Test Scenarios**:
  - Dropdown should NOT auto-open
  - Must click dropdown to see options  
  - Chicago selection should work
  - Field should be required
- **Expected**: Proper dropdown behavior, required field validation

##### Step 8: Photo & Bio (Optional)
- **Photo Upload**: Tap camera icon to select photo
- **Photo Testing**:
  - Various image formats (JPG, PNG, HEIC)
  - Large file sizes (should compress)
  - Cropping functionality
  - "Use This Photo" button visibility and functionality
- **Bio Field**: 200 character limit textarea
- **Test**: Character counter, max length enforcement
- **Expected**: Both photo and bio are optional

### 2. Social Login Testing
**Options**: Google, Apple Sign-In

**Test Flow**:
1. Click Google/Apple sign-in
2. Complete OAuth flow
3. **New Users**: Should redirect to onboarding (skipping email/password step)
4. **Existing Users**: Should go directly to app
**Expected**: Proper OAuth handling, city assignment for new users

### 3. Sign-In Testing
**Fields**: Email, Password
**Test Cases**:
- Valid credentials
- Invalid email/password combinations
- Non-existent accounts
- Too many failed attempts
**Expected**: Proper error messages and lockout behavior

---

## 🏠 Main App Testing

### DISCOVER PAGE 🔍
**Primary Function**: Tinder-style swiping through other users

#### Core Swiping Functionality
**User Cards Display**:
- **Profile Photo**: Large image (tap to expand)
- **User Info**: Name, Age, Skill Level, Bio preview
- **Distance**: Shows "Chicago" (city-based)

**Swipe Actions**:
- **Swipe Right / Tap ❤️**: Like the user
- **Swipe Left / Tap ✗**: Pass on the user  
- **Tap Card**: Expand to full profile view

#### Expanded Profile View
**Elements to Test**:
- **Photo Gallery**: Swipe through multiple photos if available
- **Full Bio**: Complete bio text
- **User Details**: Age, skill level, availability
- **Action Buttons**: Like (❤️) and Pass (✗) buttons
- **Back Button**: Return to card stack

#### Match Detection
**Critical Test**: When two users like each other
1. User A likes User B
2. User B likes User A back
3. **Expected**: "It's a Match!" popup/animation
4. **Result**: Users appear in each other's Matches tab

#### Empty State Testing
- **Scenario**: No more users to swipe
- **Expected**: "No more players in your area" or similar message
- **Test**: Reload behavior

#### City Filtering Testing 🆕
**Critical Security Test**:
- Users should ONLY see other users from the same city
- **Test Setup**: Create accounts in different cities (if possible)
- **Expected**: No cross-city user visibility

---

### GAMES PAGE 🎾
**Primary Function**: Create, join, and manage pickleball games

#### Games Feed View
**Display Elements**:
- **Game Cards**: Each showing game details
- **Game Info**: Date, time, location, skill level, spots available
- **Host Info**: Game creator's name and photo
- **Status Indicators**: Open, Full, Past games

#### Create New Game
**Access**: Tap "+" or "Create Game" button

**Game Creation Form Fields**:
1. **Game Title**: Text input
2. **Date**: Date picker
3. **Time**: Time picker  
4. **Location/Court**: Text input for court/venue
5. **Skill Level**: Dropdown (All Levels, Beginner, Intermediate, Advanced)
6. **Max Players**: Number input (typically 2-4)
7. **Description**: Optional text area
8. **Cost/Court Fees**: Optional text input

**Test Scenarios**:
- **Required Fields**: Title, Date, Time, Location, Max Players
- **Validation**: Past dates should be rejected
- **Time Logic**: Proper time picker functionality
- **Skill Level Filtering**: Games should filter by skill appropriately

#### Joining Games
**User Flow**:
1. Browse available games
2. Tap "Join Game" button
3. **Expected**: Application submitted to game host

**Application States**:
- **Pending**: Waiting for host approval
- **Accepted**: Confirmed participant
- **Declined**: Application rejected
- **Full**: Game at capacity

#### Game Management (Host)
**Host Controls**:
- **View Applicants**: See who wants to join
- **Accept/Decline**: Approve or reject applications
- **Game Details**: Edit game information
- **Cancel Game**: Remove the game

**Applicant Management Testing**:
1. Create game with Account A
2. Apply to join with Account B & C
3. Use Account A to view/approve/decline applications
4. **Expected**: Real-time updates to all participants

#### My Games & Applications
**Tabs to Test**:
- **My Games**: Games you're hosting
- **My Applications**: Games you've applied to join
- **Joined Games**: Games you're confirmed for

**Status Updates**:
- Applications should show current status
- Hosts should see participant lists
- **Test**: Status changes reflect in real-time

---

### MATCHES PAGE 💬
**Primary Function**: View your matches and initiate conversations

#### Match Display
**Match Cards**:
- **Profile Photo**: Match's photo
- **Name**: Match's name  
- **Match Date**: When you matched
- **Last Message Preview**: If any messages exist
- **Unread Indicators**: New message badges

#### Match Actions
**Available Actions**:
- **Tap Match**: Open conversation
- **Swipe/Options**: Unmatch option (if implemented)

**Test Scenarios**:
1. **Fresh Matches**: No messages yet
2. **Active Conversations**: With message history
3. **Unread Messages**: Should show badges/indicators

#### Match Creation Testing
**Multi-Account Test**:
1. User A swipes right on User B
2. User B swipes right on User A  
3. **Expected**: Both users see the match in their Matches tab
4. **Timing**: Match should appear immediately

---

### CHAT PAGE 💬  
**Primary Function**: Message your matches

#### Chat Room List
**Display Elements**:
- **Contact Photo**: Match's profile picture
- **Contact Name**: Match's name
- **Last Message**: Preview of most recent message
- **Timestamp**: When last message was sent
- **Unread Count**: Badge showing unread messages

#### Individual Conversations
**Message Interface**:
- **Message Input**: Text input field
- **Send Button**: Submit message
- **Message History**: Scrollable chat history
- **Message Status**: Sent/delivered indicators (if implemented)

**Message Testing**:
1. **Send Messages**: Type and send various messages
2. **Real-time Updates**: Messages should appear instantly
3. **Long Messages**: Test message wrapping
4. **Empty Messages**: Should not be allowed
5. **Special Characters**: Emojis, symbols, etc.

**Multi-Account Chat Testing**:
1. Send message from Account A to Account B
2. **Expected**: Message appears in Account B's conversation immediately
3. **Read Status**: Test if read receipts work
4. **Bidirectional**: Both users can send/receive

---

### PROFILE PAGE 👤
**Primary Function**: Edit profile information and settings

#### Profile Information Display
**Visible Elements**:
- **Profile Photos**: Main photo + additional photos
- **Name & Age**: User's basic info
- **Bio**: User's description
- **Skill Level & DUPR**: Playing level information
- **Location**: City (should show "Chicago")
- **Availability**: When they play

#### Edit Profile Functionality
**Editable Fields**:
1. **Name**: Text input
2. **Age**: Number input
3. **Bio**: Textarea with character limit
4. **Skill Level**: Dropdown selection
5. **DUPR Rating**: Number input
6. **Availability**: Multi-select options
7. **City**: Dropdown (should allow city changing)
8. **Profile Photos**: Add/remove/reorder photos

**Photo Management**:
- **Add Photos**: Camera/gallery selection
- **Photo Cropping**: Crop tool functionality
- **Delete Photos**: Remove photos
- **Reorder Photos**: Set primary photo
- **Photo Limits**: Test maximum photo count

**Save Functionality**:
- **Save Changes**: Changes should persist
- **Cancel/Discard**: Unsaved changes handling
- **Validation**: Required field enforcement

#### Settings & Account Options
**Typical Settings** (if implemented):
- **Notification Preferences**
- **Privacy Settings**  
- **Account Management**
- **Logout**: Sign out functionality
- **Delete Account**: Account deletion (if implemented)

---

## 🧪 Critical Multi-Account Test Scenarios

### Complete User Journey Testing
**Required**: 3+ test accounts

#### Scenario 1: Full Match & Chat Flow
1. **Account A**: Complete onboarding, upload photos
2. **Account B**: Complete onboarding, upload photos  
3. **Account A**: Discover and like Account B
4. **Account B**: Discover and like Account A back
5. **Verify**: Both see "It's a Match!" notification
6. **Verify**: Match appears in both accounts' Matches tab
7. **Account A**: Send first message to Account B
8. **Account B**: Receive and reply to message
9. **Verify**: Bidirectional messaging works
10. **Verify**: Chat shows in both accounts' Chat tab

#### Scenario 2: Game Creation & Management
1. **Account A**: Create a new game (2 spots available)
2. **Account B**: Apply to join Account A's game
3. **Account C**: Also apply to join the same game
4. **Account A**: View applicants, accept Account B, decline Account C
5. **Verify**: Account B sees "Accepted" status
6. **Verify**: Account C sees "Declined" status  
7. **Account A**: Check participant list shows Account B
8. **Test**: Try to have Account D apply when game is full

#### Scenario 3: Cross-Feature Integration
1. **Accounts A & B**: Match through discovery
2. **Account A**: Create a game
3. **Account A**: Message Account B about the game
4. **Account B**: Apply to Account A's game through Games tab
5. **Account A**: Accept Account B
6. **Both**: Continue messaging about game details
7. **Verify**: All interactions work seamlessly together

---

## 🔍 City Filtering Security Tests 🆕

### Critical Security Testing
**Purpose**: Ensure users only see content from their city

#### User Discovery Filtering
**Test Setup**: 
- Create accounts with different cities (may need database manipulation)
- **Expected**: Users only see other users from the same city

#### Game Filtering  
- Games should only show from users in the same city
- Users from different cities cannot join each other's games

#### Match Prevention
- Users from different cities should not be able to match
- Like/pass actions should be city-validated

#### Message Security
- Users from different cities should not be able to message
- Conversation access should be city-restricted

---

## 📊 Performance & Edge Case Testing

### Data Loading Tests
- **Slow Network**: Test app behavior on poor connections
- **Offline Mode**: What happens without internet?
- **Large Data Sets**: Many matches, messages, games
- **Empty States**: No matches, no games, no messages

### Form Validation Edge Cases
- **Special Characters**: Test Unicode, emojis in text fields
- **Very Long Text**: Exceed character limits
- **Boundary Values**: Min/max ages, dates, etc.
- **SQL Injection**: Security testing with malicious inputs

### Photo Upload Edge Cases  
- **File Size Limits**: Very large images
- **File Type Validation**: Non-image files
- **Corrupt Images**: Damaged image files
- **Multiple Upload**: Adding many photos quickly

### Real-time Updates Testing
- **Multiple Devices**: Same account on different devices
- **Network Interruption**: Connection drops during actions
- **Simultaneous Actions**: Multiple users acting at once

---

## 🐛 Common Issues to Watch For

### Authentication Issues
- ❌ Email verification not working
- ❌ Social login failures or loops
- ❌ Profile data not saving during onboarding
- ❌ City not being assigned to new users

### Discovery/Matching Issues  
- ❌ Cards not loading or infinite loading
- ❌ Swipes not registering
- ❌ Matches not appearing immediately
- ❌ Cross-city users appearing (CRITICAL SECURITY BUG)

### Game Management Issues
- ❌ Games not creating or saving
- ❌ Applications not reaching game hosts
- ❌ Status updates not reflecting correctly
- ❌ Game capacity not being enforced

### Messaging Issues
- ❌ Messages not sending or arriving
- ❌ Real-time updates not working
- ❌ Chat history not loading
- ❌ Cross-city messaging possible (CRITICAL SECURITY BUG)

### Profile Issues
- ❌ Photo uploads failing or corrupting
- ❌ Profile changes not saving
- ❌ Profile data not displaying correctly

---

## 📝 QA Reporting Template

For each bug found, report:

### Bug Report Format
```
**Bug ID**: [Unique identifier]
**Severity**: Critical/High/Medium/Low
**Page/Feature**: [Where the bug occurs]
**Steps to Reproduce**:
1. [Step 1]
2. [Step 2] 
3. [Step 3]

**Expected Result**: [What should happen]
**Actual Result**: [What actually happens]
**Device/Browser**: [Testing environment]
**Screenshots**: [If applicable]
**Additional Notes**: [Any other relevant info]
```

### Critical Bug Categories
- **🚨 Security Issues**: Cross-city data leakage
- **💥 App Crashes**: Application stops working
- **🔒 Authentication Failures**: Can't log in/register
- **📱 Core Feature Broken**: Swiping, matching, messaging not working
- **💾 Data Loss**: Profile/message/game data disappearing

---

## ✅ Testing Completion Checklist

### Authentication & Onboarding
- [ ] Email/password registration (all 8 steps)
- [ ] Google social login
- [ ] Apple social login (if on iOS)
- [ ] Email/password sign-in
- [ ] City dropdown behavior (not auto-opening)
- [ ] Photo upload and cropping
- [ ] Profile completion validation

### Core App Functions
- [ ] Discover page swiping (like/pass)
- [ ] Profile expansion and navigation
- [ ] Match creation and notifications
- [ ] Games creation and management
- [ ] Game applications and approvals
- [ ] Real-time messaging
- [ ] Profile editing and saving

### Multi-Account Flows
- [ ] Complete match creation flow (2 accounts)
- [ ] Game creation and joining (3+ accounts)
- [ ] Cross-account messaging
- [ ] Match and game status synchronization

### City Filtering Security
- [ ] Discovery shows only same-city users
- [ ] Games show only same-city content
- [ ] No cross-city matching possible
- [ ] No cross-city messaging possible
- [ ] Social login users get assigned city

### Edge Cases & Performance
- [ ] Empty states (no matches, games, messages)
- [ ] Large file uploads
- [ ] Network interruption handling
- [ ] Form validation edge cases
- [ ] Real-time update reliability

---

## 🚀 Post-Testing Launch Readiness

### Green Light Criteria
✅ **All critical bugs resolved**
✅ **City filtering security confirmed**
✅ **Core user flows working end-to-end**
✅ **Multi-account testing passed**
✅ **Performance acceptable across devices**

### Final Launch Checklist
- [ ] All QA testing completed
- [ ] Critical bugs fixed and retested  
- [ ] Security review passed
- [ ] Performance benchmarks met
- [ ] User experience flows validated

**The app is launch-ready when all critical functionality works reliably and securely across multiple test accounts and use cases.**
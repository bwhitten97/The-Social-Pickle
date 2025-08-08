import { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import ChatRoom from '../components/ChatRoom';
import Notification from '../components/Notification';
import { messageService, sendMessageBetweenUsers, deleteConversation } from '../services/messageService';
import { notificationService } from '../services/notificationService';
import './Chat.css';
import '../components/SwipeableCard.css';

// SwipeableChat component for swipe-to-delete functionality
const SWIPE_THRESHOLD = 40; // px - minimum swipe distance to trigger action
const MAX_SWIPE_DISTANCE = 80; // px - maximum swipe distance allowed
const UNREAD_BADGE_LIMIT = 9; // Maximum number to show in unread badge before showing "9+"

const SwipeableChatCard = memo(({ chat, index, onSelect, onDelete, isEditMode, isSelected, onToggleSelection }) => {
  const [swipeX, setSwipeX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const handleTouchStart = useCallback((e) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - startX;
    
    // Only allow swiping right (positive deltaX) and limit the distance
    if (deltaX > 0) {
      setSwipeX(Math.min(deltaX, MAX_SWIPE_DISTANCE));
    }
  }, [isDragging, startX]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    
    // If swiped less than threshold, snap back to original position
    if (swipeX < SWIPE_THRESHOLD) {
      setSwipeX(0);
    } else {
      // If swiped more than threshold, show delete button
      setSwipeX(MAX_SWIPE_DISTANCE);
    }
  }, [swipeX]);

  const handleMouseDown = useCallback((e) => {
    setStartX(e.clientX);
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const deltaX = currentX - startX;
    
    // Only allow swiping right (positive deltaX) and limit the distance
    if (deltaX > 0) {
      setSwipeX(Math.min(deltaX, MAX_SWIPE_DISTANCE));
    }
  }, [isDragging, startX]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // If swiped less than threshold, snap back to original position
    if (swipeX < SWIPE_THRESHOLD) {
      setSwipeX(0);
    } else {
      // If swiped more than threshold, show delete button
      setSwipeX(MAX_SWIPE_DISTANCE);
    }
  }, [swipeX]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete(chat.name);
    setSwipeX(0); // Reset swipe position
  }, [chat.name, onDelete]);

  const handleCardClick = useCallback(() => {
    if (isEditMode) {
      // In edit mode, toggle selection
      onToggleSelection(chat.id);
    } else if (swipeX > 0) {
      // If swiped, close the swipe instead of opening chat
      setSwipeX(0);
    } else {
      // If not swiped, open the chat
      onSelect(chat);
    }
  }, [isEditMode, swipeX, chat, onSelect, onToggleSelection]);

  return (
    <div className="swipeable-chat-container">
      {/* Delete button that appears behind the card */}
      <div 
        className="chat-delete-action"
        style={{ 
          opacity: swipeX > 0 ? 1 : 0,
          transform: `translateX(${swipeX - MAX_SWIPE_DISTANCE}px)`
        }}
      >
        <button 
          className="chat-delete-action-btn"
          onClick={handleDelete}
          title="Delete conversation"
        >
          🗑️
        </button>
      </div>

      {/* Main chat card */}
      <article 
        className={`chat-card-modern fade-in-${(index % 4) + 1} ${chat.unread > 0 ? 'has-unread' : ''}`}
        style={{ 
          transform: `translateX(${swipeX}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCardClick}
      >
        {/* Selection circle in edit mode */}
        {isEditMode && (
          <div className={`chat-selection-circle ${isSelected ? 'selected' : ''}`}>
            {isSelected && <span className="checkmark">✓</span>}
          </div>
        )}
        <div className={`chat-avatar-modern color-${chat.name.length % 10}`}>
          {chat.avatar}
        </div>
        <div className="chat-content-modern">
          <h2 className="chat-name-modern">
            {chat.name}
            {chat.isDummy && <span className="demo-badge">Demo</span>}
          </h2>
          <p className="chat-message-modern">{chat.lastMessage}</p>
        </div>
        <div className="chat-meta-modern">
          <time className="chat-time-modern">{chat.timestamp}</time>
          {chat.unread > 0 && (
            <span className="chat-badge-modern">
              {chat.unread > UNREAD_BADGE_LIMIT ? `${UNREAD_BADGE_LIMIT}+` : chat.unread}
            </span>
          )}
        </div>
      </article>
    </div>
  );
});

SwipeableChatCard.displayName = 'SwipeableChatCard';

const DirectMessageChat = memo(({ chat, onClose, onSendMessage, onDeleteChat, onShowNotification }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [firebaseMessages, setFirebaseMessages] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  
  // Set up Firebase conversation listener for Firebase chats
  useEffect(() => {
    if (!chat.isFirebaseChat || !user?.id || !chat.chatRoom) return;
    
    const otherUserId = chat.chatRoom.participants.find(id => id !== user.id);
    if (!otherUserId) return;
    
    console.log('🔍 DIRECT_CHAT: Setting up conversation listener', {
      userId1: user.id,
      userId2: otherUserId,
      chatId: chat.id
    });
    
    // Immediately mark messages as read when conversation opens
    console.log('🔍 DIRECT_CHAT: Immediately marking messages as read on conversation open');
    messageService.markMessagesAsRead(user.id, otherUserId)
      .then(result => {
        console.log('🔍 DIRECT_CHAT: Initial mark as read result:', result);
      })
      .catch(error => {
        console.error('🔍 DIRECT_CHAT: Error in initial mark as read:', error);
      });
    
    const unsubscribe = messageService.setupConversationListener(
      user.id,
      otherUserId,
      (messages) => {
        console.log('🔍 DIRECT_CHAT: Received messages for conversation:', messages.length);
        setFirebaseMessages(messages);
        
        // Also mark as read whenever new messages arrive
        const unreadMessages = messages.filter(msg => !msg.read && msg.fromUserId !== user.id);
        if (unreadMessages.length > 0) {
          console.log('🔍 DIRECT_CHAT: Found unread messages in listener, marking as read');
          messageService.markMessagesAsRead(user.id, otherUserId)
            .then(result => {
              console.log('🔍 DIRECT_CHAT: Listener mark as read result:', result);
            })
            .catch(error => {
              console.error('🔍 DIRECT_CHAT: Error in listener mark as read:', error);
            });
        }
      }
    );
    
    return () => unsubscribe();
  }, [chat.isFirebaseChat, chat.chatRoom, user?.id, chat.id]);
  
  // All chats now use Firebase - simplified to Firebase only
  const [messages, setMessages] = useState([]);

  // Update messages when Firebase messages change
  useEffect(() => {
    if (chat.isFirebaseChat && firebaseMessages.length > 0) {
      const formattedMessages = firebaseMessages.map(msg => ({
        id: msg.id,
        from: msg.fromUserName,
        message: msg.message,
        timestamp: msg.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        isCurrentUser: msg.fromUserId === user?.id
      }));
      setMessages(formattedMessages);
    }
  }, [firebaseMessages, chat.isFirebaseChat, user?.id]);

  // Mark messages as read when conversation is active
  useEffect(() => {
    if (!chat.isFirebaseChat || !chat.chatRoom || !user?.id || firebaseMessages.length === 0) return;
    
    const otherUserId = chat.chatRoom.participants.find(id => id !== user.id);
    if (!otherUserId) return;
    
    // Check if there are any unread messages from the other user
    const unreadMessages = firebaseMessages.filter(msg => 
      !msg.read && msg.fromUserId !== user.id
    );
    
    if (unreadMessages.length > 0) {
      console.log('🔍 DIRECT_CHAT: Found', unreadMessages.length, 'unread messages, marking as read');
      
      // Mark messages as read after a short delay to ensure the user sees them
      const timeoutId = setTimeout(async () => {
        try {
          const result = await messageService.markMessagesAsRead(user.id, otherUserId);
          console.log('🔍 DIRECT_CHAT: Marked messages as read:', result);
        } catch (error) {
          console.error('🔍 DIRECT_CHAT: Error marking messages as read:', error);
        }
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timeoutId);
    }
  }, [firebaseMessages, chat.isFirebaseChat, chat.chatRoom, user?.id]);

  // Update messages when conversation changes (new messages from matches page)
  useEffect(() => {
    // This effect is no longer needed since we only use Firebase messages
    // Firebase messages are handled by the real-time listener above
  }, [firebaseMessages, user?.name]);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    
    if (chat.isFirebaseChat && chat.chatRoom && user?.id) {
      // Firebase chat - send through Firebase
      const otherUserId = chat.chatRoom.participants.find(id => id !== user.id);
      if (otherUserId) {
        console.log('🔍 DIRECT_CHAT: Sending Firebase message', {
          fromUserId: user.id,
          fromUserName: user?.name,
          toUserId: otherUserId,
          toUserName: chat.name,
          message: messageText
        });
        
        try {
          const result = await sendMessageBetweenUsers(
            user.id,
            user?.name,
            otherUserId,
            chat.name,
            messageText
          );
          
          console.log('🔍 DIRECT_CHAT: Firebase message result:', result);
          
          if (result.success) {
            // Message will be added to UI automatically via the listener
            setNewMessage('');
          } else {
            console.error('🔍 DIRECT_CHAT: Failed to send message:', result.error);
          }
        } catch (error) {
          console.error('🔍 DIRECT_CHAT: Error sending message:', error);
        }
      }
    }
  }, [newMessage, chat, user]);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  // Function to fetch user profile data
  const fetchUserProfile = useCallback(async (userId) => {
    try {
      setLoadingProfile(true);
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        console.log('🔍 PROFILE: Fetched user profile:', userData);
      } else {
        console.log('🔍 PROFILE: No user document found');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('🔍 PROFILE: Error fetching user profile:', error);
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // Fetch profile when modal opens
  useEffect(() => {
    if (showProfileModal && chat.isFirebaseChat && chat.chatRoom && user?.id) {
      const otherUserId = chat.chatRoom.participants.find(id => id !== user.id);
      if (otherUserId) {
        console.log('🔍 PROFILE: Fetching profile for user:', otherUserId);
        fetchUserProfile(otherUserId);
      }
    } else if (!showProfileModal) {
      // Clear profile data when modal closes
      setUserProfile(null);
    }
  }, [showProfileModal, chat, user?.id, fetchUserProfile]);

  const handleDeleteChat = useCallback(async () => {
    if (!user?.id || !chat.otherUserId) {
      console.error('Missing user ID or other user ID for chat deletion');
      return;
    }
    
    try {
      const result = await deleteConversation(user.id, chat.otherUserId);
      
      if (result.success) {
        if (onShowNotification) {
          onShowNotification({
            message: `Deleted conversation with ${chat.name}`,
            name: `${result.deletedCount} messages removed`,
            emoji: "🗑️"
          });
        }
        // Close the chat after deletion
        if (onClose) {
          onClose();
        }
      } else {
        if (onShowNotification) {
          onShowNotification({
            message: "Failed to delete conversation",
            name: result.error || "Unknown error",
            emoji: "❌"
          });
        }
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      if (onShowNotification) {
        onShowNotification({
          message: "Failed to delete conversation",
          name: "Please try again",
          emoji: "❌"
        });
      }
    }
  }, [user?.id, chat.otherUserId, chat.name, onShowNotification, onClose]);

  return (
    <>
      <div className="unified-chat">
      {/* Header */}
      <div className="unified-chat-header">
        <button className="back-btn" onClick={onClose}>
          ←
        </button>
        <div className="chat-avatar">
          {chat.avatar}
        </div>
        <div className="chat-details">
          <h3>{chat.name}</h3>
          <span className="status">Active now</span>
        </div>
        {chat.isDummy && <span className="demo-badge">Demo</span>}
        {!chat.isDummy && (
          <div className="chat-header-actions">
            <button className="view-profile-btn" onClick={() => {
              console.log('🔍 PROFILE: View Profile button clicked', { 
                chatId: chat.id, 
                chatName: chat.name, 
                isDummy: chat.isDummy,
                isFirebaseChat: chat.isFirebaseChat,
                currentShowState: showProfileModal
              });
              setShowProfileModal(true);
            }} title="View profile">
              View Profile
            </button>
            <button className="delete-chat-btn" onClick={handleDeleteChat} title="Delete conversation">
              🗑️
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="unified-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`unified-message ${msg.isCurrentUser ? 'sent' : 'received'}`}>
            <div className="message-bubble">
              <p>{msg.message}</p>
              <span className="message-timestamp">{formatTime(msg.timestamp)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="unified-input">
        <form onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field"
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!newMessage.trim()}
          >
            →
          </button>
        </form>
      </div>
    </div>

    {/* Profile Modal - Styled to match SwipeableCard */}
    {showProfileModal && (
      console.log('🔍 PROFILE: Rendering profile modal', { 
        showProfileModal, 
        userProfile, 
        loadingProfile, 
        chatName: chat.name 
      }) || true
    ) && (
      <div className="profile-modal-overlay" onClick={() => setShowProfileModal(false)}>
        <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="swipeable-card profile-modal-card" style={{position: 'static', transform: 'none', zIndex: 'auto', cursor: 'default'}}>
            {/* Close button */}
            <button 
              className="profile-modal-close" 
              onClick={() => setShowProfileModal(false)}
              title="Close profile"
            >
              ✕
            </button>
            
            {/* Profile Image Section */}
            <div className="swipeable-card-image-section">
              <div className="swipeable-card-image-container">
                {(() => {
                  const imageUrl = userProfile?.profilePictureUrl || userProfile?.profilePicture || userProfile?.image || userProfile?.avatar;
                  console.log('🔍 PROFILE_IMAGE: Profile image check', {
                    userProfile,
                    profilePictureUrl: userProfile?.profilePictureUrl,
                    profilePicture: userProfile?.profilePicture,
                    image: userProfile?.image,
                    avatar: userProfile?.avatar,
                    finalImageUrl: imageUrl,
                    hasImage: !!imageUrl
                  });
                  
                  return imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={`Portrait of ${userProfile?.name || chat.name}`}
                      className="swipeable-card-image"
                      onError={(e) => {
                        console.log('🔍 PROFILE_IMAGE: Image failed to load', imageUrl);
                        console.error('Image load error:', e);
                      }}
                      onLoad={() => {
                        console.log('🔍 PROFILE_IMAGE: Image loaded successfully', imageUrl);
                      }}
                    />
                  ) : (
                    <div className="swipeable-card-placeholder">
                      <span className="swipeable-card-initials">
                        {chat.avatar || (userProfile?.name || chat.name)?.split(' ').map(n => n[0]).join('') || '?'}
                      </span>
                    </div>
                  );
                })()}
              </div>
              
              {/* Distance Badge - Only show if available */}
              {userProfile?.distance && 
               userProfile.distance !== '-- miles away' && 
               userProfile.distance !== '--' && 
               !userProfile.distance.includes('--') && (
                <div className="swipeable-card-distance">
                  <svg xmlns="http://www.w3.org/2000/svg" className="swipeable-card-distance-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {userProfile.distance}
                </div>
              )}
            </div>

            {/* Details Section */}
            <div className="swipeable-card-details">
              {loadingProfile ? (
                <div className="profile-loading">
                  <p>Loading profile...</p>
                </div>
              ) : userProfile ? (
                <>
                  {/* Header: Name, Age (left) + Skill Level or DUPR (right) */}
                  <div className="swipeable-card-header">
                    <h2 className="swipeable-card-name">
                      <span className="swipeable-card-name-bold">{userProfile.name || chat.name}</span>
                      {userProfile.age && <>, {userProfile.age}</>}
                    </h2>
                    <span className="swipeable-card-skill-text">
                      {userProfile.duprRating && userProfile.duprRating !== 'unrated' && userProfile.duprRating !== '' 
                        ? `DUPR: ${userProfile.duprRating}`
                        : userProfile.skillLevel 
                          ? userProfile.skillLevel.charAt(0).toUpperCase() + userProfile.skillLevel.slice(1).toLowerCase() 
                          : 'Not Specified'}
                    </span>
                  </div>

                  {/* Availability */}
                  {userProfile.availability && userProfile.availability.length > 0 && (
                    <div className="swipeable-card-availability">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="swipeable-card-info-icon">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span className="swipeable-card-availability-colon">:</span>
                      <div className="swipeable-card-availability-tags">
                        {userProfile.availability.map((time, index) => (
                          <span key={index} className="swipeable-card-availability-tag">
                            {time.charAt(0).toUpperCase() + time.slice(1).toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bio Section */}
                  <div className="swipeable-card-bio-section">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="swipeable-card-info-icon">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="swipeable-card-bio-colon">:</span>
                    <div className="swipeable-card-bio-content">
                      {userProfile.bio && userProfile.bio.trim() !== '' ? (
                        <p className="swipeable-card-bio-text">{userProfile.bio}</p>
                      ) : (
                        <p className="swipeable-card-bio-fallback">
                          {(userProfile.name || chat.name)?.split(' ')[0] || 'User'} is new to The Social Pickle
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="swipeable-card-header">
                  <h2 className="swipeable-card-name">
                    <span className="swipeable-card-name-bold">{chat.name}</span>
                  </h2>
                  <div className="swipeable-card-bio-section">
                    <p className="swipeable-card-bio-fallback">Profile information not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </>
  );
});

DirectMessageChat.displayName = 'DirectMessageChat';

const Chat = memo(({ appNotifications = [], onNotificationsRead }) => {
  const { user } = useAuth();
  const location = useLocation();
  // Removed GameContext messaging - now using Firebase only
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatUnreadCounts, setChatUnreadCounts] = useState({});
  const [notification, setNotification] = useState(null);
  const [realChats, setRealChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [realNotifications, setRealNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());
  const [deletedChats, setDeletedChats] = useState(new Set());
  
  // Set up real-time listeners for chats and notifications
  useEffect(() => {
    if (!user?.id) {
      setIsLoadingChats(false);
      setIsLoadingNotifications(false);
      return;
    }

    console.log('🔍 CHAT: Setting up listeners for user:', user.id);
    console.log('🔍 CHAT: User object:', user);
    
    let isMounted = true;
    let unsubscribeChats = null;
    let unsubscribeNotifications = null;
    
    // Reset loading states
    setIsLoadingChats(true);
    setIsLoadingNotifications(true);
    
    try {
      // Set up chat rooms listener with error handling
      unsubscribeChats = messageService.setupChatRoomsListener(
        user.id,
        (chatRooms) => {
          if (!isMounted) return;
          console.log('🔍 CHAT: Received chat rooms callback with:', chatRooms.length, 'rooms');
          console.log('🔍 CHAT: Chat rooms data:', chatRooms);
          setRealChats(chatRooms);
          setIsLoadingChats(false);
        }
      );

      // Set up notifications listener with error handling
      unsubscribeNotifications = notificationService.setupNotificationsListener(
        user.id,
        (notifications) => {
          if (!isMounted) return;
          console.log('🔍 CHAT: Received notifications callback with:', notifications.length, 'notifications');
          console.log('🔍 CHAT: Notifications data:', notifications);
          setRealNotifications(notifications);
          setIsLoadingNotifications(false);
        }
      );
    } catch (error) {
      console.error('🔍 CHAT: Error setting up listeners:', error);
      if (isMounted) {
        setIsLoadingChats(false);
        setIsLoadingNotifications(false);
      }
    }

    return () => {
      isMounted = false;
      console.log('🔍 CHAT: Cleaning up listeners');
      
      try {
        if (typeof unsubscribeChats === 'function') {
          unsubscribeChats();
        }
        if (typeof unsubscribeNotifications === 'function') {
          unsubscribeNotifications();
        }
      } catch (error) {
        console.error('🔍 CHAT: Error during listener cleanup:', error);
      }
    };
  }, [user?.id]);

  // Handle navigation state for opening chat with specific user (from Games page)
  useEffect(() => {
    // Guard to ensure we handle navigation state only once per mount
    const handledRef = (Chat.__handledNavRef = Chat.__handledNavRef || { current: false });
    try {
      if (!handledRef.current && location.state?.openChatWithUser) {
        const openChatUser = location.state.openChatWithUser;
        console.log('🔍 CHAT: Opening chat with user from navigation:', openChatUser);
        
        if (openChatUser.id && openChatUser.name) {
          // Set up the chat immediately
          setSelectedChatId(openChatUser.id);
          setSelectedChatName(openChatUser.name);
          setActiveTab('chat');
          handledRef.current = true;
        } else {
          console.warn('🔍 CHAT: Invalid openChatWithUser data:', openChatUser);
        }
      }
    } catch (error) {
      console.error('🔍 CHAT: Error handling navigation state:', error);
    }
  }, [location.state]);

  // Filter appNotifications to only show ones for current user or general notifications
  const userNotifications = useMemo(() => {
    return appNotifications.filter(notification => 
      !notification.targetUser || notification.targetUser === user?.name
    );
  }, [appNotifications, user?.name]);
  
  // Combine real notifications and app notifications only
  const notifications = useMemo(() => {
    return [...realNotifications, ...userNotifications];
  }, [realNotifications, userNotifications]);
  
  // Helper function to format timestamps like iMessage
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return 'Now';
    
    // Handle Firebase Timestamp objects
    let date;
    if (timestamp && timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Now';
    }
    
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Today - show time
    if (diffDays === 0 && date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Within 7 days - show day name
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    
    // Within this year - show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    // Older - show full date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  // Helper function to get user initials based on name
  const getUserInitials = useCallback((name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      // First letter of first name + first letter of last name
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    } else {
      // Just first letter of single name
      return name[0].toUpperCase();
    }
  }, []);

  // Remove dummy chat initialization - only use real chats

  // Initialize unread counts for real game chats if not already set
  const initializeGameChatUnreadCounts = () => {
    // This function is no longer needed since we only use Firebase chats
  };

  // Initialize game chat unread counts
  initializeGameChatUnreadCounts();
  
  // Combine real chats, game chats and dummy chats
  const chatsToShow = useMemo(() => {
    // Transform realChats (from Firebase messages) to UI format
    const firebaseChats = realChats.map(room => ({
      id: room.id,
      name: room.gameName || room.otherUserName,
      lastMessage: room.lastMessage || 'Start a conversation',
      timestamp: formatTimestamp(room.lastMessageTime),
      avatar: getUserInitials(room.gameName || room.otherUserName),
      unread: room.unreadCount || 0,
      isDummy: false,
      isGameChat: false,
      isFirebaseChat: true,
      chatRoom: room
    }));

    // Only use Firebase chats now - GameContext messaging removed
    const chatsWithCounts = firebaseChats.map(chat => ({
      ...chat,
      unread: chat.unread || chatUnreadCounts[chat.id] || 0
    }));
    
    // Filter out deleted chats and show real chats only
    const filteredChats = chatsWithCounts.filter(chat => !deletedChats.has(chat.id));
    
    // Sort by most recent conversation first (like iMessage)
    return filteredChats.sort((a, b) => {
      // Extract the actual timestamp from the chatRoom object for accurate sorting
      const aTime = a.chatRoom?.lastMessageTime || a.chatRoom?.createdAt || new Date(0);
      const bTime = b.chatRoom?.lastMessageTime || b.chatRoom?.createdAt || new Date(0);
      
      // Convert Firebase Timestamps to Date objects if needed
      const aDate = aTime.toDate ? aTime.toDate() : new Date(aTime);
      const bDate = bTime.toDate ? bTime.toDate() : new Date(bTime);
      
      // Sort in descending order (most recent first)
      return bDate.getTime() - aDate.getTime();
    });
  }, [realChats, formatTimestamp, getUserInitials, chatUnreadCounts, deletedChats]);

  const handleChatSelect = useCallback(async (chat) => {
    // Mark chat as read by setting unread count to 0
    setChatUnreadCounts(prev => ({
      ...prev,
      [chat.id]: 0
    }));

    // For Firebase chats, mark messages as read in the database
    if (chat.isFirebaseChat && chat.chatRoom && user?.id) {
      const otherUserId = chat.chatRoom.participants.find(id => id !== user.id);
      if (otherUserId) {
        try {
          await messageService.markMessagesAsRead(user.id, otherUserId);
          console.log('🔍 CHAT: Marked messages as read for chat:', chat.id);
        } catch (error) {
          console.error('🔍 CHAT: Error marking messages as read:', error);
        }
      }
    }

    if (chat.isDummy) {
      // For dummy chats, create a functional chat experience
      setSelectedChatId(chat.id);
      setSelectedChatName(chat.name);
      return;
    }

    if (chat.isGameChat) {
      // This is a game chat - open ChatRoom component
      setSelectedChatId(chat.id);
      setSelectedChatName(chat.name);
    } else {
      // This is a direct message - open it as a regular chat
      setSelectedChatId(chat.id);
      setSelectedChatName(chat.name);
    }
  }, [user]);

  const handleCloseChat = useCallback(() => {
    setSelectedChatId(null);
    setSelectedChatName(null);
  }, []);

  const handleDeleteChat = useCallback((chatName) => {
    // Force a re-render by updating the chat unread counts (removing the deleted chat)
    setChatUnreadCounts(prev => {
      const updated = { ...prev };
      // Find and remove the chat ID for this chat name
      const chatToDelete = chatsToShow.find(chat => chat.name === chatName);
      if (chatToDelete) {
        delete updated[chatToDelete.id];
      }
      return updated;
    });
  }, [chatsToShow]);

  const handleDeleteChatFromSwipe = useCallback(async (chatName) => {
    console.log('🔍 SWIPE_DELETE: Attempting to delete chat:', chatName);
    
    // Find the chat by name
    const chatToDelete = chatsToShow.find(chat => chat.name === chatName);
    if (!chatToDelete) {
      console.log('🔍 SWIPE_DELETE: Chat not found');
      return;
    }
    
    if (chatToDelete.isFirebaseChat && chatToDelete.chatRoom && user?.id) {
      const otherUserId = chatToDelete.chatRoom.participants.find(id => id !== user.id);
      if (otherUserId) {
        console.log('🔍 SWIPE_DELETE: Deleting Firebase conversation between', user.id, 'and', otherUserId);
        
        try {
          const result = await deleteConversation(user.id, otherUserId);
          if (result.success) {
            console.log('🔍 SWIPE_DELETE: Successfully deleted conversation:', result.deletedCount, 'messages');
            
            // Clean up local state
            setChatUnreadCounts(prev => {
              const updated = { ...prev };
              delete updated[chatToDelete.id];
              return updated;
            });
            
            setNotification({
              message: `Deleted conversation with ${chatName}`,
              name: '',
              emoji: '🗑️'
            });
          } else {
            console.error('🔍 SWIPE_DELETE: Failed to delete conversation:', result.error);
            setNotification({
              message: "Failed to delete conversation",
              name: '',
              emoji: '❌'
            });
          }
        } catch (error) {
          console.error('🔍 SWIPE_DELETE: Error deleting conversation:', error);
          setNotification({
            message: "Error deleting conversation",
            name: '',
            emoji: '❌'
          });
        }
      }
    } else {
      // Handle non-Firebase chats (just hide locally)
      setChatUnreadCounts(prev => {
        const updated = { ...prev };
        delete updated[chatToDelete.id];
        return updated;
      });
      setDeletedChats(prev => new Set([...prev, chatToDelete.id]));
      
      setNotification({
        message: `Deleted conversation with ${chatName}`,
        name: '',
        emoji: '🗑️'
      });
    }
  }, [chatsToShow, user?.id]);

  const [readNotifications, setReadNotifications] = useState(new Set());

  const handleNotificationClick = useCallback(async (notificationId) => {
    // Mark notification as read locally
    setReadNotifications(prev => new Set([...prev, notificationId]));
    
    console.log('🔔 NOTIFICATION: Clicking notification', notificationId);
    
    // Find the notification to determine if it's a Firebase notification
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      console.log('🔔 NOTIFICATION: Found notification', { 
        id: notification.id, 
        type: notification.type,
        isFirebaseNotif: typeof notification.id === 'string' && notification.id.length > 10
      });
      
      // Mark Firebase notifications as read in the database
      if (typeof notification.id === 'string' && notification.id.length > 10) {
        console.log('🔔 NOTIFICATION: Marking Firebase notification as read in database');
        try {
          const result = await notificationService.markAsRead(notification.id);
          console.log('🔔 NOTIFICATION: Mark as read result:', result);
        } catch (error) {
          console.error('🔔 NOTIFICATION: Error marking notification as read:', error);
        }
      }
      
      // Notify parent component about notification being read (for app notifications only)
      if (onNotificationsRead && typeof notificationId !== 'string') {
        onNotificationsRead([notificationId]);
      }
      
      // Navigation logic based on notification type
      switch (notification.type) {
        case 'match':
        case 'like':
        case 'action':
        case 'system':
        case 'game_application':
        case 'application_status':
          // These are our notifications - just mark as read
          break;
        case 'court_availability':
          // Navigate to court booking or show details
          alert(`Court availability: ${notification.message}`);
          break;
        case 'friend_request':
          // Navigate to friend requests
          alert(`Friend request: ${notification.message}`);
          break;
        case 'game_reminder':
          // Navigate to game details
          alert(`Game reminder: ${notification.message}`);
          break;
        default:
          break;
      }
    }
  }, [notifications, onNotificationsRead]);

  const markAllNotificationsAsRead = useCallback(async () => {
    const unreadNotificationIds = notifications
      .filter(n => !readNotifications.has(n.id) && !n.read)
      .map(n => n.id);
    
    console.log('🔔 NOTIFICATION: Marking all notifications as read', unreadNotificationIds);
    
    // Mark all notifications as read locally
    setReadNotifications(prev => new Set([...prev, ...unreadNotificationIds]));
    
    // Mark Firebase notifications as read in the database
    const firebaseNotificationIds = unreadNotificationIds.filter(id => typeof id === 'string' && id.length > 10);
    if (firebaseNotificationIds.length > 0) {
      console.log('🔔 NOTIFICATION: Marking Firebase notifications as read:', firebaseNotificationIds);
      try {
        const promises = firebaseNotificationIds.map(id => notificationService.markAsRead(id));
        const results = await Promise.all(promises);
        console.log('🔔 NOTIFICATION: Mark all as read results:', results);
      } catch (error) {
        console.error('🔔 NOTIFICATION: Error marking notifications as read:', error);
      }
    }
    
    // Notify parent component about app notifications being read
    const appNotificationIds = unreadNotificationIds.filter(id => typeof id !== 'string');
    if (onNotificationsRead && appNotificationIds.length > 0) {
      onNotificationsRead(appNotificationIds);
    }
  }, [notifications, readNotifications, onNotificationsRead]);

  // Edit mode handlers
  const handleEditMode = useCallback(() => {
    setIsEditMode(!isEditMode);
    setSelectedChats(new Set()); // Clear selections when toggling edit mode
  }, [isEditMode]);

  const handleChatSelection = useCallback((chatId) => {
    setSelectedChats(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(chatId)) {
        newSelected.delete(chatId);
      } else {
        newSelected.add(chatId);
      }
      return newSelected;
    });
  }, []);

  const handleMarkAsUnread = useCallback(() => {
    selectedChats.forEach(chatId => {
      setChatUnreadCounts(prev => ({
        ...prev,
        [chatId]: (prev[chatId] || 0) + 1
      }));
    });
    setSelectedChats(new Set());
    setIsEditMode(false);
  }, [selectedChats]);

  const handleDeleteSelected = useCallback(async () => {
    const chatIds = Array.from(selectedChats);
    console.log('🔍 DELETE: Deleting chats:', chatIds);
    
    let deletedCount = 0;
    
    for (const chatId of chatIds) {
      const chatToDelete = chatsToShow.find(chat => chat.id === chatId);
      console.log('🔍 DELETE: Found chat to delete:', chatToDelete);
      
      if (chatToDelete && chatToDelete.isFirebaseChat && chatToDelete.chatRoom && user?.id) {
        const otherUserId = chatToDelete.chatRoom.participants.find(id => id !== user.id);
        if (otherUserId) {
          console.log('🔍 DELETE: Deleting Firebase conversation between', user.id, 'and', otherUserId);
          
          try {
            const result = await deleteConversation(user.id, otherUserId);
            if (result.success) {
              console.log('🔍 DELETE: Successfully deleted conversation:', result.deletedCount, 'messages');
              deletedCount++;
              
              // Clean up local state
              setChatUnreadCounts(prev => {
                const updated = { ...prev };
                delete updated[chatId];
                return updated;
              });
            } else {
              console.error('🔍 DELETE: Failed to delete conversation:', result.error);
            }
          } catch (error) {
            console.error('🔍 DELETE: Error deleting conversation:', error);
          }
        }
      } else if (chatToDelete) {
        // Handle other types of chats (local state only)
        setChatUnreadCounts(prev => {
          const updated = { ...prev };
          delete updated[chatId];
          return updated;
        });
        setDeletedChats(prev => new Set([...prev, chatId]));
        deletedCount++;
      }
    }
    
    // Show notification for deleted chats
    if (deletedCount > 0) {
      setNotification({
        message: `Deleted ${deletedCount} conversation${deletedCount > 1 ? 's' : ''}`,
        name: '',
        emoji: '🗑️'
      });
    }
    
    setSelectedChats(new Set());
    setIsEditMode(false);
  }, [selectedChats, chatsToShow, user?.id, setChatUnreadCounts, setNotification]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => {
      // Firebase notifications use 'read' property, app notifications use 'isRead'
      const isNotificationRead = n.read !== undefined ? n.read : n.isRead;
      return !isNotificationRead && !readNotifications.has(n.id);
    }).length;
  }, [notifications, readNotifications]);
  
  // Calculate total unread chat messages
  const totalUnreadChats = useMemo(() => {
    return chatsToShow.reduce((total, chat) => total + (chat.unread || 0), 0);
  }, [chatsToShow]);

  // Note: Unread count tracking is now handled globally in App.jsx for real-time updates across all pages

  // If a chat is selected, show the appropriate chat component
  if (selectedChatId) {
    let selectedChat = chatsToShow.find(chat => chat.id === selectedChatId);
    
    // If chat not found in existing chats, create a new chat object for navigation
    if (!selectedChat && selectedChatName && user?.id) {
      selectedChat = {
        id: selectedChatId,
        name: selectedChatName,
        avatar: '👤',
        lastMessage: '',
        timestamp: new Date(),
        unreadCount: 0,
        isDummy: false,
        isFirebaseChat: true,
        chatRoom: {
          participants: [user.id, selectedChatId],
          createdAt: new Date(),
          lastMessage: '',
          lastMessageTimestamp: new Date()
        }
      };
    }
    
    if (selectedChat && selectedChat.isGameChat) {
      // Game chat - use ChatRoom component
      return (
        <ChatRoom gameId={selectedChatId} onClose={handleCloseChat} />
      );
    } else if (selectedChat) {
      // Direct message chat - use DirectMessageChat component
      return (
        <DirectMessageChat 
          chat={selectedChat} 
          onClose={handleCloseChat}
          onDeleteChat={handleDeleteChat}
          onShowNotification={setNotification}
        />
      );
    }
  }

  return (
    <div className="messages-modern">
      {/* Page Title */}
      <div className="messages-header-modern">
        <div className="messages-title-section">
          <h1 className="messages-title">
            <svg className="messages-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Messages
          </h1>
          <span className="messages-summary">{chatsToShow.length} chats · {totalUnreadChats} unread messages · {unreadNotificationsCount} unread notifications</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="messages-tabs-modern">
        <button 
          className={`tab-button-modern ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          Chat ({totalUnreadChats})
        </button>
        <button 
          className={`tab-button-modern ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
                  >
          <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications ({unreadNotificationsCount})
        </button>
      </div>

      {/* Chat Panel */}
      {activeTab === 'chat' && (
        <div className="chat-panel-modern">
          {/* Edit button and actions */}
          {chatsToShow.length > 0 && (
            <div className="chat-panel-header">
              {!isEditMode ? (
                <button className="edit-button" onClick={handleEditMode}>
                  Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="cancel-button" onClick={handleEditMode}>
                    Cancel
                  </button>
                  <div className="edit-action-buttons">
                    {selectedChats.size > 0 && (
                      <>
                        <button className="mark-unread-button" onClick={handleMarkAsUnread}>
                          Mark as Unread
                        </button>
                        <button className="delete-button" onClick={handleDeleteSelected}>
                          Delete ({selectedChats.size})
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {isLoadingChats ? (
            <div className="chat-loading">
              <div className="loading-spinner"></div>
              <p>Loading chats...</p>
            </div>
          ) : chatsToShow.length === 0 ? (
            <div className="no-chats-message">
              <p>No conversations yet. Start playing games to connect with other players!</p>
            </div>
          ) : (
            chatsToShow.map((chat, index) => (
              <SwipeableChatCard
                key={chat.id}
                chat={chat}
                index={index}
                onSelect={handleChatSelect}
                onDelete={handleDeleteChatFromSwipe}
                isEditMode={isEditMode}
                isSelected={selectedChats.has(chat.id)}
                onToggleSelection={handleChatSelection}
              />
            ))
          )}
        </div>
      )}

      {/* Notification Panel */}
      {activeTab === 'notifications' && (
        <div className="notification-panel-modern">
          {isLoadingNotifications ? (
            <div className="notification-loading">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : (
            <>
              {unreadNotificationsCount > 0 && (
                <div className="notification-header">
                  <button 
                    className="mark-all-read-btn"
                    onClick={markAllNotificationsAsRead}
                  >
                    Mark all as read
                  </button>
                </div>
              )}
              
              {notifications.map((notification, index) => (
            <article
              key={notification.id}
              className={`notification-card-modern fade-in-${(index % 4) + 1} ${!(notification.read !== undefined ? notification.read : notification.isRead) && !readNotifications.has(notification.id) ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="notification-icon-wrapper">
                <svg className="notification-icon-modern" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {!(notification.read !== undefined ? notification.read : notification.isRead) && !readNotifications.has(notification.id) && <div className="notification-unread-dot"></div>}
              </div>
              <div className="notification-content-modern">
                {notification.title && <strong>{notification.title}</strong>}
                {notification.title && notification.message && <br />}
                {notification.message}
              </div>
              <time className="notification-time-modern">
                {notification.timestamp || formatTimestamp(notification.createdAt)}
              </time>
            </article>
          ))}
          
              {notifications.length === 0 && (
                <div className="no-notifications-message">
                  <p>No notifications yet. We'll let you know when something important happens!</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Native Notification */}
      {notification && (
        <Notification
          message={notification.message}
          name={notification.name}
          emoji={notification.emoji}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
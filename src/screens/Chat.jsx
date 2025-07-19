import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import ChatRoom from '../components/ChatRoom';
import Notification from '../components/Notification';
import { defaultNotifications, dummyChats } from '../data/mockData';
import './Chat.css';

// SwipeableChat component for swipe-to-delete functionality
const SWIPE_THRESHOLD = 40; // px - minimum swipe distance to trigger action
const MAX_SWIPE_DISTANCE = 80; // px - maximum swipe distance allowed
const UNREAD_BADGE_LIMIT = 9; // Maximum number to show in unread badge before showing "9+"

const SwipeableChatCard = memo(({ chat, index, onSelect, onDelete }) => {
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
    if (swipeX > 0) {
      // If swiped, close the swipe instead of opening chat
      setSwipeX(0);
    } else {
      // If not swiped, open the chat
      onSelect(chat);
    }
  }, [swipeX, chat, onSelect]);

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
        className={`chat-card-modern fade-in-${(index % 4) + 1}`}
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
        <div className="chat-avatar-modern">
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
  const { getConversation, currentUserName, deleteChat } = useGameContext();
  const [newMessage, setNewMessage] = useState('');
  
  // Load actual conversation from GameContext
  const conversationMessages = getConversation(chat.name);
  
  // Convert GameContext messages to display format
  const [messages, setMessages] = useState(() => {
    if (conversationMessages.length > 0) {
      return conversationMessages.map(msg => ({
        id: msg.id,
        from: msg.from,
        message: msg.message,
        timestamp: msg.timestamp,
        isCurrentUser: msg.from === currentUserName
      }));
    } else {
      // If no conversation exists, show the last message as a received message
      return [
        {
          id: 1,
          from: chat.name,
          message: chat.lastMessage,
          timestamp: new Date(Date.now() - (60 * 60 * 1000)).toISOString(), // 1 hour ago
          isCurrentUser: false
        }
      ];
    }
  });

  // Update messages when conversation changes (new messages from matches page)
  useEffect(() => {
    const updatedConversation = getConversation(chat.name);
    if (updatedConversation.length > 0) {
      const formattedMessages = updatedConversation.map(msg => ({
        id: msg.id,
        from: msg.from,
        message: msg.message,
        timestamp: msg.timestamp,
        isCurrentUser: msg.from === currentUserName
      }));
      setMessages(formattedMessages);
    }
  }, [chat.name, currentUserName, getConversation]);

  const handleSendMessage = useCallback((e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      from: currentUserName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isCurrentUser: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // If this is a real chat, also send through the context
    if (onSendMessage && !chat.isDummy) {
      onSendMessage(chat.name, newMessage.trim());
    }
  }, [newMessage, currentUserName, chat.isDummy, chat.name, onSendMessage]);

  const formatTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  const handleDeleteChat = useCallback(() => {
    const result = deleteChat(chat.name);
    if (result.success) {
      // Show success notification
      if (onShowNotification) {
        onShowNotification({
          message: "Conversation deleted with",
          name: chat.name,
          emoji: "🗑️"
        });
      }
      if (onDeleteChat) {
        onDeleteChat(chat.name);
      }
      onClose();
    }
  }, [chat.name, deleteChat, onShowNotification, onDeleteChat, onClose]);

  return (
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
          <button className="delete-chat-btn" onClick={handleDeleteChat} title="Delete conversation">
            🗑️
          </button>
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
  );
});

DirectMessageChat.displayName = 'DirectMessageChat';

const Chat = memo(({ appNotifications = [], onUnreadCountsChange, onNotificationsRead }) => {
  const { user } = useAuth();
  const { getUserChatRooms, getConversation, sendMessage, currentUserName, deleteChat, getMessages } = useGameContext();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedChatName, setSelectedChatName] = useState(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [chatUnreadCounts, setChatUnreadCounts] = useState({});
  const [notification, setNotification] = useState(null);
  const [realChats, setRealChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [realNotifications, setRealNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  
  // Fetch real chats from Firestore
  const fetchChats = async () => {
    if (!user) {
      setIsLoadingChats(false);
      return;
    }

    try {
      setIsLoadingChats(true);
      
      // Query chats collection for current user
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where('participants', 'array-contains', user.id),
        orderBy('lastMessageTime', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedChats = [];
      
      querySnapshot.forEach((doc) => {
        const chatData = doc.data();
        
        // Get the other participant's name
        const otherParticipantId = chatData.participants.find(id => id !== user.id);
        const otherParticipantName = chatData.participantNames?.[otherParticipantId] || 'Unknown User';
        
        fetchedChats.push({
          id: doc.id,
          name: otherParticipantName,
          lastMessage: chatData.lastMessage || 'Start a conversation',
          timestamp: chatData.lastMessageTime?.toDate?.() || new Date(),
          avatar: '💬',
          unread: chatData.unreadCount?.[user.id] || 0,
          isDummy: false,
          isGameChat: false
        });
      });
      
      setRealChats(fetchedChats);
      
    } catch (error) {
      setRealChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Fetch real notifications from Firestore
  const fetchNotifications = async () => {
    if (!user) {
      setIsLoadingNotifications(false);
      return;
    }

    try {
      setIsLoadingNotifications(true);
      
      // Query notifications collection for current user
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef,
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedNotifications = [];
      
      querySnapshot.forEach((doc) => {
        const notificationData = doc.data();
        fetchedNotifications.push({
          id: doc.id,
          message: notificationData.message || 'New notification',
          timestamp: notificationData.createdAt?.toDate?.()?.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }) || 'Now',
          isRead: notificationData.isRead || false,
          type: notificationData.type || 'system',
          targetUser: notificationData.userId
        });
      });
      
      setRealNotifications(fetchedNotifications);
      
    } catch (error) {
      setRealNotifications([]);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Fetch data when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchChats();
      fetchNotifications();
    } else {
      setIsLoadingChats(false);
      setIsLoadingNotifications(false);
    }
  }, [user]);

  // Filter appNotifications to only show ones for current user or general notifications
  const userNotifications = useMemo(() => {
    return appNotifications.filter(notification => 
      !notification.targetUser || notification.targetUser === currentUserName
    );
  }, [appNotifications, currentUserName]);
  
  // Combine real notifications, app notifications and default notifications
  const notifications = useMemo(() => {
    return [...realNotifications, ...userNotifications, ...defaultNotifications];
  }, [realNotifications, userNotifications]);
  
  const userChatRooms = getUserChatRooms();

  // Helper function to format timestamps
  const formatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return 'Now';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }, []);

  // Helper function to get avatar emoji based on name
  const getAvatarEmoji = useCallback((name) => {
    const emojiMap = {
      'Sarah Wilson': '🦁',
      'Mike Chen': '🙂',
      'Jessica Martinez': '👩',
      'Priya Patel': '🌟',
      'Maria Gonzalez': '🎯'
    };
    return emojiMap[name] || '👤';
  }, []);

  // Initialize unread counts for dummy chats if not already set
  const initializeDummyUnreadCounts = () => {
    if (!chatUnreadCounts['dummy-sarah'] && !chatUnreadCounts['dummy-mike']) {
      setChatUnreadCounts({
        'dummy-sarah': 1,
        'dummy-mike': 1
      });
    }
  };

  // Dummy chats for demo purposes (shown when no real chats exist) - base data imported from mockData.js
  const dummyChatsWithCounts = dummyChats.map(chat => ({
    ...chat,
    unread: chatUnreadCounts[chat.id] || 0
  }));

  // Initialize dummy chat unread counts
  if (userChatRooms.length === 0) {
    initializeDummyUnreadCounts();
  }

  // Initialize unread counts for real game chats if not already set
  const initializeGameChatUnreadCounts = () => {
    if (userChatRooms.length > 0) {
      const newUnreadCounts = {};
      userChatRooms.forEach(room => {
        const chatId = room.gameId || room.id;
        if (chatUnreadCounts[chatId] === undefined) {
          // For new chat rooms, don't automatically set unread count
          // Let the user interaction determine if there are unread messages
          newUnreadCounts[chatId] = 0;
        }
      });
      
      if (Object.keys(newUnreadCounts).length > 0) {
        setChatUnreadCounts(prev => ({
          ...prev,
          ...newUnreadCounts
        }));
      }
    }
  };

  // Initialize game chat unread counts
  initializeGameChatUnreadCounts();
  
  // Combine real chats, game chats and dummy chats
  const chatsToShow = useMemo(() => {
    const gameChats = userChatRooms.map(room => ({
      id: room.gameId || room.id,
      name: room.gameName,
      lastMessage: room.lastMessage || 'Start a conversation',
      timestamp: formatTimestamp(room.lastMessageTime),
      avatar: getAvatarEmoji(room.gameName),
      unread: chatUnreadCounts[room.gameId || room.id] || 0,
      isDummy: false,
      isGameChat: !!room.gameId,
      chatRoom: room
    }));
    
    const allChats = [...realChats, ...gameChats];
    
    // Remove duplicates based on name
    const uniqueChats = allChats.filter((chat, index, self) => 
      index === self.findIndex(c => c.name === chat.name)
    );
    
    // Add unread counts for real chats
    const chatsWithCounts = uniqueChats.map(chat => ({
      ...chat,
      unread: chat.unread || chatUnreadCounts[chat.id] || 0
    }));
    
    // Fallback to dummy data if no chats
    return chatsWithCounts.length > 0 ? chatsWithCounts : dummyChatsWithCounts;
  }, [realChats, userChatRooms, dummyChatsWithCounts, formatTimestamp, getAvatarEmoji, chatUnreadCounts]);

  const handleChatSelect = useCallback((chat) => {
    // Mark chat as read by setting unread count to 0
    setChatUnreadCounts(prev => ({
      ...prev,
      [chat.id]: 0
    }));

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
  }, []);

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

  const handleDeleteChatFromSwipe = useCallback((chatName) => {
    // Call the deleteChat function from GameContext
    const result = deleteChat(chatName);
    if (result.success) {
      // Show success notification
      setNotification({
        message: "Conversation deleted with",
        name: chatName,
        emoji: "🗑️"
      });
      // Update local state
      handleDeleteChat(chatName);
    }
  }, [deleteChat, handleDeleteChat]);

  const [readNotifications, setReadNotifications] = useState(new Set());

  const handleNotificationClick = useCallback((notificationId) => {
    // Mark notification as read locally
    setReadNotifications(prev => new Set([...prev, notificationId]));
    
    // Notify parent component about notification being read (for app notifications only)
    if (onNotificationsRead && typeof notificationId !== 'string') {
      onNotificationsRead([notificationId]);
    }
    
    // Here you could add navigation logic based on notification type
    const notification = notifications.find(n => n.id === notificationId);
    if (notification) {
      switch (notification.type) {
        case 'match':
        case 'like':
        case 'action':
        case 'system':
          // These are our new app notifications - just mark as read
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

  const markAllNotificationsAsRead = useCallback(() => {
    const unreadNotificationIds = notifications
      .filter(n => !readNotifications.has(n.id) && !n.isRead)
      .map(n => n.id);
    
    // Mark all notifications as read locally
    setReadNotifications(prev => new Set([...prev, ...unreadNotificationIds]));
    
    // Notify parent component about app notifications being read
    const appNotificationIds = unreadNotificationIds.filter(id => typeof id !== 'string');
    if (onNotificationsRead && appNotificationIds.length > 0) {
      onNotificationsRead(appNotificationIds);
    }
  }, [notifications, readNotifications, onNotificationsRead]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.isRead && !readNotifications.has(n.id)).length;
  }, [notifications, readNotifications]);
  
  // Calculate total unread chat messages
  const totalUnreadChats = useMemo(() => {
    return chatsToShow.reduce((total, chat) => total + (chat.unread || 0), 0);
  }, [chatsToShow]);

  // Notify parent component of unread count changes
  useEffect(() => {
    if (onUnreadCountsChange) {
      onUnreadCountsChange(totalUnreadChats, unreadNotificationsCount);
    }
  }, [totalUnreadChats, unreadNotificationsCount, onUnreadCountsChange]);

  // If a chat is selected, show the appropriate chat component
  if (selectedChatId) {
    const selectedChat = chatsToShow.find(chat => chat.id === selectedChatId);
    
    if (selectedChat && selectedChat.isGameChat) {
      // Game chat - use ChatRoom component
      return (
        <div className="chat-screen">
          <ChatRoom gameId={selectedChatId} onClose={handleCloseChat} />
        </div>
      );
    } else {
      // Direct message chat - use DirectMessageChat component
    return (
      <div className="chat-screen">
          <DirectMessageChat 
            chat={selectedChat} 
            onClose={handleCloseChat}
            onSendMessage={sendMessage}
            onDeleteChat={handleDeleteChat}
            onShowNotification={setNotification}
          />
      </div>
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
              className={`notification-card-modern fade-in-${(index % 4) + 1} ${!notification.isRead && !readNotifications.has(notification.id) ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <div className="notification-icon-wrapper">
                <svg className="notification-icon-modern" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {!notification.isRead && !readNotifications.has(notification.id) && <div className="notification-unread-dot"></div>}
              </div>
              <div className="notification-content-modern">
                {notification.message}
              </div>
              <time className="notification-time-modern">{notification.timestamp}</time>
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
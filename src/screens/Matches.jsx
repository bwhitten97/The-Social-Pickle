import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { listenToMatches, listenToMatchesSimple, getUserMatches } from '../services/matchService';
import { sendMessageBetweenUsers, messageService } from '../services/messageService';
import Notification from '../components/Notification';
import './Matches.css';

const Matches = memo(() => {
  const { user } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [notification, setNotification] = useState(null);
  const [realMatches, setRealMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [matchConversations, setMatchConversations] = useState({});
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState({});
  const [messageText, setMessageText] = useState('');

  // Fetch conversation data for a match
  const fetchMatchConversationData = async (matchId, otherUserId) => {
    try {
      // Get conversation between current user and the matched user
      const result = await messageService.getConversation(user.id, otherUserId);
      
      if (result.success && result.messages.length > 0) {
        // Get the last message and calculate unread count
        const lastMessage = result.messages[result.messages.length - 1];
        const unreadCount = result.messages.filter(msg => 
          !msg.read && msg.fromUserId !== user.id
        ).length;
        
        return {
          lastMessage: {
            content: lastMessage.message,
            timestamp: lastMessage.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          },
          unreadCount: unreadCount
        };
      }
      
      return {
        lastMessage: null,
        unreadCount: 0
      };
    } catch (error) {
      console.error('Error fetching conversation data for match:', matchId, error);
      return {
        lastMessage: null,
        unreadCount: 0
      };
    }
  };

  // Fetch match details with user info
  const fetchMatchWithUserInfo = async (match) => {
    try {
      const otherUserId = match.users.find(id => id !== user.id);
      console.log('Fetching user info for otherUserId:', otherUserId, 'from match:', match.id);
      
      const userRef = doc(db, 'users', otherUserId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log('Found user data:', userData.name, 'for userId:', otherUserId);
        
        return {
          // Use a unique identifier that combines match info
          id: `match_${match.id}_${otherUserId}`, // Unique ID for React key
          matchId: match.id, // Firebase match document ID
          otherUserId: otherUserId, // The other user's ID
          users: match.users, // Preserve original match users array
          name: userData.name || 'Unknown User',
          age: userData.age || 25,
          skillLevel: userData.skillLevel || 'intermediate',
          duprRating: userData.duprRating || 'unrated',
          availability: userData.availability?.[0] || 'Flexible',
          bio: userData.bio || 'New to The Social Pickle!',
          image: userData.profilePicture || null,
          matchedAt: match.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }
      console.error('User document not found for userId:', otherUserId);
      return null;
    } catch (error) {
      console.error('Error fetching user info for match:', match.id, error);
      return null;
    }
  };

  // Set up real-time listener for matches with fallback
  useEffect(() => {
    console.log('🚨 MATCHES_COMPONENT_DEBUG: Setting up listener with fallback');
    
    if (!user?.id) {
      console.log('🚨 MATCHES_COMPONENT_DEBUG: No user ID, stopping');
      setIsLoadingMatches(false); 
      return;
    }

    console.log('🚨 MATCHES_COMPONENT_DEBUG: User object:', user);
    console.log('🚨 MATCHES_COMPONENT_DEBUG: User ID found:', user.id);
    console.log('🚨 MATCHES_COMPONENT_DEBUG: User ID type:', typeof user.id);
    setIsLoadingMatches(true);
    
    // Fallback function to load matches directly
    const loadMatchesFallback = async () => {
      console.log('🚨 MATCHES: Using fallback approach to load matches');
      try {
        const matches = await getUserMatches(user.id);
        console.log('🚨 MATCHES: Fallback loaded', matches.length, 'matches');
        
        if (matches.length === 0) {
          setRealMatches([]);
          setIsLoadingMatches(false);
          return;
        }
        
        // Process matches same as real-time listener
        const matchesWithUserInfo = await Promise.all(
          matches.map(async (match) => {
            const userInfo = await fetchMatchWithUserInfo(match);
            return userInfo;
          })
        );
        
        const validMatches = matchesWithUserInfo.filter(match => match !== null);
        console.log('🚨 MATCHES: Fallback valid matches:', validMatches);
        
        // Fetch conversation data
        const conversationData = {};
        const unreadCounts = {};
        
        await Promise.all(
          validMatches.map(async (match) => {
            console.log('Fetching conversation for match:', match.matchId, 'with user:', match.otherUserId);
            const conversationInfo = await fetchMatchConversationData(match.matchId, match.otherUserId);
            conversationData[match.matchId] = conversationInfo.lastMessage;
            unreadCounts[match.matchId] = conversationInfo.unreadCount;
          })
        );
        
        setMatchConversations(conversationData);
        setConversationUnreadCounts(unreadCounts);
        setRealMatches(validMatches);
        setIsLoadingMatches(false);
      } catch (error) {
        console.error('🚨 MATCHES: Fallback error:', error);
        setRealMatches([]);
        setIsLoadingMatches(false);
      }
    };
    
    // Try fallback immediately and set up listener
    console.log('🚨 MATCHES_COMPONENT_DEBUG: Trying fallback approach immediately');
    loadMatchesFallback();
    
    // Also set a timeout to use fallback if real-time listener fails
    const timeoutId = setTimeout(() => {
      console.log('🚨 MATCHES_COMPONENT_DEBUG: Real-time listener timeout, using fallback again');
      loadMatchesFallback();
    }, 3000);
    
    try {
      const unsubscribe = listenToMatchesSimple(user.id, async (matches) => {
        clearTimeout(timeoutId); // Clear timeout since real-time worked
        console.log('🚨 MATCHES: Real-time listener received:', matches.length, 'matches');
        
        if (matches.length === 0) {
          setRealMatches([]);
          setIsLoadingMatches(false);
          return;
        }
        
        // Process matches same as fallback
        const matchesWithUserInfo = await Promise.all(
          matches.map(async (match) => {
            const userInfo = await fetchMatchWithUserInfo(match);
            return userInfo;
          })
        );
        
        const validMatches = matchesWithUserInfo.filter(match => match !== null);
        console.log('🚨 MATCHES: Real-time valid matches:', validMatches);
        
        // Fetch conversation data
        const conversationData = {};
        const unreadCounts = {};
        
        await Promise.all(
          validMatches.map(async (match) => {
            console.log('Fetching conversation for match:', match.matchId, 'with user:', match.otherUserId);
            const conversationInfo = await fetchMatchConversationData(match.matchId, match.otherUserId);
            conversationData[match.matchId] = conversationInfo.lastMessage;
            unreadCounts[match.matchId] = conversationInfo.unreadCount;
          })
        );
        
        setMatchConversations(conversationData);
        setConversationUnreadCounts(unreadCounts);
        setRealMatches(validMatches);
        setIsLoadingMatches(false);
      });

      return () => {
        clearTimeout(timeoutId);
        unsubscribe?.();
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('🚨 MATCHES: Real-time listener setup error:', error);
      // Use fallback immediately if setup fails
      loadMatchesFallback();
    }
  }, [user?.id]);

  // Use only real matches from Firebase - no context dependency
  const matches = useMemo(() => {
    // Only show real matches from Firebase
    return realMatches;
  }, [realMatches]);

  const getSkillLevelColor = useCallback((skill) => {
    // All skill levels now use the same green color scheme
    return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
  }, []);

  const getAvailabilityColor = useCallback((availability) => {
    switch (availability?.toLowerCase()) {
      case 'evenings':
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
      case 'weekends':
        return { backgroundColor: 'rgba(38,132,255,0.1)', color: '#2684FF' };
      case 'afternoons':
        return { backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' };
      case 'mornings':
        return { backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' };
      default:
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
    }
  }, []);

  const formatMatchDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Connected today';
    } else if (diffDays <= 7) {
      return `Connected ${diffDays} days ago`;
    } else {
      return `Connected on ${date.toLocaleDateString()}`;
    }
  }, []);

  const handleViewProfile = useCallback((match) => {
    setSelectedProfile(match);
  }, []);

  const handleMessage = useCallback((match) => {
    setSelectedMatch(match);
    setShowMessageModal(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setSelectedProfile(null);
  }, []);

  const closeMessageModal = useCallback(() => {
    setShowMessageModal(false);
    setSelectedMatch(null);
    setMessageText('');
  }, []);

  const sendMessage = useCallback(async (message) => {
    if (!selectedMatch || !user) return;
    
    try {
      const result = await sendMessageBetweenUsers(
        user.id,
        user.name || 'You',
        selectedMatch.otherUserId,
        selectedMatch.name,
        message
      );
      
      if (result.success) {
        setNotification({
          message: "Message sent to",
          name: selectedMatch.name,
          emoji: "💬"
        });
        closeMessageModal();
      } else {
        setNotification({
          message: "Failed to send message to",
          name: selectedMatch.name,
          emoji: "❌"
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNotification({
        message: "Failed to send message to",
        name: selectedMatch.name,
        emoji: "❌"
      });
    }
  }, [selectedMatch, user, closeMessageModal]);

  return (
    <div className="matches-container">
      <main className="matches-main">
        <div className="matches-content">
          {/* Page Title */}
          <section className="matches-title-section">
            <div className="matches-title-header">
              <h1 className="matches-title">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="matches-title-icon" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Your Matches
              </h1>
              <span className="matches-connections-count">{matches.length} connections</span>
            </div>
          </section>

          {/* Match Cards */}
          <section className="matches-cards-section">
            {isLoadingMatches ? (
              <div className="matches-loading">
                <div className="loading-spinner"></div>
                <p>Loading your matches...</p>
              </div>
            ) : matches.length > 0 ? (
              matches.map((match, index) => (
                <article key={match.id} className={`matches-card matches-fade-in-${index + 1}`}>
                  <div className="matches-card-content">
                    <div className="matches-avatar-container">
                      <div className="matches-avatar">
                        {match.image ? (
                          <img 
                            src={match.image} 
                            alt={`${match.name} profile`}
                            className="matches-avatar-image"
                          />
                        ) : (
                          <span className="matches-avatar-initials">
                            {match.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        )}
                      </div>
                      <h2 className="matches-name">
                        {match.name}{match.age && `, ${match.age}`}
                      </h2>
                    </div>
                    
                    <div className="matches-info">
                      <div className="matches-badges">
                        <span 
                          className="matches-badge"
                          style={getSkillLevelColor(match.skillLevel)}
                        >
                          {match.skillLevel || 'Intermediate'}
                        </span>
                        {match.duprRating && 
                         match.duprRating !== 'unrated' && 
                         match.duprRating !== '' && 
                         match.duprRating !== '2.0' && 
                         match.duprRating !== '3.0' && 
                         match.duprRating !== '4.5' && (
                          <span 
                            className="matches-badge"
                            style={getSkillLevelColor(match.skillLevel)}
                          >
                            DUPR {match.duprRating}
                          </span>
                        )}
                        <span 
                          className="matches-badge"
                          style={getAvailabilityColor(match.availability)}
                        >
                          {match.availability || 'Evenings'}
                        </span>
                      </div>

                      <div className="matches-details">
                        {match.matchedAt && (
                          <div className="matches-detail">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="matches-detail-icon" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {formatMatchDate(match.matchedAt)}
                          </div>
                        )}
                      </div>

                      {match.bio && (
                        <p className="matches-bio">"{match.bio}"</p>
                      )}

                      {/* Conversation Preview */}
                      {matchConversations[match.matchId] && (
                        <div className="matches-conversation-preview">
                          <div className="matches-conversation-header">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="matches-conversation-icon" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor" 
                              strokeWidth="2"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="matches-conversation-label">Recent message:</span>
                            {conversationUnreadCounts[match.matchId] > 0 && (
                              <span className="matches-unread-badge">
                                {conversationUnreadCounts[match.matchId] > 9 ? '9+' : conversationUnreadCounts[match.matchId]}
                              </span>
                            )}
                          </div>
                          <p className="matches-conversation-text">
                            "{matchConversations[match.matchId].content}"
                          </p>
                          <span className="matches-conversation-time">
                            {new Date(matchConversations[match.matchId].timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="matches-actions">
                        <button 
                          className="matches-btn matches-btn-primary"
                          onClick={() => handleViewProfile(match)}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="matches-btn-icon" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View Profile
                        </button>
                        <button 
                          className="matches-btn matches-btn-secondary"
                          onClick={() => handleMessage(match)}
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="matches-btn-icon" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor" 
                            strokeWidth="2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          Message
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="matches-no-matches">
                <div className="matches-no-matches-icon">🤝</div>
                <h3>No Matches Yet</h3>
                <p>Start connecting with players in the Discover section to see your matches here!</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Profile Modal */}
      {selectedProfile && (
        <div className="matches-modal-overlay" onClick={closeProfileModal}>
          <div className="matches-modal" onClick={(e) => e.stopPropagation()}>
            <div className="matches-modal-header">
              <h2>Player Profile</h2>
              <button className="matches-modal-close" onClick={closeProfileModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="matches-modal-content">
              <div className="matches-modal-avatar">
                {selectedProfile.image ? (
                  <img 
                    src={selectedProfile.image} 
                    alt={`${selectedProfile.name} profile`}
                    className="matches-modal-avatar-image"
                  />
                ) : (
                  <span className="matches-modal-avatar-initials">
                    {selectedProfile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>
              <h3>{selectedProfile.name}</h3>
              <div className="matches-modal-details">
                <p><strong>Age:</strong> {selectedProfile.age || 'Not specified'}</p>
                <p><strong>Skill Level:</strong> {selectedProfile.skillLevel || 'Intermediate'}</p>
                {selectedProfile.duprRating && 
                 selectedProfile.duprRating !== 'unrated' && 
                 selectedProfile.duprRating !== '' && 
                 selectedProfile.duprRating !== '2.0' && 
                 selectedProfile.duprRating !== '3.0' && 
                 selectedProfile.duprRating !== '4.5' && (
                  <p><strong>DUPR Rating:</strong> {selectedProfile.duprRating}</p>
                )}
                <p><strong>Availability:</strong> {selectedProfile.availability || 'Evenings'}</p>
                {selectedProfile.bio && <p><strong>Bio:</strong> "{selectedProfile.bio}"</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedMatch && (
        <div className="matches-modal-overlay" onClick={closeMessageModal}>
          <div className="matches-modal" onClick={(e) => e.stopPropagation()}>
            <div className="matches-modal-header">
              <h2>Send Message to {selectedMatch.name}</h2>
              <button className="matches-modal-close" onClick={closeMessageModal}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="matches-modal-content">
              <div className="matches-message-form">
                <textarea 
                  placeholder="Type your message here..."
                  rows="4"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <div className="matches-message-actions">
                  <button 
                    className="matches-btn matches-btn-secondary"
                    onClick={closeMessageModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="matches-btn matches-btn-primary"
                    onClick={() => {
                      if (messageText.trim()) {
                        sendMessage(messageText);
                      }
                    }}
                  >
                    Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
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

Matches.displayName = 'Matches';

export default Matches; 
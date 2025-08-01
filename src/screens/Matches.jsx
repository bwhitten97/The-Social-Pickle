import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { useGameContext } from '../context/GameContext';
import { listenToMatches } from '../services/matchService';
import Notification from '../components/Notification';
import './Matches.css';

const Matches = memo(() => {
  const { user } = useAuth();
  const { matchedPlayers, sendMessage: sendMessageToContext } = useGameContext();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [notification, setNotification] = useState(null);
  const [realMatches, setRealMatches] = useState([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);

  // Fetch match details with user info
  const fetchMatchWithUserInfo = async (match) => {
    try {
      const otherUserId = match.users.find(id => id !== user.id);
      const userRef = doc(db, 'users', otherUserId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        return {
          id: otherUserId,
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
      return null;
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  };

  // Set up real-time listener for matches
  useEffect(() => {
    if (!user?.id) {
      setIsLoadingMatches(false);
      return;
    }

    setIsLoadingMatches(true);
    
    // Set a timeout to stop loading if no response after 5 seconds
    const timeoutId = setTimeout(() => {
      console.log('Matches loading timeout - no matches found');
      setRealMatches([]);
      setIsLoadingMatches(false);
    }, 5000);
    
    try {
      const unsubscribe = listenToMatches(user.id, async (matches) => {
        clearTimeout(timeoutId); // Clear timeout since we got data
        console.log('Matches received:', matches);
        
        if (matches.length === 0) {
          setRealMatches([]);
          setIsLoadingMatches(false);
          return;
        }
        
        // Fetch user info for each match
        const matchesWithUserInfo = await Promise.all(
          matches.map(async (match) => {
            const userInfo = await fetchMatchWithUserInfo(match);
            return userInfo;
          })
        );
        
        // Filter out null results
        const validMatches = matchesWithUserInfo.filter(match => match !== null);
        console.log('Valid matches:', validMatches);
        setRealMatches(validMatches);
        setIsLoadingMatches(false);
      });

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error setting up matches listener:', error);
      setRealMatches([]);
      setIsLoadingMatches(false);
    }
  }, [user?.id]);

  // Combine real matches, context matches, and mock data
  const matches = useMemo(() => {
    const allMatches = [...realMatches, ...matchedPlayers];
    
    // Remove duplicates based on name
    const uniqueMatches = allMatches.filter((match, index, self) => 
      index === self.findIndex(m => m.name === match.name)
    );
    
    // No fallback to mock data - show real matches only
    return uniqueMatches;
  }, [realMatches, matchedPlayers]);

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
  }, []);

  const sendMessage = useCallback((message) => {
    const result = sendMessageToContext(selectedMatch.name, message);
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
  }, [selectedMatch, sendMessageToContext, closeMessageModal]);

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
                  id="messageText"
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
                      const messageText = document.getElementById('messageText').value;
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
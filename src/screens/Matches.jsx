import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import Notification from '../components/Notification';
import './Matches.css';

const Matches = () => {
  const { matchedPlayers, sendMessage: sendMessageToContext } = useGameContext();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [notification, setNotification] = useState(null);

  // Mock data for demonstration when no real matches exist
  const mockMatches = [
    {
      id: 1,
      name: "Jessica Martinez",
      age: 29,
      skillLevel: "Intermediate",
      availability: "Evenings",
      bio: "Pickleball enthusiast who loves the social aspect of the game. Always down for post-game coffee!",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b776?w=800&q=80&fit=crop&crop=face",
      matchedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Priya Patel",
      age: 32,
      skillLevel: "Advanced",
      duprRating: "4.2",
      availability: "Weekends",
      bio: "Competitive spirit with a calm mindset—from yoga mat to pickleball court!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80&fit=crop&crop=face",
      matchedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Maria Gonzalez",
      age: 36,
      skillLevel: "Intermediate",
      availability: "Afternoons",
      bio: "Love the strategy of pickleball! Always working on my third-shot drop and looking for doubles partners.",
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fit=crop&crop=face",
      matchedAt: new Date().toISOString()
    }
  ];

  // Use real matched players if available, otherwise use mock data for demonstration
  const matches = matchedPlayers.length > 0 ? matchedPlayers : mockMatches;

  const getSkillLevelColor = (skill) => {
    // All skill levels now use the same green color scheme
    return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
  };

  const getAvailabilityColor = (availability) => {
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
  };

  const formatMatchDate = (dateString) => {
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
  };

  const handleViewProfile = (match) => {
    setSelectedProfile(match);
    console.log('Viewing profile for:', match.name);
  };

  const handleMessage = (match) => {
    setSelectedMatch(match);
    setShowMessageModal(true);
    console.log('Starting conversation with:', match.name);
  };

  const closeProfileModal = () => {
    setSelectedProfile(null);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedMatch(null);
  };

  const sendMessage = (message) => {
    console.log(`Sending message to ${selectedMatch.name}: ${message}`);
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
  };

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
            {matches.length > 0 ? (
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
};

export default Matches; 
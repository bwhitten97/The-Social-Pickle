import React from 'react';
import { useGameContext } from '../context/GameContext';
import './Matches.css';

const Matches = () => {
  const { matchedPlayers } = useGameContext();

  // Mock data for now - we'll replace with real data later
  const mockMatches = [
    {
      id: 1,
      name: "Jessica Martinez",
      age: 29,
      skillLevel: "Intermediate",
      availability: "Evenings",
      distance: "1.2 miles away",
      experience: "2.5 years experience",
      bio: "Pickleball enthusiast who loves the social aspect of the game. Always down for post-game coffee!",
      avatar: "🎓",
      matchedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: "Priya Patel",
      age: 32,
      skillLevel: "Advanced",
      availability: "Weekends",
      distance: "0.8 miles away",
      experience: "5 years experience",
      bio: "Competitive spirit with a calm mindset—from yoga mat to pickleball court!",
      avatar: "🧘‍♀️",
      matchedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: "Maria Gonzalez",
      age: 36,
      skillLevel: "Intermediate",
      availability: "Afternoons",
      distance: "2.3 miles away",
      experience: "3 years experience",
      bio: "Love the strategy of pickleball! Always working on my third-shot drop and looking for doubles partners.",
      avatar: "🧑‍🔬",
      matchedAt: new Date().toISOString()
    }
  ];

  const matches = matchedPlayers.length > 0 ? matchedPlayers : mockMatches;

  const getSkillLevelColor = (skill) => {
    switch (skill.toLowerCase()) {
      case 'beginner':
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
      case 'intermediate':
        return { backgroundColor: 'rgba(242,92,92,0.1)', color: '#F25C5C' };
      case 'advanced':
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
      default:
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability.toLowerCase()) {
      case 'evenings':
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
      case 'weekends':
        return { backgroundColor: 'rgba(38,132,255,0.1)', color: '#2684FF' };
      case 'afternoons':
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
      default:
        return { backgroundColor: 'rgba(62,93,69,0.1)', color: '#3E5D45' };
    }
  };

  const handleViewProfile = (match) => {
    console.log('View profile for:', match.name);
    // TODO: Implement profile viewing functionality
  };

  const handleMessage = (match) => {
    console.log('Message:', match.name);
    // TODO: Implement messaging functionality
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
            {matches.map((match, index) => (
              <article key={match.id} className={`matches-card matches-fade-in-${index + 1}`}>
                <div className="matches-card-content">
                  <div className="matches-avatar-container">
                    <div className="matches-avatar">
                      {match.avatar || match.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  
                  <div className="matches-info">
                    <div className="matches-header">
                      <h2 className="matches-name">{match.name}, {match.age}</h2>
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
                            strokeWidth="2.2"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          Message
                        </button>
                      </div>
                    </div>

                    <div className="matches-badges">
                      <span 
                        className="matches-badge"
                        style={getSkillLevelColor(match.skillLevel)}
                      >
                        {match.skillLevel}
                      </span>
                      <span 
                        className="matches-badge"
                        style={getAvailabilityColor(match.availability)}
                      >
                        {match.availability}
                      </span>
                    </div>

                    <div className="matches-details">
                      <span className="matches-detail">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="matches-detail-icon" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {match.distance}
                      </span>
                      <span className="matches-detail-separator">·</span>
                      <span className="matches-detail">
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="matches-detail-icon" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12,6 12,12 16,14" />
                        </svg>
                        {match.experience}
                      </span>
                    </div>

                    <p className="matches-bio">"{match.bio}"</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Matches; 
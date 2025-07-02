import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import './MyApplications.css';

const MyApplications = () => {
  const { getUserApplications, withdrawApplication, games } = useGameContext();
  const [filter, setFilter] = useState('all');
  
  const userApplications = getUserApplications();
  
  // Enrich applications with game data
  const enrichedApplications = userApplications.map(app => {
    const game = games.find(g => g.id === app.gameId);
    return {
      ...app,
      gameLocation: game?.location || 'Unknown Location',
      gameDate: game?.date || '',
      gameTime: game?.time || '',
      hostName: game?.createdBy || 'Unknown Host',
      skillLevel: game?.skillLevel || 'unknown'
    };
  });

  const filteredApplications = enrichedApplications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const handleWithdrawApplication = (applicationId) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      withdrawApplication(applicationId);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hours), parseInt(minutes));
    return time.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#f59e0b';
      case 'accepted':
        return '#10b981';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      case 'mixed':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'accepted':
        return '✅';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="my-applications-screen">
      <div className="screen-header">
        <h1>My Applications</h1>
        <p>Track your game join requests and their status</p>
      </div>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Applications
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'accepted' ? 'active' : ''}`}
          onClick={() => setFilter('accepted')}
        >
          Accepted
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      <div className="applications-list">
        {filteredApplications.map(application => (
          <div key={application.id} className="application-card">
            <div className="application-header">
              <div className="game-info">
                <h3 className="game-location">{application.gameLocation}</h3>
                <div className="game-details">
                  <span className="game-datetime">
                    📅 {formatDate(application.gameDate)} at {formatTime(application.gameTime)}
                  </span>
                  <span className="game-host">
                    👤 Hosted by {application.hostName}
                  </span>
                </div>
              </div>
              <div className="status-info">
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(application.status) }}
                >
                  {getStatusIcon(application.status)} {application.status}
                </span>
                <span 
                  className="skill-badge"
                  style={{ backgroundColor: getSkillColor(application.skillLevel) }}
                >
                  {application.skillLevel}
                </span>
              </div>
            </div>

            <div className="application-content">
              {application.message && (
                <div className="my-message">
                  <h4>Your Message:</h4>
                  <p>"{application.message}"</p>
                </div>
              )}

              <div className="application-meta">
                <span>Applied on {new Date(application.applicationDate).toLocaleDateString()}</span>
                {application.status === 'accepted' && (
                  <span className="success-note">🎉 You're in! Contact the host for details.</span>
                )}
                {application.status === 'rejected' && (
                  <span className="rejection-note">Better luck next time! Keep looking for other games.</span>
                )}
              </div>
            </div>

            {application.status === 'pending' && (
              <div className="application-actions">
                <button 
                  className="withdraw-btn"
                  onClick={() => handleWithdrawApplication(application.id)}
                >
                  Withdraw Application
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="no-applications">
          <div className="no-applications-icon">📝</div>
          <h3>No applications found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't applied to any games yet. Browse available games to get started!"
              : `No ${filter} applications at the moment.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default MyApplications;
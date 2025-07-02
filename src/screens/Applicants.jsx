import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import './Applicants.css';

const Applicants = () => {
  const { getGameApplications, updateApplicationStatus, games } = useGameContext();
  const [filter, setFilter] = useState('all');
  
  const gameApplications = getGameApplications();
  
  // Enrich applications with game data
  const enrichedApplications = gameApplications.map(app => {
    const game = games.find(g => g.id === app.gameId);
    return {
      ...app,
      gameLocation: game?.location || 'Unknown Location',
      gameDate: game?.date || '',
      gameTime: game?.time || '',
      applicantName: app.playerName,
      applicantSkill: app.playerSkill
    };
  });

  const filteredApplications = enrichedApplications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  const handleStatusChange = (applicationId, newStatus) => {
    updateApplicationStatus(applicationId, newStatus);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
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
    switch (skill.toLowerCase()) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="applicants-screen">
      <div className="screen-header">
        <h1>Game Applicants</h1>
        <p>Review and manage join requests for your games</p>
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
                <h3 className="game-title">{application.gameLocation}</h3>
                <div className="game-datetime">
                  {formatDate(application.gameDate)} at {formatTime(application.gameTime)}
                </div>
              </div>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(application.status) }}
              >
                {application.status}
              </span>
            </div>

            <div className="applicant-info">
              <div className="applicant-header">
                <div className="applicant-avatar">
                  {application.applicantName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="applicant-details">
                  <h4 className="applicant-name">{application.applicantName}</h4>
                  <span 
                    className="skill-badge"
                    style={{ backgroundColor: getSkillColor(application.applicantSkill) }}
                  >
                    {application.applicantSkill}
                  </span>
                </div>
              </div>

              {application.message && (
                <div className="application-message">
                  <p>"{application.message}"</p>
                </div>
              )}

              <div className="application-meta">
                Applied {new Date(application.applicationDate).toLocaleDateString()}
              </div>
            </div>

            {application.status === 'pending' && (
              <div className="application-actions">
                <button 
                  className="action-btn reject-btn"
                  onClick={() => handleStatusChange(application.id, 'rejected')}
                >
                  Reject
                </button>
                <button 
                  className="action-btn accept-btn"
                  onClick={() => handleStatusChange(application.id, 'accepted')}
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredApplications.length === 0 && (
        <div className="no-applications">
          <div className="no-applications-icon">📋</div>
          <h3>No applications found</h3>
          <p>
            {filter === 'all' 
              ? "You don't have any game applications yet."
              : `No ${filter} applications at the moment.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default Applicants;
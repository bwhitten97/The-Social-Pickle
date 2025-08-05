import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Welcome.css';

const Welcome = () => {
  const navigate = useNavigate();
  const { updateWelcomeStatus, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSelection = async (selection) => {
    setIsLoading(true);
    
    try {
      // Mark that user has seen the welcome page and wait for it to complete
      const result = await updateWelcomeStatus();
      
      // Only navigate after the update is complete
      if (result && result.success) {
        // Add delay to ensure state has fully propagated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navigate to appropriate page based on selection with replace to prevent back navigation
        switch (selection) {
          case 'discover':
            navigate('/discover', { replace: true });
            break;
          case 'games':
            navigate('/games', { replace: true });
            break;
          case 'look-around':
            navigate('/discover', { replace: true });
            break;
          default:
            navigate('/discover', { replace: true });
        }
      } else {
        // If update failed, still navigate but log the issue
        console.error('Welcome status update failed, navigating anyway');
        navigate('/discover', { replace: true });
      }
    } catch (error) {
      console.error('Error updating welcome status:', error);
      // Navigate anyway if there's an error
      navigate('/discover', { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1>Let us show you around</h1>
          <p className="welcome-subtitle">Do you want to?</p>
        </div>

        <div className="welcome-options">
          <button 
            className="welcome-option"
            onClick={() => handleSelection('discover')}
            disabled={isLoading}
          >
            <div className="option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"/>
              </svg>
            </div>
            <div className="option-content">
              <h3>Discover and match with other pickleball players</h3>
              <p>Find players at your skill level and connect with your local community</p>
            </div>
          </button>

          <button 
            className="welcome-option"
            onClick={() => handleSelection('games')}
            disabled={isLoading}
          >
            <div className="option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="option-content">
              <h3>Join or host a game</h3>
              <p>Browse upcoming games in your area or create your own</p>
            </div>
          </button>

          <button 
            className="welcome-option"
            onClick={() => handleSelection('look-around')}
            disabled={isLoading}
          >
            <div className="option-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <div className="option-content">
              <h3>Just look around</h3>
              <p>Explore the app and get familiar with all the features</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
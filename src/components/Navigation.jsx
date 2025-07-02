import { NavLink } from 'react-router-dom';
import './Navigation.css';

const Navigation = ({ unreadNotificationCount = 0, unreadChatCount = 0 }) => {
  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h2>🥒 The Social Pickle</h2>
      </div>
      
      <div className="nav-links">
        <NavLink 
          to="/matches" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">👥</span>
          Discover
        </NavLink>
        
        <NavLink 
          to="/matched-players" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">🤝</span>
          Matches
        </NavLink>
        
        <NavLink 
          to="/games" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">🏓</span>
          Games
        </NavLink>
        
        <NavLink 
          to="/post-game" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">➕</span>
          Post Game
        </NavLink>
        
        <NavLink 
          to="/applicants" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">📋</span>
          Applicants
        </NavLink>
        
        <NavLink 
          to="/my-applications" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">📝</span>
          My Apps
        </NavLink>
        
        <NavLink 
          to="/chat" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon" style={{ position: 'relative' }}>
            💬
            {unreadChatCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                border: '2px solid white'
              }}>
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </span>
          Chat
        </NavLink>
        
        <NavLink 
          to="/notifications" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon" style={{ position: 'relative' }}>
            🔔
            {unreadNotificationCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                border: '2px solid white'
              }}>
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </span>
          Notifications
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">👤</span>
          Profile
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
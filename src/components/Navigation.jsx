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
          to="/players" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">👥</span>
          Players
        </NavLink>
        
        <NavLink 
          to="/games" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon">🏓</span>
          Games
        </NavLink>
        
        <NavLink 
          to="/messages" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <span className="nav-icon" style={{ position: 'relative' }}>
            💬
            {(unreadChatCount + unreadNotificationCount) > 0 && (
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
                {(unreadChatCount + unreadNotificationCount) > 9 ? '9+' : (unreadChatCount + unreadNotificationCount)}
              </span>
            )}
          </span>
          Messages
        </NavLink>
      </div>
    </nav>
  );
};

export default Navigation;
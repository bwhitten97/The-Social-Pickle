import { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, name, emoji = "💬", onClose, duration = 2000 }) => {
  useEffect(() => {
    // Simple auto-dismiss timer
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className="app-notification notification-show">
      <div className="notification-content">
        <span className="notification-emoji">{emoji}</span>
        <span className="notification-text">
          {message} <strong>{name}</strong>
        </span>
        <button 
          className="notification-close-btn"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Notification; 
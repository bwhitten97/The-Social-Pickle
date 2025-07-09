import { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, name, emoji = "💬", onClose, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        if (onClose) onClose();
      }, 300); // Allow time for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`app-notification ${isVisible ? 'notification-show' : 'notification-hide'}`}>
      <div className="notification-content">
        <span className="notification-emoji">{emoji}</span>
        <span className="notification-text">
          {message} <strong>{name}</strong>
        </span>
      </div>
    </div>
  );
};

export default Notification; 
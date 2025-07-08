import { useState, useRef, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import './ChatRoom.css';

const ChatRoom = ({ gameId, onClose }) => {
  const { games, currentUserId, currentUserName } = useGameContext();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const game = games.find(g => g.id === gameId);

  // Dummy messages to simulate a chat thread
  const initializeDummyMessages = () => {
    const dummyMessages = [
      {
        id: 1,
        userId: 'host-user',
        userName: game?.createdBy || 'Host',
        message: `Welcome to the ${game?.location} game chat! Looking forward to playing with everyone.`,
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        isCurrentUser: false
      },
      {
        id: 2,
        userId: currentUserId,
        userName: currentUserName,
        message: 'Thanks for accepting my request! What equipment should I bring?',
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        isCurrentUser: true
      },
      {
        id: 3,
        userId: 'host-user',
        userName: game?.createdBy || 'Host',
        message: 'Just bring your paddle and water! Courts provide the nets and balls.',
        timestamp: new Date(Date.now() - 2700000).toISOString(), // 45 minutes ago
        isCurrentUser: false
      },
      {
        id: 4,
        userId: 'player-2',
        userName: 'Jessica Miller',
        message: 'I\'ll be there a few minutes early to warm up. See you all soon!',
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        isCurrentUser: false
      },
      {
        id: 5,
        userId: currentUserId,
        userName: currentUserName,
        message: 'Perfect! I\'ll arrive around 9:45 AM then.',
        timestamp: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
        isCurrentUser: true
      }
    ];
    setMessages(dummyMessages);
  };

  useEffect(() => {
    initializeDummyMessages();
  }, [gameId]);

  useEffect(() => {
    // Only scroll to bottom when new messages are added (not on initial load)
    if (messages.length > 0) {
      const isInitialLoad = messages.length === 5; // Initial dummy messages count
      if (!isInitialLoad) {
    scrollToBottom();
      }
    }
  }, [messages]);

  const scrollToBottom = () => {
    // Scroll within the messages container, not the entire page
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now(),
      userId: currentUserId,
      userName: currentUserName,
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isCurrentUser: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (!game) {
    return (
      <div className="unified-chat">
        <div className="unified-chat-header">
          <button className="back-btn" onClick={onClose}>
            ←
          </button>
          <div className="chat-details">
        <h3>Game not found</h3>
          </div>
        </div>
        <div className="unified-messages">
          <div className="error-message">
            <p>This game could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="unified-chat">
      {/* Header */}
      <div className="unified-chat-header">
        <button className="back-btn" onClick={onClose}>
          ←
        </button>
        <div className="chat-avatar">
          🏓
        </div>
        <div className="chat-details">
          <h3>{game.location}</h3>
          <span className="status">{formatDate(game.date)} at {game.time}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="unified-messages">
        {messages.map((msg, index) => {
          const prevMessage = messages[index - 1];
          const showDateSeparator = !prevMessage || 
            formatDate(msg.timestamp) !== formatDate(prevMessage.timestamp);

          return (
            <div key={msg.id}>
              {showDateSeparator && (
                <div className="date-separator">
                  {formatDate(msg.timestamp)}
                </div>
              )}
              
              <div className={`unified-message ${msg.isCurrentUser ? 'sent' : 'received'}`}>
                <div className="message-bubble">
                  {!msg.isCurrentUser && <span className="sender-name">{msg.userName}</span>}
                  <p>{msg.message}</p>
                  <span className="message-timestamp">{formatTime(msg.timestamp)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="unified-input">
        <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
            className="input-field"
        />
        <button 
          type="submit" 
            className="send-button"
          disabled={!newMessage.trim()}
        >
            →
        </button>
      </form>
      </div>
    </div>
  );
};

export default ChatRoom;
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
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      <div className="chat-room-error">
        <h3>Game not found</h3>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="chat-info">
          <h3>{game.location}</h3>
          <p>{formatDate(game.date)} at {game.time}</p>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-messages">
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
              
              <div className={`message ${msg.isCurrentUser ? 'message-sent' : 'message-received'}`}>
                {!msg.isCurrentUser && (
                  <div className="message-avatar">
                    {msg.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                
                <div className="message-content">
                  {!msg.isCurrentUser && (
                    <div className="message-sender">{msg.userName}</div>
                  )}
                  <div className="message-text">{msg.message}</div>
                  <div className="message-time">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="message-input"
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatRoom;
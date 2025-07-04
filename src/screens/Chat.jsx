import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import ChatRoom from '../components/ChatRoom';
import './Chat.css';

const Chat = () => {
  const { getUserChatRooms, games } = useGameContext();
  const [selectedGameId, setSelectedGameId] = useState(null);
  
  const userChatRooms = getUserChatRooms();
  
  // Debug: Log the chat rooms
  console.log('User chat rooms:', userChatRooms);
  console.log('User chat rooms length:', userChatRooms.length);
  
  // Dummy chats for demonstration
  const dummyChats = [
    {
      id: 1,
      name: "Jessica Martinez",
      lastMessage: "Looking forward to our game tomorrow! 🏓",
      timestamp: "2 hours ago",
      avatar: "JM",
      unread: 2
    },
    {
      id: 2,
      name: "Priya Patel", 
      lastMessage: "Thanks for the great match today!",
      timestamp: "1 day ago",
      avatar: "PP",
      unread: 0
    },
    {
      id: 3,
      name: "Maria Gonzalez",
      lastMessage: "What time should we meet at the courts?",
      timestamp: "3 days ago", 
      avatar: "MG",
      unread: 1
    }
  ];
  
  // Use real chat rooms if available, otherwise show dummy chats
  const chatsToShow = userChatRooms.length > 0 ? userChatRooms : dummyChats;

  const handleRoomSelect = (gameId) => {
    setSelectedGameId(gameId);
  };

  const handleCloseChat = () => {
    setSelectedGameId(null);
  };

  if (selectedGameId) {
    return (
      <div className="chat-screen">
        <ChatRoom gameId={selectedGameId} onClose={handleCloseChat} />
      </div>
    );
  }

  return (
    <div className="chat-screen">
      <div className="screen-header">
        <h1>Chat</h1>
        <p>Connect with your pickleball partners</p>
      </div>

      <div className="chat-content">
        {chatsToShow.length > 0 ? (
          <div className="chat-rooms-list">
            <h3>Your Messages</h3>
            <div className="rooms-grid">
              {chatsToShow.map(chat => {
                // Check if this is a real chat room (has gameId property) or dummy chat
                if (chat.hasOwnProperty('gameId')) {
                  // Real chat room from GameContext
                  if (chat.gameId === null) {
                    // Direct message chat room
                    return (
                      <div 
                        key={chat.id} 
                        className="room-card chat-card"
                        onClick={() => {/* Handle direct message chat click */}}
                      >
                        <div className="chat-avatar">
                          {chat.gameName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="chat-info">
                          <div className="chat-header">
                            <h4>{chat.gameName}</h4>
                            <span className="chat-timestamp">
                              {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                            </span>
                          </div>
                          <p className="chat-last-message">{chat.lastMessage || 'Start a conversation'}</p>
                          <span className="chat-unread-badge">1</span>
                        </div>
                      </div>
                    );
                  } else {
                    // Game chat room
                    const game = games.find(g => g.id === chat.gameId);
                    return (
                      <div 
                        key={chat.id} 
                        className="room-card"
                        onClick={() => handleRoomSelect(chat.gameId)}
                      >
                        <div className="room-header">
                          <h4>{chat.gameName}</h4>
                          <span className="participants-count">
                            {chat.participants.length} players
                          </span>
                        </div>
                        {game && (
                          <div className="room-details">
                            <p>📅 {new Date(game.date).toLocaleDateString()}</p>
                            <p>🕐 {game.time}</p>
                          </div>
                        )}
                        <div className="room-action">
                          <span>Click to open chat →</span>
                        </div>
                      </div>
                    );
                  }
                } else {
                  // Dummy chat (has name, lastMessage, etc. but no gameId)
                  return (
                    <div 
                      key={chat.id} 
                      className="room-card chat-card"
                      onClick={() => {/* Handle dummy chat click */}}
                    >
                      <div className="chat-avatar">
                        {chat.avatar}
                      </div>
                      <div className="chat-info">
                        <div className="chat-header">
                          <h4>{chat.name}</h4>
                          <span className="chat-timestamp">{chat.timestamp}</span>
                        </div>
                        <p className="chat-last-message">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="chat-unread-badge">{chat.unread}</span>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        ) : (
          <div className="no-chats">
            <div className="no-chats-icon">💬</div>
            <h3>No Active Chats</h3>
            <p>Chat rooms are created when hosts accept your game applications or when you accept players to your games.</p>
            
            <div className="feature-list">
              <div className="feature-item">
                <span className="feature-icon">🗨️</span>
                <span>Coordinate game details</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">👥</span>
                <span>Meet your teammates</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📱</span>
                <span>Stay connected</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Private group conversations</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
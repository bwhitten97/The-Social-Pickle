import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import ChatRoom from '../components/ChatRoom';
import './Chat.css';

const Chat = () => {
  const { getUserChatRooms, games } = useGameContext();
  const [selectedGameId, setSelectedGameId] = useState(null);
  
  const userChatRooms = getUserChatRooms();

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
        {userChatRooms.length > 0 ? (
          <div className="chat-rooms-list">
            <h3>Your Game Chats</h3>
            <div className="rooms-grid">
              {userChatRooms.map(room => {
                const game = games.find(g => g.id === room.gameId);
                return (
                  <div 
                    key={room.id} 
                    className="room-card"
                    onClick={() => handleRoomSelect(room.gameId)}
                  >
                    <div className="room-header">
                      <h4>{room.gameName}</h4>
                      <span className="participants-count">
                        {room.participants.length} players
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
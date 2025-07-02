import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navigation from './components/Navigation';
import './App.css';

const mockPlayers = [
  { id: 1, name: "Alex Johnson", skill: "Intermediate", availability: "Evenings", gender: "Male" },
  { id: 2, name: "Sarah Chen", skill: "Advanced", availability: "Mornings", gender: "Female" },
  { id: 3, name: "Mike Rodriguez", skill: "Beginner", availability: "Weekends", gender: "Male" },
  { id: 4, name: "Emma Wilson", skill: "Intermediate", availability: "Afternoons", gender: "Female" },
  { id: 5, name: "David Kim", skill: "Advanced", availability: "Mornings", gender: "Male" }
];

function App() {
  const [players, setPlayers] = useState(mockPlayers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [connections, setConnections] = useState([]);
  const [showMessage, setShowMessage] = useState('');

  const filteredPlayers = players.filter(player => 
    filter === 'All' || player.skill === filter
  );

  const currentPlayer = filteredPlayers[currentIndex];

  const handlePass = () => {
    setShowMessage(`Passed on ${currentPlayer.name}`);
    nextPlayer();
  };

  const handleConnect = () => {
    setConnections(prev => [...prev, currentPlayer]);
    setShowMessage(`🎉 Connected with ${currentPlayer.name}!`);
    nextPlayer();
  };

  const nextPlayer = () => {
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % filteredPlayers.length);
      setShowMessage('');
    }, 1000);
  };

  const resetFeed = () => {
    setCurrentIndex(0);
    setPlayers(mockPlayers);
    setConnections([]);
    setShowMessage('Feed reset! 🔄');
    setTimeout(() => setShowMessage(''), 2000);
  };

  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/matches" replace />} />
            <Route path="/matches" element={
              <div style={{ padding: '20px' }}>
                <header style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <h1>🏓 Find Your Pickleball Match!</h1>
                  <p>Connect with pickleball players in your area</p>
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ backgroundColor: '#10b981', color: 'white', padding: '5px 15px', borderRadius: '20px', marginRight: '10px' }}>
                      💚 {connections.length} connections
                    </span>
                    <button onClick={resetFeed} style={{ padding: '5px 15px', borderRadius: '20px', border: '1px solid #ccc', backgroundColor: '#f3f4f6' }}>
                      🔄 Reset Feed
                    </button>
                  </div>
                </header>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
                  {['All', 'Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <button 
                      key={level}
                      onClick={() => { setFilter(level); setCurrentIndex(0); }}
                      style={{ 
                        padding: '10px 20px', 
                        borderRadius: '20px', 
                        border: '1px solid #ccc', 
                        backgroundColor: filter === level ? '#6366f1' : 'white',
                        color: filter === level ? 'white' : 'black',
                        cursor: 'pointer'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                {showMessage && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '15px', 
                    backgroundColor: '#dcfce7', 
                    border: '1px solid #16a34a', 
                    borderRadius: '10px', 
                    marginBottom: '20px',
                    maxWidth: '400px',
                    margin: '0 auto 20px auto'
                  }}>
                    {showMessage}
                  </div>
                )}

                <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                  {currentPlayer ? (
                    <div style={{ 
                      border: '2px solid #e5e7eb', 
                      borderRadius: '15px', 
                      padding: '30px', 
                      backgroundColor: 'white',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}>
                      <h3>🏓 {currentPlayer.name}</h3>
                      <p><strong>Skill:</strong> {currentPlayer.skill}</p>
                      <p><strong>Available:</strong> {currentPlayer.availability}</p>
                      <p><strong>Gender:</strong> {currentPlayer.gender}</p>
                      
                      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '20px' }}>
                        <button style={{ 
                          padding: '12px 24px', 
                          backgroundColor: '#ef4444', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '25px',
                          cursor: 'pointer'
                        }} onClick={handlePass}>
                          👎 Pass
                        </button>
                        <button style={{ 
                          padding: '12px 24px', 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '25px',
                          cursor: 'pointer'
                        }} onClick={handleConnect}>
                          👍 Connect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '50px', textAlign: 'center' }}>
                      <h3>🎉 No more players!</h3>
                      <p>You've seen everyone in this category.</p>
                      <button onClick={resetFeed} style={{ 
                        padding: '15px 30px', 
                        backgroundColor: '#6366f1', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '25px',
                        cursor: 'pointer'
                      }}>
                        🔄 Reset Feed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            } />
            <Route path="/matched-players" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🤝 Your Connections</h2>
                {connections.length === 0 ? (
                  <p>No connections yet. Go to Matches to connect with players!</p>
                ) : (
                  <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                    {connections.map(player => (
                      <div key={player.id} style={{ 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '10px', 
                        padding: '20px', 
                        margin: '10px 0',
                        backgroundColor: 'white'
                      }}>
                        <h4>🏓 {player.name}</h4>
                        <p>Skill: {player.skill} | Available: {player.availability}</p>
                        <button style={{ 
                          padding: '8px 16px', 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '20px',
                          cursor: 'pointer'
                        }}>
                          💬 Message
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            } />
            <Route path="/games" element={
              <div style={{ padding: '20px' }}>
                {/* Games Header */}
                <header style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '30px',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <h1 style={{ margin: 0, color: '#374151' }}>🏓 Games</h1>
                  <button style={{
                    padding: '10px 20px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}>
                    + Post a Game
                  </button>
                </header>

                {/* My Games Section */}
                <section style={{ marginBottom: '40px' }}>
                  <h2 style={{ color: '#374151', marginBottom: '20px' }}>My Games</h2>
                  <div style={{ display: 'grid', gap: '15px', maxWidth: '800px' }}>
                    {[
                      { id: 1, title: "Morning Doubles", date: "Dec 15, 2024", time: "9:00 AM", players: "2/4", location: "Central Park Courts" },
                      { id: 2, title: "Evening Singles", date: "Dec 16, 2024", time: "6:00 PM", players: "1/2", location: "Riverside Recreation" }
                    ].map(game => (
                      <div key={game.id} style={{
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        padding: '20px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{game.title}</h3>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📅 {game.date} at {game.time}</p>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📍 {game.location}</p>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>👥 {game.players} players</p>
                          </div>
                          <button style={{
                            padding: '8px 16px',
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}>
                            View Applicants
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Find a Game Section */}
                <section>
                  <h2 style={{ color: '#374151', marginBottom: '20px' }}>Find a Game</h2>
                  <div style={{ display: 'grid', gap: '15px', maxWidth: '800px' }}>
                    {[
                      { id: 3, title: "Advanced Doubles", date: "Dec 17, 2024", time: "7:00 AM", players: "3/4", location: "Tennis Club", host: "Sarah Chen", skill: "Advanced" },
                      { id: 4, title: "Beginner Friendly", date: "Dec 17, 2024", time: "2:00 PM", players: "1/4", location: "Community Center", host: "Mike Rodriguez", skill: "Beginner" },
                      { id: 5, title: "Weekend Warriors", date: "Dec 18, 2024", time: "10:00 AM", players: "2/4", location: "Outdoor Courts", host: "Emma Wilson", skill: "Intermediate" }
                    ].map(game => (
                      <div key={game.id} style={{
                        border: '2px solid #e5e7eb',
                        borderRadius: '15px',
                        padding: '20px',
                        backgroundColor: 'white',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{game.title}</h3>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>🏓 Hosted by {game.host}</p>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📅 {game.date} at {game.time}</p>
                            <p style={{ margin: '5px 0', color: '#6b7280' }}>📍 {game.location}</p>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                              <span style={{ 
                                backgroundColor: game.skill === 'Advanced' ? '#ef4444' : game.skill === 'Intermediate' ? '#f59e0b' : '#10b981',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '15px',
                                fontSize: '12px'
                              }}>
                                {game.skill}
                              </span>
                              <span style={{ color: '#6b7280' }}>👥 {game.players} players</span>
                            </div>
                          </div>
                          <button style={{
                            padding: '8px 16px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}>
                            Request to Join
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            } />
            <Route path="*" element={
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>🚧 Coming Soon!</h2>
                <p>This section is under development.</p>
                <p>Click "Matches" to see the main section.</p>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
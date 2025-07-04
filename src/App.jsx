import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Discover from './screens/Discover';
import Games from './screens/Games';
import Matches from './screens/Matches';
import { GameProvider } from './context/GameContext';
import './App.css';

const mockPlayers = [
  { 
    id: 1, 
    name: "Alex Johnson", 
    age: 28,
    skill: "Intermediate", 
    availability: "Evenings", 
    gender: "Male",
    bio: "Love playing doubles and always looking to improve my game!",
    location: "2.1 miles away",
    avatar: "👨‍🦱",
    experience: "3 years",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 2, 
    name: "Sarah Chen", 
    age: 32,
    skill: "Advanced", 
    availability: "Mornings", 
    gender: "Female",
    bio: "Former tennis player who discovered pickleball 2 years ago. Competitive but fun!",
    location: "1.8 miles away",
    avatar: "👩‍🦰",
    experience: "2 years",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b776?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 3, 
    name: "Mike Rodriguez", 
    age: 45,
    skill: "Beginner", 
    availability: "Weekends", 
    gender: "Male",
    bio: "New to pickleball but excited to learn and meet new people!",
    location: "0.9 miles away",
    avatar: "👨‍🦲",
    experience: "6 months",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 4, 
    name: "Emma Wilson", 
    age: 26,
    skill: "Intermediate", 
    availability: "Afternoons", 
    gender: "Female",
    bio: "Weekend warrior looking for consistent playing partners.",
    location: "3.2 miles away",
    avatar: "👩‍🦱",
    experience: "1.5 years",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 5, 
    name: "David Kim", 
    age: 38,
    skill: "Advanced", 
    availability: "Mornings", 
    gender: "Male",
    bio: "Serious about the game but know how to have fun. Let's play!",
    location: "2.7 miles away",
    avatar: "👨‍💼",
    experience: "4 years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 6, 
    name: "Lisa Thompson", 
    age: 29,
    skill: "Intermediate", 
    availability: "Weekends", 
    gender: "Female",
    bio: "Just moved to the area and looking for regular playing partners!",
    location: "1.3 miles away",
    avatar: "👩‍💻",
    experience: "2 years",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 7, 
    name: "James Wilson", 
    age: 52,
    skill: "Beginner", 
    availability: "Mornings", 
    gender: "Male",
    bio: "Retired and ready to learn something new. Patient and friendly!",
    location: "4.1 miles away",
    avatar: "👨‍🦳",
    experience: "3 months",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 8, 
    name: "Maria Garcia", 
    age: 34,
    skill: "Advanced", 
    availability: "Evenings", 
    gender: "Female",
    bio: "Former college athlete. Love the competitive spirit of pickleball!",
    location: "2.8 miles away",
    avatar: "👩‍🏫",
    experience: "5 years",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fit=crop&crop=face"
  }
];

function AppContent() {
  const [players, setPlayers] = useState(mockPlayers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState('All');
  const [connections, setConnections] = useState([]);
  const [showMessage, setShowMessage] = useState('');
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    age: 30,
    skill: 'Intermediate',
    experience: '2 years',
    availability: 'Evenings',
    gender: 'Male',
    bio: 'Love playing pickleball and meeting new people!',
    location: 'San Francisco, CA',
    avatar: '👤'
  });

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
    <div className="App">
      <Navigation 
        unreadNotificationCount={unreadNotificationCount}
        unreadChatCount={unreadChatCount}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/discover" replace />} />
          <Route path="/discover" element={
            <Discover 
              players={filteredPlayers}
              currentIndex={currentIndex}
              connections={connections}
              onLike={handleConnect}
              onPass={handlePass}
              onFilterChange={(newFilter) => {
                setFilter(newFilter);
                setCurrentIndex(0);
              }}
              currentFilter={filter}
            />
          } />
          <Route path="/games" element={<Games />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/messages" element={
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>💬 Messages</h2>
              <p>Your messages will appear here.</p>
            </div>
          } />
          <Route path="/profile" element={
            <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                paddingBottom: '15px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                <h1 style={{ margin: 0, color: '#1f2937', fontSize: '2.5rem' }}>👤 Your Profile</h1>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '30px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                border: '1px solid #e5e7eb'
              }}>
                {/* Avatar Section */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                  <div style={{
                    fontSize: '80px',
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 15px auto',
                    border: '4px solid #e5e7eb'
                  }}>
                    {userProfile.avatar}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '10px', 
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginTop: '15px'
                  }}>
                    {['👤', '👨', '👩', '🧑‍🦰', '👨‍🦲', '👩‍🦱', '👨‍🦱', '🧑‍🦳'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => setUserProfile({...userProfile, avatar: emoji})}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          border: userProfile.avatar === emoji ? '3px solid #10b981' : '2px solid #e5e7eb',
                          backgroundColor: 'white',
                          fontSize: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Form */}
                <div style={{ display: 'grid', gap: '20px' }}>
                  {/* Name */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: '#1f2937'
                      }}
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Age
                    </label>
                    <input
                      type="number"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value)})}
                      min="18"
                      max="100"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: '#1f2937'
                      }}
                    />
                  </div>

                  {/* Skill Level */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Skill Level
                    </label>
                    <select
                      value={userProfile.skill}
                      onChange={(e) => setUserProfile({...userProfile, skill: e.target.value})}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: '#1f2937'
                      }}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  {/* Bio */}
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: '600', 
                      color: '#374151' 
                    }}>
                      Bio
                    </label>
                    <textarea
                      value={userProfile.bio}
                      onChange={(e) => setUserProfile({...userProfile, bio: e.target.value})}
                      rows="4"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        outline: 'none',
                        backgroundColor: 'white',
                        color: '#1f2937',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div style={{ textAlign: 'center', marginTop: '30px' }}>
                  <button 
                    onClick={() => setShowMessage('Profile saved! 💾')}
                    style={{
                      padding: '15px 30px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    Save Profile
                  </button>
                </div>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <Router>
        <AppContent />
      </Router>
    </GameProvider>
  );
}

export default App;
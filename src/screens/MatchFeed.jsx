import { useState, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import TinderCard from 'react-tinder-card';
import MatchCard from '../components/MatchCard';
import './MatchFeed.css';

const mockPlayers = [
  {
    id: 1,
    name: "Alex Johnson",
    gender: "Male",
    skillLevel: "Intermediate",
    availability: "Evenings"
  },
  {
    id: 2,
    name: "Sarah Chen",
    gender: "Female",
    skillLevel: "Advanced",
    availability: "Mornings"
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    gender: "Male",
    skillLevel: "Beginner",
    availability: "Weekends"
  },
  {
    id: 4,
    name: "Emma Wilson",
    gender: "Female",
    skillLevel: "Intermediate",
    availability: "Afternoons"
  },
  {
    id: 5,
    name: "David Kim",
    gender: "Male",
    skillLevel: "Advanced",
    availability: "Mornings"
  }
];

const MatchFeed = () => {
  const { addMatchedPlayer } = useGameContext();
  const [players, setPlayers] = useState(mockPlayers);
  const [filter, setFilter] = useState('all');
  const [showConfirmation, setShowConfirmation] = useState(null);
  const [connectingPlayer, setConnectingPlayer] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(currentIndex);
  const childRefs = useRef([]);

  const filteredPlayers = players.filter(player => {
    if (filter === 'all') return true;
    return player.skillLevel.toLowerCase() === filter;
  });

  const handlePass = (playerId) => {
    setPlayers(prev => prev.filter(player => player.id !== playerId));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleConnect = (player) => {
    // Set connecting state
    setConnectingPlayer(player.id);
    
    // After 1 second, complete the connection
    setTimeout(() => {
      // Add to matched players in global state
      addMatchedPlayer(player);
      
      // Remove from available players
      setPlayers(prev => prev.filter(p => p.id !== player.id));
      
      // Show confirmation toast
      setShowConfirmation(player.name);
      
      // Clear connecting state
      setConnectingPlayer(null);
      
      // Hide confirmation after 2 seconds
      setTimeout(() => {
        setShowConfirmation(null);
      }, 2000);
    }, 1000);
    
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleResetFeed = () => {
    if (window.confirm('Are you sure you want to reset the feed? This will restore all players.')) {
      setPlayers(mockPlayers);
      setShowConfirmation(null);
      setConnectingPlayer(null);
      setCurrentIndex(mockPlayers.length - 1);
      currentIndexRef.current = mockPlayers.length - 1;
    }
  };

  const swiped = (direction, nameToDelete, index) => {
    console.log('removing: ' + nameToDelete + ' to the ' + direction);
    setCurrentIndex(index - 1);
  };

  const outOfFrame = (name, idx) => {
    console.log(name + ' (' + idx + ') left the screen!');
    currentIndexRef.current >= idx && childRefs.current[idx]?.restoreCard();
  };

  const swipe = async (dir) => {
    if (canSwipe && currentIndex < filteredPlayers.length) {
      await childRefs.current[currentIndex]?.swipe(dir);
    }
  };

  const canSwipe = currentIndex >= 0;

  return (
    <div className="match-feed">
      <header className="feed-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Find Your Match</h1>
            <p>Connect with pickleball players in your area</p>
          </div>
          <button className="reset-btn" onClick={handleResetFeed}>
            🔄 Reset Feed
          </button>
        </div>
      </header>

      <div className="filter-bar">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        <button 
          className={`filter-btn ${filter === 'beginner' ? 'active' : ''}`}
          onClick={() => setFilter('beginner')}
        >
          Beginner
        </button>
        <button 
          className={`filter-btn ${filter === 'intermediate' ? 'active' : ''}`}
          onClick={() => setFilter('intermediate')}
        >
          Intermediate
        </button>
        <button 
          className={`filter-btn ${filter === 'advanced' ? 'active' : ''}`}
          onClick={() => setFilter('advanced')}
        >
          Advanced
        </button>
      </div>

      {showConfirmation && (
        <div className="confirmation-toast">
          ✅ Connected with {showConfirmation}!
        </div>
      )}

      <div className="swipe-deck">
        {filteredPlayers.map((player, index) => (
          <TinderCard
            ref={(el) => (childRefs.current[index] = el)}
            className="swipe"
            key={player.id}
            onSwipe={(dir) => {
              if (dir === 'left') {
                handlePass(player.id);
              } else if (dir === 'right') {
                handleConnect(player);
              }
              swiped(dir, player.name, index);
            }}
            onCardLeftScreen={() => outOfFrame(player.name, index)}
            preventSwipe={['up', 'down']}
          >
            <MatchCard 
              player={player} 
              onPass={() => {
                swipe('left');
              }}
              onConnect={() => {
                swipe('right');
              }}
              isConnecting={connectingPlayer === player.id}
            />
          </TinderCard>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="no-matches">
          <h3>No matches found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      )}
      
      <div className="swipe-instructions">
        <p>👈 Swipe left to pass • Swipe right to connect 👉</p>
      </div>
    </div>
  );
};

export default MatchFeed;
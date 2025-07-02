import { useState } from 'react';
import MatchCard from '../components/MatchCard';
import './MatchFeedScreen.css';

const mockPlayers = [
  {
    id: 1,
    name: "Sarah Johnson",
    gender: "Female",
    skillLevel: "Intermediate",
    availability: "Mornings"
  },
  {
    id: 2,
    name: "Mike Chen",
    gender: "Male", 
    skillLevel: "Advanced",
    availability: "Evenings"
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    gender: "Female",
    skillLevel: "Beginner",
    availability: "Weekends"
  },
  {
    id: 4,
    name: "David Kim",
    gender: "Male",
    skillLevel: "Intermediate", 
    availability: "Afternoons"
  },
  {
    id: 5,
    name: "Lisa Thompson",
    gender: "Female",
    skillLevel: "Advanced",
    availability: "Mornings"
  }
];

const MatchFeedScreen = () => {
  const [players] = useState(mockPlayers);
  const [filter, setFilter] = useState('all');

  const filteredPlayers = players.filter(player => {
    if (filter === 'all') return true;
    return player.skillLevel.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="match-feed-screen">
      <div className="header">
        <h1 className="title">Find Your Match</h1>
        <p className="subtitle">Connect with pickleball players in your area</p>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Players
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
      </div>

      <div className="players-container">
        {filteredPlayers.length > 0 ? (
          filteredPlayers.map(player => (
            <MatchCard key={player.id} player={player} />
          ))
        ) : (
          <div className="no-players">
            <div className="no-players-icon">🏓</div>
            <h3>No players found</h3>
            <p>Try adjusting your filters or check back later for new matches.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchFeedScreen;
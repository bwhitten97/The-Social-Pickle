import { useState } from 'react';
import DiscoverCard from '../components/DiscoverCard';
import './Discover.css';

const Discover = ({ 
  players = [], 
  currentIndex = 0, 
  connections = [], 
  onLike, 
  onPass, 
  onFilterChange, 
  currentFilter = 'All' 
}) => {
  const filters = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  
  // Get current player from the real data
  const currentProfile = players[currentIndex] ? {
    id: players[currentIndex].id,
    name: players[currentIndex].name,
    age: players[currentIndex].age,
    image: players[currentIndex].image,
    experience: players[currentIndex].experience,
    skillLevel: players[currentIndex].skill,
    availability: players[currentIndex].availability,
    distance: players[currentIndex].location,
    bio: players[currentIndex].bio,
    avatar: players[currentIndex].avatar
  } : null;

  const handleLike = () => {
    if (onLike) onLike();
  };

  const handleDislike = () => {
    if (onPass) onPass();
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleFilterChange = (filter) => {
    if (onFilterChange) onFilterChange(filter);
  };

  return (
    <main className="discover-main">
      <section className="discover-section">
        {/* Header row */}
        <div className="discover-header">
          <h1 className="discover-title">Discover</h1>
          <div className="discover-controls">
            <div className="discover-like-counter">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="discover-heart-icon">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
              <span className="discover-like-count">{connections.length}</span>
            </div>
            <button className="discover-refresh-btn" onClick={handleRefresh} aria-label="Refresh">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="discover-refresh-icon">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
                <path d="M21 3v5h-5"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="discover-filters">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`discover-filter-chip ${currentFilter === filter ? 'discover-filter-active' : ''}`}
              onClick={() => handleFilterChange(filter)}
              aria-pressed={currentFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="discover-card-container">
          {currentProfile ? (
            <DiscoverCard 
              profile={currentProfile}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          ) : (
            <div className="discover-no-players">
              <h3>No players found</h3>
              <p>Try adjusting your filters or check back later!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

export default Discover; 
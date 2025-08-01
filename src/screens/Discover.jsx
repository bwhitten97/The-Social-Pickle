import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { mockPlayers } from '../data/mockData';
import SwipeableCard from '../components/SwipeableCard';
import './Discover.css';

// Filter constants
const DEFAULT_DUPR_MIN = 2.0;
const DEFAULT_DUPR_MAX = 6.0;
const DEFAULT_AGE_MIN = 18;
const DEFAULT_AGE_MAX = 100;

const Discover = memo(({ 
  players = [], 
  currentIndex = 0, 
  connections = [], 
  onLike, 
  onPass, 
  onFilterChange, 
  currentFilter = 'All',
  isLoading = false
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    duprRange: { min: DEFAULT_DUPR_MIN, max: DEFAULT_DUPR_MAX },
    gender: 'any',
    playStyle: 'any',
    ageRange: { min: DEFAULT_AGE_MIN, max: DEFAULT_AGE_MAX },
    availability: []
  });
  
  const filters = ['All', 'Advanced Matching'];
  
  // Get current player from the real data
  const currentProfile = useMemo(() => {
    return players[currentIndex] ? {
      id: players[currentIndex].id,
      name: players[currentIndex].name,
      age: players[currentIndex].age,
      image: players[currentIndex].image,
      experience: players[currentIndex].experience,
      playingExperience: players[currentIndex].playingExperience,
      skillLevel: players[currentIndex].skillLevel,
      duprRating: players[currentIndex].duprRating,
      playStyle: players[currentIndex].playStyle,
      availability: players[currentIndex].availability,
      distance: players[currentIndex].distance,
      bio: players[currentIndex].bio,
      avatar: players[currentIndex].avatar,
      gender: players[currentIndex].gender,
      location: players[currentIndex].location
    } : null;
  }, [players, currentIndex]);

  const handleSwipe = useCallback((direction) => {
    if (direction === 'right' && onLike) {
      onLike();
    } else if (direction === 'left' && onPass) {
      onPass();
    }
  }, [onLike, onPass]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleFilterChange = useCallback((filter) => {
    if (filter === 'Advanced Matching') {
      // Show advanced filters panel when Advanced Matching is selected
      setShowAdvancedFilters(true);
      // Notify parent that Advanced Matching is selected, but don't apply filters yet
      if (onFilterChange) onFilterChange(filter, null);
    } else {
      // Hide advanced filters panel for other filters
      setShowAdvancedFilters(false);
      // Apply the basic filter immediately
      if (onFilterChange) onFilterChange(filter, null);
    }
  }, [onFilterChange]);

  const handleAdvancedFilterChange = useCallback((filterType, value) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const clearAdvancedFilters = useCallback(() => {
    setAdvancedFilters({
      duprRange: { min: DEFAULT_DUPR_MIN, max: DEFAULT_DUPR_MAX },
      gender: 'any',
      playStyle: 'any',
      ageRange: { min: DEFAULT_AGE_MIN, max: DEFAULT_AGE_MAX },
      availability: []
    });
  }, []);

  return (
    <main className="discover-main">
      <div className="discover-container">
        {/* Header row - in gray area */}
        <div className="discover-header">
          <h1 className="discover-title">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="discover-title-icon">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            Discover
          </h1>
        </div>

        {/* White container */}
        <section className="discover-section">

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

        {/* Advanced Filters Panel */}
        {currentFilter === 'Advanced Matching' && showAdvancedFilters && (
          <div className="discover-advanced-filters">
            <div className="advanced-filter-header">
              <h3>Advanced Filters</h3>
              <div className="advanced-filter-header-actions">
                <button className="clear-filters-btn" onClick={clearAdvancedFilters}>
                  Clear All
                </button>
                <button 
                  className="close-filters-btn"
                  onClick={() => setShowAdvancedFilters(false)}
                  aria-label="Close filters"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="advanced-filter-grid">
              {/* DUPR Rating */}
              <div className="filter-group">
                <label className="filter-label">DUPR Rating</label>
                <div className="range-inputs">
                  <select
                    value={advancedFilters.duprRange.min}
                    onChange={(e) => handleAdvancedFilterChange('duprRange', { 
                      ...advancedFilters.duprRange, 
                      min: parseFloat(e.target.value) 
                    })}
                    className="filter-select"
                  >
                    <option value={DEFAULT_DUPR_MIN}>2.0+</option>
                    <option value="2.5">2.5+</option>
                    <option value="3.0">3.0+</option>
                    <option value="3.5">3.5+</option>
                    <option value="4.0">4.0+</option>
                    <option value="4.5">4.5+</option>
                    <option value="5.0">5.0+</option>
                    <option value="5.5">5.5+</option>
                  </select>
                  <span>to</span>
                  <select
                    value={advancedFilters.duprRange.max}
                    onChange={(e) => handleAdvancedFilterChange('duprRange', { 
                      ...advancedFilters.duprRange, 
                      max: parseFloat(e.target.value) 
                    })}
                    className="filter-select"
                  >
                    <option value="3.0">3.0</option>
                    <option value="3.5">3.5</option>
                    <option value="4.0">4.0</option>
                    <option value="4.5">4.5</option>
                    <option value="5.0">5.0</option>
                    <option value="5.5">5.5</option>
                    <option value={DEFAULT_DUPR_MAX}>6.0</option>
                  </select>
                </div>
              </div>

              {/* Gender */}
              <div className="filter-group">
                <label className="filter-label">Gender</label>
                <select
                  value={advancedFilters.gender}
                  onChange={(e) => handleAdvancedFilterChange('gender', e.target.value)}
                  className="filter-select"
                >
                  <option value="any">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>


              {/* Age Range */}
              <div className="filter-group">
                <label className="filter-label">Age Range</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    value={advancedFilters.ageRange.min}
                    onChange={(e) => handleAdvancedFilterChange('ageRange', { 
                      ...advancedFilters.ageRange, 
                      min: parseInt(e.target.value) 
                    })}
                    className="filter-input"
                    min={DEFAULT_AGE_MIN}
                    max={DEFAULT_AGE_MAX}
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={advancedFilters.ageRange.max}
                    onChange={(e) => handleAdvancedFilterChange('ageRange', { 
                      ...advancedFilters.ageRange, 
                      max: parseInt(e.target.value) 
                    })}
                    className="filter-input"
                    min={DEFAULT_AGE_MIN}
                    max={DEFAULT_AGE_MAX}
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="filter-group">
                <label className="filter-label">Availability</label>
                <div className="availability-checkboxes">
                  {[
                    { value: 'mornings', label: 'Mornings', icon: '🌅' },
                    { value: 'afternoons', label: 'Afternoons', icon: '☀️' },
                    { value: 'evenings', label: 'Evenings', icon: '🌆' },
                    { value: 'weekdays', label: 'Weekdays', icon: '📅' },
                    { value: 'weekends', label: 'Weekends', icon: '🎉' },
                    { value: 'flexible', label: 'Flexible', icon: '⚡' }
                  ].map((option) => (
                    <label key={option.value} className="availability-checkbox">
                      <input
                        type="checkbox"
                        checked={advancedFilters.availability.includes(option.value)}
                        onChange={(e) => {
                          const newAvailability = e.target.checked
                            ? [...advancedFilters.availability, option.value]
                            : advancedFilters.availability.filter(a => a !== option.value);
                          handleAdvancedFilterChange('availability', newAvailability);
                        }}
                      />
                      <span className="checkbox-content">
                        <span className="availability-icon">{option.icon}</span>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
            
            <div className="discover-filter-apply">
              <button 
                className="discover-apply-btn"
                onClick={() => {
                  if (onFilterChange) onFilterChange('Advanced Matching', advancedFilters);
                  setShowAdvancedFilters(false); // Close the form after applying
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="discover-card-container">
          {isLoading ? (
            <div className="discover-loading">
              <div className="loading-spinner"></div>
              <p>Loading players...</p>
            </div>
          ) : players.length === 0 ? (
            <div className="discover-no-players">
              <h3>No players found</h3>
              <p>Try adjusting your filters or check back later!</p>
            </div>
          ) : currentProfile ? (
            <div className="swipeable-card-stack">
              <SwipeableCard 
                profile={currentProfile}
                onSwipe={handleSwipe}
                isTop={true}
              />
              {/* Show next card underneath */}
              {players[currentIndex + 1] && (
                <SwipeableCard 
                  profile={{
                    id: players[currentIndex + 1].id,
                    name: players[currentIndex + 1].name,
                    age: players[currentIndex + 1].age,
                    image: players[currentIndex + 1].image,
                    experience: players[currentIndex + 1].experience,
                    playingExperience: players[currentIndex + 1].playingExperience,
                    skillLevel: players[currentIndex + 1].skillLevel,
                    duprRating: players[currentIndex + 1].duprRating,
                    playStyle: players[currentIndex + 1].playStyle,
                    availability: players[currentIndex + 1].availability,
                    distance: players[currentIndex + 1].distance,
                    bio: players[currentIndex + 1].bio,
                    avatar: players[currentIndex + 1].avatar,
                    gender: players[currentIndex + 1].gender,
                    location: players[currentIndex + 1].location
                  }}
                  isTop={false}
                />
              )}
            </div>
          ) : (
            <div className="discover-no-players">
              <h3>No more players</h3>
              <p>You've seen all available players. Check back later for new matches!</p>
            </div>
          )}
        </div>
        </section>
      </div>
    </main>
  );
});

Discover.displayName = 'Discover';

export default Discover; 
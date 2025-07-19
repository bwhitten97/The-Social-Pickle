import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { mockPlayers } from '../data/mockData';
import DiscoverCard from '../components/DiscoverCard';
import './Discover.css';

// Filter constants
const DEFAULT_DUPR_MIN = 2.0;
const DEFAULT_DUPR_MAX = 6.0;
const DEFAULT_AGE_MIN = 18;
const DEFAULT_AGE_MAX = 100;
const QUICK_MATCH_DUPR_MIN = 3.0;
const QUICK_MATCH_DUPR_MAX = 5.0;
const QUICK_MATCH_AGE_MAX = 65;

const Discover = memo(({ 
  players = [], 
  currentIndex = 0, 
  connections = [], 
  onLike, 
  onPass, 
  onFilterChange, 
  currentFilter = 'All' 
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    duprRange: { min: DEFAULT_DUPR_MIN, max: DEFAULT_DUPR_MAX },
    gender: 'any',
    playStyle: 'any',
    ageRange: { min: DEFAULT_AGE_MIN, max: DEFAULT_AGE_MAX },
    availability: []
  });
  
  const filters = ['All', 'Quick Match'];
  
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

  const handleLike = useCallback(() => {
    if (onLike) onLike();
  }, [onLike]);

  const handleDislike = useCallback(() => {
    if (onPass) onPass();
  }, [onPass]);

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleFilterChange = useCallback((filter) => {
    if (filter === 'Quick Match') {
      // Quick Match logic: Apply smart filters based on current user preferences
      // This filters for players with similar skill level and availability
      setAdvancedFilters(prev => ({
        ...prev,
        duprRange: { min: QUICK_MATCH_DUPR_MIN, max: QUICK_MATCH_DUPR_MAX }, // Mid-range players for better matches
        playStyle: 'any',
        ageRange: { min: DEFAULT_AGE_MIN, max: QUICK_MATCH_AGE_MAX }, // Reasonable age range
        availability: ['flexible', 'weekends'] // Most common availability times
      }));
    }
    if (onFilterChange) onFilterChange(filter);
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
          <button
            className="discover-advanced-filter-toggle"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="21" x2="4" y2="14"></line>
              <line x1="4" y1="10" x2="4" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12" y2="3"></line>
              <line x1="20" y1="21" x2="20" y2="16"></line>
              <line x1="20" y1="12" x2="20" y2="3"></line>
              <line x1="1" y1="14" x2="7" y2="14"></line>
              <line x1="9" y1="8" x2="15" y2="8"></line>
              <line x1="17" y1="16" x2="23" y2="16"></line>
            </svg>
            Advanced
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="discover-advanced-filters">
            <div className="advanced-filter-header">
              <h3>Advanced Filters</h3>
              <button className="clear-filters-btn" onClick={clearAdvancedFilters}>
                Clear All
              </button>
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

            </div>
            
            <div className="discover-filter-apply">
              <button 
                className="discover-apply-btn"
                onClick={() => setShowAdvancedFilters(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Card */}
        <div className="discover-card-container">
          {players.length === 0 ? (
            <div className="discover-loading">
              <div className="loading-spinner"></div>
              <p>Loading players...</p>
            </div>
          ) : currentProfile ? (
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
      </div>
    </main>
  );
});

Discover.displayName = 'Discover';

export default Discover; 
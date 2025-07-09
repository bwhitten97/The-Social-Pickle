import { useState, useEffect } from 'react';
import { 
  getCurrentLocation, 
  geocodeAddress, 
  reverseGeocode, 
  saveUserLocation, 
  getSavedUserLocation 
} from '../utils/locationService';
import './LocationSelector.css';

const LocationSelector = ({ value, onChange, className = '', placeholder = 'Enter your location' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setError('');

    try {
      const coords = await getCurrentLocation();
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      
      const locationData = {
        address,
        coordinates: coords,
        timestamp: Date.now()
      };

      setInputValue(address);
      onChange(address, locationData);
      saveUserLocation(locationData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = async (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length > 2) {
      // Simple suggestion logic - in production, use Google Places API
      const mockSuggestions = [
        `${newValue}, CA`,
        `${newValue}, NY`,
        `${newValue}, FL`,
        `${newValue}, TX`
      ].filter(suggestion => 
        suggestion.toLowerCase().includes(newValue.toLowerCase())
      ).slice(0, 3);

      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    
    try {
      const geocoded = await geocodeAddress(suggestion);
      const locationData = {
        address: suggestion,
        coordinates: {
          latitude: geocoded.latitude,
          longitude: geocoded.longitude
        },
        timestamp: Date.now()
      };
      
      onChange(suggestion, locationData);
      saveUserLocation(locationData);
    } catch (err) {
      console.error('Failed to geocode suggestion:', err);
      onChange(suggestion);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`location-selector ${className}`}>
      <div className="location-input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="location-input"
        />
        
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isLoading}
          className="location-button"
          title="Use current location"
        >
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
            </svg>
          )}
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="location-suggestions">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="location-suggestion"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="location-error">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
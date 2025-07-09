// Location service utilities for The Social Pickle

/**
 * Get user's current location using browser geolocation
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        let errorMessage = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      options
    );
  });
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Geocode an address to get coordinates
 * @param {string} address - Address to geocode
 * @returns {Promise<{latitude: number, longitude: number, formattedAddress: string}>}
 */
export const geocodeAddress = async (address) => {
  try {
    // Using a free geocoding service (you might want to use Google Maps API in production)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }
    
    const data = await response.json();
    
    if (data.length === 0) {
      throw new Error('Address not found');
    }
    
    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to geocode address');
  }
};

/**
 * Reverse geocode coordinates to get address
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} Formatted address
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
    );
    
    if (!response.ok) {
      throw new Error('Reverse geocoding request failed');
    }
    
    const data = await response.json();
    
    // Extract city and state from the address components
    const address = data.address;
    const city = address.city || address.town || address.village || address.suburb;
    const state = address.state;
    
    if (city && state) {
      return `${city}, ${state}`;
    } else {
      return data.display_name.split(',').slice(0, 2).join(',').trim();
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    throw new Error('Failed to reverse geocode coordinates');
  }
};

/**
 * Get users within a certain distance
 * @param {Object} userLocation - User's coordinates {latitude, longitude}
 * @param {Array} players - Array of player objects with location data
 * @param {number} maxDistance - Maximum distance in miles
 * @returns {Array} Filtered players with distance information
 */
export const getPlayersWithinDistance = (userLocation, players, maxDistance = 50) => {
  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return players.map(player => ({ ...player, distance: 'Unknown' }));
  }

  return players
    .map(player => {
      if (!player.coordinates || !player.coordinates.latitude || !player.coordinates.longitude) {
        return { ...player, distance: 'Unknown' };
      }

      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        player.coordinates.latitude,
        player.coordinates.longitude
      );

      return { ...player, distance };
    })
    .filter(player => player.distance === 'Unknown' || player.distance <= maxDistance)
    .sort((a, b) => {
      if (a.distance === 'Unknown') return 1;
      if (b.distance === 'Unknown') return -1;
      return a.distance - b.distance;
    });
};

/**
 * Format distance for display
 * @param {number|string} distance - Distance in miles or 'Unknown'
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance === 'Unknown' || distance === null || distance === undefined) {
    return 'Distance unknown';
  }
  
  if (distance < 1) {
    return '< 1 mile away';
  }
  
  return `${distance} ${distance === 1 ? 'mile' : 'miles'} away`;
};

/**
 * Request location permission and get current location
 * @returns {Promise<{latitude: number, longitude: number, address: string}>}
 */
export const requestLocationPermission = async () => {
  try {
    const coords = await getCurrentLocation();
    const address = await reverseGeocode(coords.latitude, coords.longitude);
    
    return {
      ...coords,
      address
    };
  } catch (error) {
    console.error('Location permission error:', error);
    throw error;
  }
};

/**
 * Save user location to localStorage
 * @param {Object} location - Location object with latitude, longitude, and address
 */
export const saveUserLocation = (location) => {
  try {
    localStorage.setItem('userLocation', JSON.stringify(location));
  } catch (error) {
    console.error('Failed to save location:', error);
  }
};

/**
 * Get saved user location from localStorage
 * @returns {Object|null} Saved location or null if not found
 */
export const getSavedUserLocation = () => {
  try {
    const saved = localStorage.getItem('userLocation');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to get saved location:', error);
    return null;
  }
};

/**
 * Clear saved user location
 */
export const clearSavedLocation = () => {
  try {
    localStorage.removeItem('userLocation');
  } catch (error) {
    console.error('Failed to clear saved location:', error);
  }
};
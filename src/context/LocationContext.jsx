import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getSavedUserLocation, 
  saveUserLocation, 
  requestLocationPermission,
  getPlayersWithinDistance,
  formatDistance 
} from '../utils/locationService';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    // Load saved location on app start
    const savedLocation = getSavedUserLocation();
    if (savedLocation) {
      setUserLocation(savedLocation);
      setHasLocationPermission(true);
    }
  }, []);

  const requestLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);

    try {
      const location = await requestLocationPermission();
      setUserLocation(location);
      setHasLocationPermission(true);
      saveUserLocation(location);
    } catch (error) {
      setLocationError(error.message);
      setHasLocationPermission(false);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const updateUserLocation = (location) => {
    setUserLocation(location);
    saveUserLocation(location);
  };

  const getFilteredPlayers = (players, maxDistance = 50) => {
    if (!userLocation) {
      return players.map(player => ({ ...player, distance: 'Unknown' }));
    }

    return getPlayersWithinDistance(userLocation, players, maxDistance);
  };

  const calculatePlayerDistance = (player) => {
    if (!userLocation || !player.coordinates) {
      return 'Unknown';
    }

    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      player.coordinates.latitude,
      player.coordinates.longitude
    );

    return formatDistance(distance);
  };

  const value = {
    userLocation,
    isLoadingLocation,
    locationError,
    hasLocationPermission,
    requestLocation,
    updateUserLocation,
    getFilteredPlayers,
    calculatePlayerDistance
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext;
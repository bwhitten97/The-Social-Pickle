// App configuration settings
export const config = {
  // Feature flags
  MULTI_CITY_ENABLED: import.meta.env.VITE_MULTI_CITY_ENABLED === 'true' || false,
  
  // Default location for single-city mode
  DEFAULT_LOCATION: {
    zip: '60601',  // Chicago ZIP code
    city: 'Chicago'
  },
  
  // Supported cities for multi-city mode
  SUPPORTED_CITIES: [
    { code: 'CHI', name: 'Chicago', zip: '60601' },
    { code: 'NYC', name: 'New York', zip: '10001' },
    { code: 'LA', name: 'Los Angeles', zip: '90001' },
    { code: 'SF', name: 'San Francisco', zip: '94102' }
  ]
};

// Location validation
export const validateZipCode = (zip) => {
  return /^\d{5}$/.test(zip);
};

// Get location display name
export const getLocationDisplay = (location) => {
  if (!location) return config.DEFAULT_LOCATION.city;
  return location.city || `ZIP: ${location.zip}`;
};
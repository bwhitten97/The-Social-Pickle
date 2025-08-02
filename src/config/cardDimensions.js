/**
 * Discover Card Dimensions Configuration
 * 
 * This file manages all discover card dimensions and aspect ratios.
 * Update these values to automatically update both the display cards
 * and the photo crop tool interface.
 */

export const DISCOVER_CARD_CONFIG = {
  // Card container dimensions
  cardWidth: 400,
  cardMaxWidth: 400,
  
  // Image section dimensions (can be updated based on bio solution)
  imageHeight: 420,
  
  // Responsive breakpoints
  mobileImageHeight: 260,
  mobileBreakpoint: 640,
  
  // Aspect ratios
  getAspectRatio() {
    return this.cardWidth / this.imageHeight;
  },
  
  getMobileAspectRatio() {
    return this.cardWidth / this.mobileImageHeight;
  },
  
  // Get current dimensions based on screen size
  getCurrentDimensions() {
    const isMobile = window.innerWidth <= this.mobileBreakpoint;
    return {
      width: this.cardWidth,
      height: isMobile ? this.mobileImageHeight : this.imageHeight,
      aspectRatio: isMobile ? this.getMobileAspectRatio() : this.getAspectRatio(),
      isMobile
    };
  },
  
  // CSS custom properties for dynamic updates
  getCSSVariables() {
    return {
      '--card-width': `${this.cardWidth}px`,
      '--card-image-height': `${this.imageHeight}px`,
      '--card-mobile-image-height': `${this.mobileImageHeight}px`
    };
  }
};

// Utility function to read actual DOM dimensions (for dynamic measurement)
export const measureCardDimensions = () => {
  const cardElement = document.querySelector('.swipeable-card-image-section');
  if (cardElement) {
    const rect = cardElement.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      aspectRatio: rect.width / rect.height
    };
  }
  
  // Fallback to config values
  return DISCOVER_CARD_CONFIG.getCurrentDimensions();
};

// Export individual values for convenience
export const {
  cardWidth,
  cardMaxWidth,
  imageHeight,
  mobileImageHeight,
  mobileBreakpoint
} = DISCOVER_CARD_CONFIG;
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
  
  // Image section dimensions (calculated from actual CSS: 464px total - details section height)
  imageHeight: 270, // Normal screens: 464px - 194px details
  imageHeightShort1: 290, // ≤750px height: 464px - 174px details
  imageHeightShort2: 300, // ≤700px height: 464px - 164px details  
  imageHeightShort3: 310, // ≤650px height: 464px - 154px details
  
  // Responsive breakpoints
  mobileImageHeight: 270, // Mobile uses same base calculation as desktop
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
    const screenHeight = window.innerHeight;
    
    // Determine image height based on screen height (matches CSS media queries)
    let imageHeight = this.imageHeight; // Default: 270px
    if (screenHeight <= 650) {
      imageHeight = this.imageHeightShort3; // 310px
    } else if (screenHeight <= 700) {
      imageHeight = this.imageHeightShort2; // 300px
    } else if (screenHeight <= 750) {
      imageHeight = this.imageHeightShort1; // 290px
    }
    
    // For mobile, use the same logic as desktop
    const finalHeight = isMobile ? imageHeight : imageHeight;
    
    return {
      width: this.cardWidth,
      height: finalHeight,
      aspectRatio: this.cardWidth / finalHeight,
      isMobile,
      screenHeight
    };
  },
  
  // CSS custom properties for dynamic updates
  getCSSVariables() {
    return {
      '--card-width': `${this.cardWidth}px`,
      '--card-image-height': `${this.imageHeight}px`,
      '--card-image-height-short1': `${this.imageHeightShort1}px`,
      '--card-image-height-short2': `${this.imageHeightShort2}px`,  
      '--card-image-height-short3': `${this.imageHeightShort3}px`,
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
  imageHeightShort1,
  imageHeightShort2,
  imageHeightShort3,
  mobileImageHeight,
  mobileBreakpoint
} = DISCOVER_CARD_CONFIG;
import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

/**
 * Analytics helper functions for The Social Pickle app
 * All functions check if analytics is available before logging
 */

// User Authentication Events
export const logUserSignUp = (method, userId) => {
  if (analytics) {
    logEvent(analytics, 'sign_up', {
      method: method, // 'email', 'google', 'apple', etc.
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

export const logUserLogin = (method, userId) => {
  if (analytics) {
    logEvent(analytics, 'login', {
      method: method, // 'email', 'google', 'apple', etc.
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

// Profile Events
export const logProfileCompletion = (userId, completionPercentage) => {
  if (analytics) {
    logEvent(analytics, 'profile_completed', {
      user_id: userId,
      completion_percentage: completionPercentage,
      timestamp: new Date().toISOString()
    });
  }
};

export const logProfileUpdate = (userId, updatedFields) => {
  if (analytics) {
    logEvent(analytics, 'profile_updated', {
      user_id: userId,
      updated_fields: updatedFields.join(','), // Array of field names
      timestamp: new Date().toISOString()
    });
  }
};

// Discovery/Matching Events
export const logPlayerLiked = (userId, likedPlayerId, playerSkillLevel) => {
  if (analytics) {
    logEvent(analytics, 'player_liked', {
      user_id: userId,
      liked_player_id: likedPlayerId,
      liked_player_skill: playerSkillLevel,
      timestamp: new Date().toISOString()
    });
  }
};

export const logPlayerPassed = (userId, passedPlayerId, playerSkillLevel) => {
  if (analytics) {
    logEvent(analytics, 'player_passed', {
      user_id: userId,
      passed_player_id: passedPlayerId,
      passed_player_skill: playerSkillLevel,
      timestamp: new Date().toISOString()
    });
  }
};

export const logMatchCreated = (userId, matchedUserId, matchType) => {
  if (analytics) {
    logEvent(analytics, 'match_created', {
      user_id: userId,
      matched_user_id: matchedUserId,
      match_type: matchType, // 'mutual_like', 'game_partner', etc.
      timestamp: new Date().toISOString()
    });
  }
};

// Game Events
export const logGamePosted = (userId, gameId, gameDetails) => {
  if (analytics) {
    logEvent(analytics, 'game_posted', {
      user_id: userId,
      game_id: gameId,
      game_type: gameDetails.gameType || 'singles',
      skill_level: gameDetails.skillLevel || 'all',
      location: gameDetails.location || 'unknown',
      date: gameDetails.date || 'unknown',
      max_players: gameDetails.maxPlayers || 4,
      timestamp: new Date().toISOString()
    });
  }
};

export const logGameJoined = (userId, gameId, gameHostId) => {
  if (analytics) {
    logEvent(analytics, 'game_joined', {
      user_id: userId,
      game_id: gameId,
      game_host_id: gameHostId,
      timestamp: new Date().toISOString()
    });
  }
};

export const logGameLeft = (userId, gameId) => {
  if (analytics) {
    logEvent(analytics, 'game_left', {
      user_id: userId,
      game_id: gameId,
      timestamp: new Date().toISOString()
    });
  }
};

// Messaging Events
export const logMessageSent = (userId, recipientId, messageType) => {
  if (analytics) {
    logEvent(analytics, 'message_sent', {
      user_id: userId,
      recipient_id: recipientId,
      message_type: messageType || 'text', // 'text', 'image', 'game_invite', etc.
      timestamp: new Date().toISOString()
    });
  }
};

export const logChatOpened = (userId, chatPartnerId) => {
  if (analytics) {
    logEvent(analytics, 'chat_opened', {
      user_id: userId,
      chat_partner_id: chatPartnerId,
      timestamp: new Date().toISOString()
    });
  }
};

// Page View Events
export const logPageView = (pageName, userId) => {
  if (analytics) {
    logEvent(analytics, 'page_view', {
      page_name: pageName,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }
};

export const logScreenView = (screenName, screenClass, userId) => {
  if (analytics) {
    logEvent(analytics, 'screen_view', {
      screen_name: screenName,
      screen_class: screenClass,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }
};

// Feature Usage Events
export const logFeatureUsed = (featureName, userId, additionalParams = {}) => {
  if (analytics) {
    logEvent(analytics, 'feature_used', {
      feature_name: featureName,
      user_id: userId,
      ...additionalParams,
      timestamp: new Date().toISOString()
    });
  }
};

// Error Events
export const logError = (errorType, errorMessage, userId) => {
  if (analytics) {
    logEvent(analytics, 'app_error', {
      error_type: errorType,
      error_message: errorMessage,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }
};

// User Engagement Events
export const logUserEngagement = (engagementType, duration, userId) => {
  if (analytics) {
    logEvent(analytics, 'user_engagement', {
      engagement_type: engagementType,
      duration_seconds: duration,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

// Search Events
export const logSearch = (searchTerm, searchType, resultsCount, userId) => {
  if (analytics) {
    logEvent(analytics, 'search', {
      search_term: searchTerm,
      search_type: searchType, // 'players', 'games', 'locations', etc.
      results_count: resultsCount,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

// Onboarding Events
export const logOnboardingStart = (userId) => {
  if (analytics) {
    logEvent(analytics, 'onboarding_start', {
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

export const logOnboardingStep = (stepName, stepNumber, userId) => {
  if (analytics) {
    logEvent(analytics, 'onboarding_step', {
      step_name: stepName,
      step_number: stepNumber,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

export const logOnboardingComplete = (userId, completionTime) => {
  if (analytics) {
    logEvent(analytics, 'onboarding_complete', {
      user_id: userId,
      completion_time_seconds: completionTime,
      timestamp: new Date().toISOString()
    });
  }
};

// Premium/Purchase Events
export const logPurchaseIntent = (itemType, itemId, userId) => {
  if (analytics) {
    logEvent(analytics, 'purchase_intent', {
      item_type: itemType, // 'premium_subscription', 'boost', etc.
      item_id: itemId,
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

// Social Events
export const logShare = (contentType, contentId, shareMethod, userId) => {
  if (analytics) {
    logEvent(analytics, 'share', {
      content_type: contentType, // 'profile', 'game', 'achievement', etc.
      content_id: contentId,
      method: shareMethod, // 'copy_link', 'social_media', etc.
      user_id: userId,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance Events
export const logPerformance = (metricName, value, userId) => {
  if (analytics) {
    logEvent(analytics, 'app_performance', {
      metric_name: metricName,
      metric_value: value,
      user_id: userId || 'anonymous',
      timestamp: new Date().toISOString()
    });
  }
};
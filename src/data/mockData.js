// Centralized mock data for development and testing purposes
// This file contains all mock data used across the application
// TODO: Replace with Firebase data when backend integration is complete

// Mock players data for the Discover screen
export const mockPlayers = [
  { 
    id: 1, 
    name: "Alex Johnson", 
    age: 28,
    skillLevel: "intermediate", 
    duprRating: "3.5",
    playStyle: "both",
    availability: ["weeknights", "weekends"], 
    gender: "male",
    bio: "Love playing doubles and always looking to improve my game!",
    location: "San Francisco, CA",
    distance: "2.1 miles away",
    avatar: "👨‍🦱",
    playingExperience: "3 years",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 2, 
    name: "Sarah Chen", 
    age: 32,
    skillLevel: "advanced", 
    duprRating: "4.8",
    playStyle: "competitive",
    availability: ["mornings", "weekends"], 
    gender: "female",
    bio: "Former tennis player who discovered pickleball 2 years ago. Competitive but fun!",
    location: "Oakland, CA",
    distance: "1.8 miles away",
    avatar: "👩‍🦰",
    playingExperience: "2 years",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b776?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 3, 
    name: "Mike Rodriguez", 
    age: 45,
    skillLevel: "beginner", 
    duprRating: "2.5",
    playStyle: "casual",
    availability: ["weekends", "flexible"], 
    gender: "male",
    bio: "New to pickleball but excited to learn and meet new people!",
    location: "Berkeley, CA",
    distance: "0.9 miles away",
    avatar: "👨‍🦲",
    playingExperience: "6 months",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 4, 
    name: "Emma Wilson", 
    age: 26,
    skillLevel: "intermediate", 
    duprRating: "3.2",
    playStyle: "casual",
    availability: ["afternoons", "weekends"], 
    gender: "female",
    bio: "Weekend warrior looking for consistent playing partners.",
    location: "Alameda, CA",
    distance: "3.2 miles away",
    avatar: "👩‍🦱",
    playingExperience: "1.5 years",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 5, 
    name: "David Kim", 
    age: 38,
    skillLevel: "advanced", 
    duprRating: "5.2",
    playStyle: "competitive",
    availability: ["mornings", "weeknights"], 
    gender: "male",
    bio: "Serious about the game but know how to have fun. Let's play!",
    location: "San Jose, CA",
    distance: "2.7 miles away",
    avatar: "👨‍💼",
    playingExperience: "4 years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 6, 
    name: "Lisa Thompson", 
    age: 29,
    skillLevel: "intermediate", 
    duprRating: "3.8",
    playStyle: "both",
    availability: ["weekends", "flexible"], 
    gender: "female",
    bio: "Just moved to the area and looking for regular playing partners!",
    location: "Palo Alto, CA",
    distance: "1.3 miles away",
    avatar: "👩‍💻",
    playingExperience: "2 years",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 7, 
    name: "James Wilson", 
    age: 52,
    skillLevel: "beginner", 
    duprRating: "2.0",
    playStyle: "casual",
    availability: ["mornings", "afternoons"], 
    gender: "male",
    bio: "Retired and ready to learn something new. Patient and friendly!",
    location: "Fremont, CA",
    distance: "4.1 miles away",
    avatar: "👨‍🦳",
    playingExperience: "3 months",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 8, 
    name: "Maria Garcia", 
    age: 34,
    skillLevel: "advanced", 
    duprRating: "4.5",
    playStyle: "competitive",
    availability: ["weeknights", "weekends"], 
    gender: "female",
    bio: "Former college athlete. Love the competitive spirit of pickleball!",
    location: "Sunnyvale, CA",
    distance: "2.8 miles away",
    avatar: "👩‍🏫",
    playingExperience: "5 years",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 9, 
    name: "Taylor Martinez", 
    age: 27,
    skillLevel: "intermediate", 
    duprRating: "3.3",
    playStyle: "both",
    availability: ["mornings", "weekends", "flexible"], 
    gender: "non-binary",
    bio: "Pickleball enthusiast and software engineer. Always improving my game!",
    location: "Mountain View, CA",
    distance: "1.5 miles away",
    avatar: "🧑‍💻",
    playingExperience: "18 months",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 10, 
    name: "Robert Chang", 
    age: 41,
    skillLevel: "intermediate", 
    duprRating: "3.6",
    playStyle: "casual",
    availability: ["afternoons", "weekends"], 
    gender: "male",
    bio: "Weekend warrior, dad of two. Looking for fun matches and good laughs!",
    location: "Redwood City, CA",
    distance: "3.5 miles away",
    avatar: "👨‍👦‍👦",
    playingExperience: "2.5 years",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 11, 
    name: "Ashley Davis", 
    age: 36,
    skillLevel: "beginner", 
    duprRating: "2.8",
    playStyle: "casual",
    availability: ["mornings", "flexible"], 
    gender: "female",
    bio: "New mom getting back into sports. Patient partners welcome!",
    location: "San Mateo, CA",
    distance: "2.2 miles away",
    avatar: "👩‍🍼",
    playingExperience: "1 year",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800&q=80&fit=crop&crop=face"
  },
  { 
    id: 12, 
    name: "Marcus Johnson", 
    age: 24,
    skillLevel: "advanced", 
    duprRating: "4.9",
    playStyle: "competitive",
    availability: ["weeknights", "mornings", "weekends"], 
    gender: "male",
    bio: "Ex-tennis player, now obsessed with pickleball. Tournament ready!",
    location: "Cupertino, CA",
    distance: "4.0 miles away",
    avatar: "🎾",
    playingExperience: "3 years",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80&fit=crop&crop=face"
  }
];

// Mock matches data for the Matches screen
export const mockMatches = [
  {
    id: 1,
    name: "Jessica Martinez",
    age: 29,
    skillLevel: "Intermediate",
    availability: "Evenings",
    bio: "Pickleball enthusiast who loves the social aspect of the game. Always down for post-game coffee!",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b776?w=800&q=80&fit=crop&crop=face",
    matchedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Priya Patel",
    age: 32,
    skillLevel: "Advanced",
    duprRating: "4.2",
    availability: "Weekends",
    bio: "Competitive spirit with a calm mindset—from yoga mat to pickleball court!",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80&fit=crop&crop=face",
    matchedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: "Maria Gonzalez",
    age: 36,
    skillLevel: "Intermediate",
    availability: "Afternoons",
    bio: "Love the strategy of pickleball! Always working on my third-shot drop and looking for doubles partners.",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=800&q=80&fit=crop&crop=face",
    matchedAt: new Date().toISOString()
  }
];

// Default notifications for the Chat screen
export const defaultNotifications = [
  {
    id: 'default-1',
    message: "Court 3 is available at 5 PM today.",
    timestamp: "10:05 AM",
    isRead: false,
    type: "court_availability"
  },
  {
    id: 'default-2', 
    message: "You have a new friend request.",
    timestamp: "Yesterday",
    isRead: false,
    type: "friend_request"
  },
  {
    id: 'default-3',
    message: "Game reminder: Tomorrow at 2 PM.",
    timestamp: "2 days ago",
    isRead: false,
    type: "game_reminder"
  }
];

// Dummy chats for the Chat screen (shown when no real chats exist)
export const dummyChats = [
  {
    id: 'dummy-sarah',
    name: "Sarah Wilson",
    lastMessage: "Great game yesterday!",
    timestamp: "04:30 AM",
    avatar: "🦁",
    isDummy: true
  },
  {
    id: 'dummy-mike',
    name: "Mike Chen", 
    lastMessage: "Are you free for doubles tomorrow?",
    timestamp: "03:15 AM",
    avatar: "🙂",
    isDummy: true
  }
];
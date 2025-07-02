import { useState } from 'react';
import SwipeableCard from './SwipeableCard';
import './MatchFeed.css';

const sampleProfiles = [
  {
    id: 1,
    name: "Alex Johnson",
    gender: "Male",
    skill: "Tennis",
    availability: "Weekends"
  },
  {
    id: 2,
    name: "Sarah Chen",
    gender: "Female", 
    skill: "Basketball",
    availability: "Evenings"
  },
  {
    id: 3,
    name: "Mike Rodriguez",
    gender: "Male",
    skill: "Soccer",
    availability: "Mornings"
  },
  {
    id: 4,
    name: "Emma Wilson",
    gender: "Female",
    skill: "Volleyball",
    availability: "Afternoons"
  }
];

const MatchFeed = () => {
  const [profiles, setProfiles] = useState(sampleProfiles);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      console.log('Liked:', profiles[currentIndex].name);
    } else {
      console.log('Passed:', profiles[currentIndex].name);
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  const currentProfile = profiles[currentIndex];

  if (currentIndex >= profiles.length) {
    return (
      <div className="match-feed">
        <div className="no-more-cards">
          <h2>No more profiles!</h2>
          <p>Check back later for more matches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="match-feed">
      <div className="card-stack">
        {profiles.slice(currentIndex, currentIndex + 2).map((profile, index) => (
          <SwipeableCard
            key={profile.id}
            profile={profile}
            onSwipe={index === 0 ? handleSwipe : null}
            isTop={index === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchFeed;
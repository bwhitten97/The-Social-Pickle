import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import './PostGameForm.css';

const PostGameForm = () => {
  const { addGame } = useGameContext();
  const [formData, setFormData] = useState({
    location: '',
    date: '',
    time: '',
    skillLevel: 'intermediate',
    openSpots: 4,
    description: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addGame(formData);
    
    // Reset form
    setFormData({
      location: '',
      date: '',
      time: '',
      skillLevel: 'intermediate',
      openSpots: 4,
      description: ''
    });
    
    alert('Game posted successfully!');
  };

  return (
    <div className="post-game-form">
      <div className="form-header">
        <h1>Post a Game</h1>
        <p>Host a pickleball game and find players to join</p>
      </div>

      <form onSubmit={handleSubmit} className="game-form">
        <div className="form-group">
          <label htmlFor="location">Location *</label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Central Park Courts"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">Time *</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="skillLevel">Skill Level</label>
            <select
              id="skillLevel"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleInputChange}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="mixed">Mixed Levels</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="openSpots">Open Spots</label>
            <select
              id="openSpots"
              name="openSpots"
              value={formData.openSpots}
              onChange={handleInputChange}
            >
              <option value={1}>1 Player</option>
              <option value={2}>2 Players</option>
              <option value={3}>3 Players</option>
              <option value={4}>4 Players</option>
              <option value={5}>5+ Players</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description (Optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Add any additional details about the game..."
            rows={3}
          />
        </div>

        <button type="submit" className="submit-btn">
          Post Game
        </button>
      </form>
    </div>
  );
};

export default PostGameForm;
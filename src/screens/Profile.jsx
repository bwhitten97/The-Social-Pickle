import { useState } from 'react';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    skillLevel: 'intermediate',
    location: 'San Francisco, CA',
    bio: 'Passionate pickleball player who loves meeting new people and improving my game. Available most weekends!',
    preferredTime: 'evenings',
    playingExperience: '2 years'
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to a backend
    alert('Profile updated successfully!');
  };

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'beginner':
        return '#10b981';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="profile-screen">
      <div className="screen-header">
        <h1>My Profile</h1>
        <p>Manage your pickleball profile and preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="profile-info">
              <h2>{profile.name}</h2>
              <span 
                className="skill-badge"
                style={{ backgroundColor: getSkillColor(profile.skillLevel) }}
              >
                {profile.skillLevel}
              </span>
            </div>
            <button 
              className="edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className="profile-form">
            <div className="form-section">
              <h3>Contact Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="form-value">{profile.name}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="form-value">{profile.email}</div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="form-value">{profile.phone}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="form-value">{profile.location}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Pickleball Preferences</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Skill Level</label>
                  {isEditing ? (
                    <select
                      name="skillLevel"
                      value={profile.skillLevel}
                      onChange={handleInputChange}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <div className="form-value">{profile.skillLevel}</div>
                  )}
                </div>
                <div className="form-group">
                  <label>Preferred Time</label>
                  {isEditing ? (
                    <select
                      name="preferredTime"
                      value={profile.preferredTime}
                      onChange={handleInputChange}
                    >
                      <option value="mornings">Mornings</option>
                      <option value="afternoons">Afternoons</option>
                      <option value="evenings">Evenings</option>
                      <option value="weekends">Weekends</option>
                    </select>
                  ) : (
                    <div className="form-value">{profile.preferredTime}</div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Playing Experience</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="playingExperience"
                    value={profile.playingExperience}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 years, 6 months"
                  />
                ) : (
                  <div className="form-value">{profile.playingExperience}</div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h3>About Me</h3>
              <div className="form-group">
                <label>Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Tell other players about yourself..."
                  />
                ) : (
                  <div className="form-value">{profile.bio}</div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions">
                <button className="save-btn" onClick={handleSave}>
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
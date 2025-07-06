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
    <div className="profile-modern">
      {/* Page Header - Match Games/Chat styling */}
      <div className="profile-header-modern">
        <div className="profile-title-section">
          <h1 className="profile-title">
            <svg className="profile-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            My Profile
          </h1>
          <span className="profile-summary">Manage your pickleball profile and preferences</span>
        </div>
      </div>

      <div className="profile-content-modern">
        <div className="profile-card-modern">
          <div className="profile-header-card">
            <div className="profile-avatar-modern">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="profile-info-modern">
              <h2 className="profile-name">{profile.name}</h2>
              <span 
                className="skill-badge-modern"
                style={{ backgroundColor: getSkillColor(profile.skillLevel) }}
              >
                {profile.skillLevel}
              </span>
            </div>
            <button 
              className="edit-btn-modern"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </>
              )}
            </button>
          </div>

          <div className="profile-form-modern">
            <div className="form-section-modern">
              <h3 className="section-title">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Contact Information
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleInputChange}
                      className="field-input"
                    />
                  ) : (
                    <div className="field-value">{profile.name}</div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleInputChange}
                      className="field-input"
                    />
                  ) : (
                    <div className="field-value">{profile.email}</div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleInputChange}
                      className="field-input"
                    />
                  ) : (
                    <div className="field-value">{profile.phone}</div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="location"
                      value={profile.location}
                      onChange={handleInputChange}
                      className="field-input"
                    />
                  ) : (
                    <div className="field-value">{profile.location}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section-modern">
              <h3 className="section-title">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Pickleball Preferences
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">Skill Level</label>
                  {isEditing ? (
                    <select
                      name="skillLevel"
                      value={profile.skillLevel}
                      onChange={handleInputChange}
                      className="field-select"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  ) : (
                    <div className="field-value">{profile.skillLevel}</div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label">Preferred Time</label>
                  {isEditing ? (
                    <select
                      name="preferredTime"
                      value={profile.preferredTime}
                      onChange={handleInputChange}
                      className="field-select"
                    >
                      <option value="mornings">Mornings</option>
                      <option value="afternoons">Afternoons</option>
                      <option value="evenings">Evenings</option>
                      <option value="weekends">Weekends</option>
                    </select>
                  ) : (
                    <div className="field-value">{profile.preferredTime}</div>
                  )}
                </div>
                <div className="form-field form-field-full">
                  <label className="field-label">Playing Experience</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="playingExperience"
                      value={profile.playingExperience}
                      onChange={handleInputChange}
                      placeholder="e.g., 2 years, 6 months"
                      className="field-input"
                    />
                  ) : (
                    <div className="field-value">{profile.playingExperience}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section-modern">
              <h3 className="section-title">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10,9 9,9 8,9"/>
                </svg>
                About Me
              </h3>
              <div className="form-field-full">
                <label className="field-label">Bio</label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Tell other players about yourself..."
                    className="field-textarea"
                  />
                ) : (
                  <div className="field-value field-value-bio">{profile.bio}</div>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="form-actions-modern">
                <button className="save-btn-modern" onClick={handleSave}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17,21 17,13 7,13 7,21"/>
                    <polyline points="7,3 7,8 15,8"/>
                  </svg>
                  Save Profile
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
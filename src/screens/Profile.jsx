import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ImageUpload from '../components/ImageUpload';
import Notification from '../components/Notification';
import './Profile.css';

const AvailabilitySelector = ({ selected, onChange }) => {
  const availabilityOptions = [
    { value: 'flexible', label: 'Flexible' },
    { value: 'mornings', label: 'Mornings' },
    { value: 'afternoons', label: 'Afternoons' },
    { value: 'weeknights', label: 'Weeknights' },
    { value: 'weekends', label: 'Weekends' },
    { value: 'holidays', label: 'Holidays' }
  ];

  const toggleOption = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="availability-selector">
      {availabilityOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`availability-option ${selected.includes(option.value) ? 'selected' : ''}`}
          onClick={() => toggleOption(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [notification, setNotification] = useState(null);
  
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    skillLevel: user?.skillLevel || '',
    duprRating: user?.duprRating || 'unrated',
    gender: user?.gender || '',
    age: user?.age || '',
    bio: user?.bio || '',
    availability: user?.availability || [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Fetch profile picture directly from Firestore
  useEffect(() => {
    const fetchProfilePicture = async () => {
      if (user?.id) {
        try {
          const userDocRef = doc(db, 'users', user.id);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.profilePicture) {
              setProfileImagePreview(userData.profilePicture);
              console.log('Profile: Loaded profile picture from Firestore:', userData.profilePicture);
            }
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
    };

    fetchProfilePicture();
  }, [user?.id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (availability) => {
    setProfile(prev => ({
      ...prev,
      availability
    }));
  };

  const handleImageChange = (file, previewUrl) => {
    setProfileImage(file);
    setProfileImagePreview(previewUrl);
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would save to a backend
    setNotification({
      message: "Profile updated",
      name: "successfully",
      emoji: "✅"
    });
  };

  const handleLogout = async () => {
    try {
      const result = await signOut();
      if (result.success) {
        setNotification({
          message: "Signed out",
          name: "successfully",
          emoji: "👋"
        });
        
        // Navigate to landing page after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      }
    } catch (error) {
      setNotification({
        message: "Sign out failed",
        name: "Please try again",
        emoji: "❌"
      });
    }
  };

  const getSkillColor = (skill) => {
    switch (skill) {
      case 'beginner':
        return '#3E5D45';
      case 'intermediate':
        return '#F5EEDC';
      case 'advanced':
        return '#2C3E50';
      default:
        return '#6B7280';
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
        
        <button 
          className="logout-btn-modern"
          onClick={handleLogout}
          title="Sign Out"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>

      <div className="profile-content-modern">
        <div className="profile-card-modern">
          <div className="profile-header-card">
            <div className="profile-avatar-modern">
              {profileImagePreview ? (
                <img src={profileImagePreview} alt={profile.name} className="profile-avatar-image" />
              ) : (
                <span className="profile-avatar-initials">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <div className="profile-info-modern">
              <h2 className="profile-name">{profile.name}</h2>
              <span 
                className="skill-badge-modern"
                style={{ 
                  backgroundColor: getSkillColor(profile.skillLevel),
                  color: profile.skillLevel === 'intermediate' ? '#3E5D45' : 'white'
                }}
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
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21,15 16,10 5,21"/>
                </svg>
                Profile Picture
              </h3>
              {isEditing ? (
                <ImageUpload
                  currentImage={profileImagePreview}
                  onImageChange={handleImageChange}
                  className="profile-image-upload"
                />
              ) : (
                <div className="profile-image-display">
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt={profile.name} className="profile-image-preview" />
                  ) : (
                    <div className="no-image-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21,15 16,10 5,21"/>
                      </svg>
                      <p>No profile picture uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </div>

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
              </div>
            </div>

            <div className="form-section-modern">
              <h3 className="section-title">
                <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Personal Information
              </h3>
              <div className="form-grid">
                <div className="form-field">
                  <label className="field-label">Age</label>
                  {isEditing ? (
                    <input
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleInputChange}
                      className="field-input"
                      min="18"
                      max="100"
                    />
                  ) : (
                    <div className="field-value">{profile.age}</div>
                  )}
                </div>
                <div className="form-field">
                  <label className="field-label">Gender</label>
                  {isEditing ? (
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleInputChange}
                      className="field-select"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  ) : (
                    <div className="field-value">{profile.gender}</div>
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
                  <label className="field-label">DUPR Rating</label>
                  {isEditing ? (
                    <select
                      name="duprRating"
                      value={profile.duprRating}
                      onChange={handleInputChange}
                      className="field-select"
                    >
                      <option value="2.0">2.0</option>
                      <option value="2.5">2.5</option>
                      <option value="3.0">3.0</option>
                      <option value="3.5">3.5</option>
                      <option value="4.0">4.0</option>
                      <option value="4.5">4.5</option>
                      <option value="5.0">5.0</option>
                      <option value="5.5">5.5</option>
                      <option value="6.0">6.0</option>
                      <option value="unrated">Unrated</option>
                    </select>
                  ) : (
                    <div className="field-value">{profile.duprRating}</div>
                  )}
                </div>
                <div className="form-field form-field-full">
                  <label className="field-label">Availability</label>
                  {isEditing ? (
                    <AvailabilitySelector
                      selected={profile.availability}
                      onChange={handleAvailabilityChange}
                    />
                  ) : (
                    <div className="field-value">{profile.availability.join(', ')}</div>
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

      {/* Native Notification */}
      {notification && (
        <Notification
          message={notification.message}
          name={notification.name}
          emoji={notification.emoji}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default Profile;
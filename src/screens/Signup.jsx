import { useState } from 'react';
import LocationSelector from '../components/LocationSelector';
import ImageUpload from '../components/ImageUpload';
import './Signup.css';

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

const Signup = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    age: '',
    gender: 'prefer-not-to-say',
    location: '',
    
    // Pickleball Information
    skillLevel: 'beginner',
    duprRating: 'unrated',
    playStyle: 'casual',
    playingExperience: '',
    availability: [],
    
    // Profile
    bio: ''
  });

  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvailabilityChange = (availability) => {
    setFormData(prev => ({
      ...prev,
      availability
    }));
  };

  const handleImageChange = (file, previewUrl) => {
    setProfileImage(file);
    setProfileImagePreview(previewUrl);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
      if (!formData.age) newErrors.age = 'Age is required';
      if (!formData.location.trim()) newErrors.location = 'Location is required';
    } else if (step === 2) {
      if (!formData.playingExperience.trim()) {
        newErrors.playingExperience = 'Playing experience is required';
      }
      if (formData.availability.length === 0) {
        newErrors.availability = 'Please select at least one availability option';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep(currentStep)) {
      // TODO: Implement actual signup logic
      const completeSignupData = {
        ...formData,
        profileImage,
        profileImagePreview
      };
      console.log('Signup data:', completeSignupData);
      alert('Account created successfully!');
    }
  };

  const renderStep1 = () => (
    <div className="signup-step">
      <h2 className="step-title">Create Your Account</h2>
      <p className="step-description">Let's start with your basic information</p>
      
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter your full name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`form-input ${errors.email ? 'error' : ''}`}
            placeholder="Enter your email"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`form-input ${errors.password ? 'error' : ''}`}
            placeholder="Create a password"
          />
          {errors.password && <span className="error-message">{errors.password}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`form-input ${errors.phone ? 'error' : ''}`}
            placeholder="Enter your phone number"
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Age *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            className={`form-input ${errors.age ? 'error' : ''}`}
            placeholder="Enter your age"
            min="18"
            max="100"
          />
          {errors.age && <span className="error-message">{errors.age}</span>}
        </div>

        <div className="form-field">
          <label className="form-label">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>

        <div className="form-field form-field-full">
          <label className="form-label">Location *</label>
          <LocationSelector
            value={formData.location}
            onChange={(value) => handleInputChange({ target: { name: 'location', value } })}
            className={errors.location ? 'error' : ''}
            placeholder="Enter your city, state"
          />
          {errors.location && <span className="error-message">{errors.location}</span>}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="signup-step">
      <h2 className="step-title">Pickleball Information</h2>
      <p className="step-description">Tell us about your pickleball experience</p>
      
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Skill Level</label>
          <select
            name="skillLevel"
            value={formData.skillLevel}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">DUPR Rating</label>
          <select
            name="duprRating"
            value={formData.duprRating}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="unrated">Unrated</option>
            <option value="2.0">2.0</option>
            <option value="2.5">2.5</option>
            <option value="3.0">3.0</option>
            <option value="3.5">3.5</option>
            <option value="4.0">4.0</option>
            <option value="4.5">4.5</option>
            <option value="5.0">5.0</option>
            <option value="5.5">5.5</option>
            <option value="6.0">6.0</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Play Style</label>
          <select
            name="playStyle"
            value={formData.playStyle}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="competitive">Competitive</option>
            <option value="casual">Casual</option>
            <option value="both">Both</option>
          </select>
        </div>

        <div className="form-field">
          <label className="form-label">Playing Experience *</label>
          <input
            type="text"
            name="playingExperience"
            value={formData.playingExperience}
            onChange={handleInputChange}
            className={`form-input ${errors.playingExperience ? 'error' : ''}`}
            placeholder="e.g., 2 years, 6 months, just started"
          />
          {errors.playingExperience && <span className="error-message">{errors.playingExperience}</span>}
        </div>

        <div className="form-field form-field-full">
          <label className="form-label">Availability *</label>
          <AvailabilitySelector
            selected={formData.availability}
            onChange={handleAvailabilityChange}
          />
          {errors.availability && <span className="error-message">{errors.availability}</span>}
        </div>

        <div className="form-field form-field-full">
          <label className="form-label">Profile Picture</label>
          <ImageUpload
            currentImage={profileImagePreview}
            onImageChange={handleImageChange}
            className="signup-image-upload"
          />
        </div>

        <div className="form-field form-field-full">
          <label className="form-label">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="form-textarea"
            placeholder="Tell other players about yourself and your pickleball interests..."
            rows={4}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="signup-container">
      <div className="signup-header">
        <h1 className="signup-title">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="signup-icon">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          Join The Social Pickle
        </h1>
        <div className="progress-bar">
          <div className="progress-steps">
            <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Basic Info</div>
            </div>
            <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Pickleball</div>
            </div>
          </div>
          <div className="progress-line">
            <div className="progress-fill" style={{ width: `${(currentStep / 2) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="signup-content">
        <div className="signup-card">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            
            <div className="form-actions">
              {currentStep > 1 && (
                <button type="button" onClick={prevStep} className="btn-secondary">
                  Back
                </button>
              )}
              {currentStep < 2 ? (
                <button type="button" onClick={nextStep} className="btn-primary">
                  Next
                </button>
              ) : (
                <button type="submit" className="btn-primary">
                  Create Account
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
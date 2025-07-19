import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, signUp, updateUserProfile, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    skillLevel: '',
    duprRating: '',
    availability: [],
    profilePicture: null,
    profilePictureUrl: '',
    bio: '',
    email: '', // For email signups
    password: '' // For email signups
  });

  const steps = [
    // Email/Password step (only for email signups)
    {
      id: 'auth',
      title: "Create Your Account",
      subtitle: "Let's get you set up with a secure account",
      field: 'email',
      type: 'auth'
    },
    {
      id: 'name',
      title: "What's your name?",
      subtitle: "This is how other players will see you",
      field: 'name',
      type: 'text',
      placeholder: 'Enter your full name'
    },
    {
      id: 'age',
      title: "How old are you?",
      subtitle: "This helps us match you with players in similar age groups",
      field: 'age',
      type: 'number',
      placeholder: 'Enter your age'
    },
    {
      id: 'gender',
      title: "What's your gender?",
      subtitle: "This information helps personalize your experience",
      field: 'gender',
      type: 'select',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'non-binary', label: 'Non-binary' },
        { value: 'prefer-not-to-say', label: 'Prefer not to say' }
      ]
    },
    {
      id: 'skill',
      title: "What's your skill level?",
      subtitle: "Don't worry, you can always change this later",
      field: 'skillLevel',
      type: 'skill-select'
    },
    {
      id: 'availability',
      title: "When do you like to play?",
      subtitle: "Select all times that work for you",
      field: 'availability',
      type: 'multi-select',
      options: [
        { value: 'mornings', label: 'Mornings', icon: '🌅' },
        { value: 'afternoons', label: 'Afternoons', icon: '☀️' },
        { value: 'evenings', label: 'Evenings', icon: '🌅' },
        { value: 'weekdays', label: 'Weekdays', icon: '📅' },
        { value: 'weekends', label: 'Weekends', icon: '🎉' },
        { value: 'flexible', label: 'Flexible', icon: '⚡' }
      ]
    },
    {
      id: 'photo',
      title: "Complete your profile",
      subtitle: "Add a photo and tell others about yourself",
      field: 'profilePicture',
      type: 'photo-and-bio'
    }
  ];

  // Skip auth step if coming from social login
  const isEmailSignup = !window.location.search.includes('social=true');
  const activeSteps = isEmailSignup ? steps : steps.slice(1);

  const currentStepData = activeSteps[currentStep];

  // If user is authenticated and has completed profile, redirect to discover
  if (isAuthenticated && user?.profileComplete) {
    navigate('/discover');
    return null;
  }

  const updateUserData = (field, value) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = async () => {
    // Validate current step
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === activeSteps.length - 1) {
      // Final step - submit data
      await handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateCurrentStep = () => {
    const step = currentStepData;
    const value = userData[step.field];

    switch (step.type) {
      case 'auth':
        if (!userData.email || !userData.password) {
          setNotification({
            message: "Please fill in all fields",
            name: "",
            emoji: "⚠️"
          });
          return false;
        }
        if (userData.password.length < 6) {
          setNotification({
            message: "Password must be at least 6 characters",
            name: "",
            emoji: "⚠️"
          });
          return false;
        }
        return true;
      case 'text':
      case 'number':
      case 'select':
      case 'skill-select':
        if (!value || value === '') {
          setNotification({
            message: "This field is required",
            name: "",
            emoji: "⚠️"
          });
          return false;
        }
        return true;
      case 'multi-select':
        if (!value || value.length === 0) {
          setNotification({
            message: "Please select at least one option",
            name: "",
            emoji: "⚠️"
          });
          return false;
        }
        return true;
      case 'photo':
        // Photo is optional
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      let result;
      
      if (isEmailSignup) {
        // Create new account with email/password
        result = await signUp(userData.email, userData.password, {
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          skillLevel: userData.skillLevel,
          duprRating: userData.duprRating,
          availability: userData.availability,
          profilePicture: userData.profilePicture, // Pass the actual file
          profilePictureUrl: userData.profilePictureUrl,
          bio: userData.bio
        });
      } else {
        // Update existing social auth user with profile data
        result = await updateUserProfile({
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          skillLevel: userData.skillLevel,
          duprRating: userData.duprRating,
          availability: userData.availability,
          profilePicture: userData.profilePicture, // Pass the actual file
          profilePictureUrl: userData.profilePictureUrl,
          bio: userData.bio
        });
      }
      
      if (result.success) {
        setNotification({
          message: "Welcome to The Social Pickle",
          name: userData.name,
          emoji: "🎉"
        });
        
        // Force navigation with state that indicates profile is complete
        setTimeout(() => {
          // Set a temporary flag to bypass ProtectedRoute checks
          sessionStorage.setItem('profileJustCompleted', 'true');
          navigate('/welcome', { 
            replace: true,
            state: { profileJustCompleted: true }
          });
        }, 2000);
      } else {
        setNotification({
          message: "Account setup failed",
          name: result.error || "Please try again",
          emoji: "❌"
        });
      }
      
    } catch (error) {
      setNotification({
        message: "Account setup failed",
        name: "Please try again",
        emoji: "❌"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setNotification({
          message: "Please select an image file",
          name: "",
          emoji: "⚠️"
        });
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setNotification({
          message: "Image must be under 5MB",
          name: "",
          emoji: "⚠️"
        });
        return;
      }
      
      updateUserData('profilePicture', file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        updateUserData('profilePictureUrl', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStepContent = () => {
    const step = currentStepData;

    switch (step.type) {
      case 'auth':
        return (
          <div className="step-content">
            <div className="form-group">
              <input
                type="email"
                placeholder="Email address"
                value={userData.email}
                onChange={(e) => updateUserData('email', e.target.value)}
                className="onboarding-input"
                autoFocus
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                placeholder="Password (minimum 6 characters)"
                value={userData.password}
                onChange={(e) => updateUserData('password', e.target.value)}
                className="onboarding-input"
                minLength="6"
              />
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="step-content">
            <input
              type="text"
              placeholder={step.placeholder}
              value={userData[step.field]}
              onChange={(e) => updateUserData(step.field, e.target.value)}
              className="onboarding-input large"
              autoFocus
            />
          </div>
        );

      case 'number':
        return (
          <div className="step-content">
            <input
              type="number"
              placeholder={step.placeholder}
              value={userData[step.field]}
              onChange={(e) => updateUserData(step.field, e.target.value)}
              className="onboarding-input large"
              min="13"
              max="100"
              autoFocus
            />
          </div>
        );

      case 'select':
        return (
          <div className="step-content">
            <div className="option-grid">
              {step.options.map((option) => (
                <button
                  key={option.value}
                  className={`option-btn ${userData[step.field] === option.value ? 'selected' : ''}`}
                  onClick={() => updateUserData(step.field, option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'skill-select':
        const skillOptions = [
          { 
            value: 'beginner', 
            label: 'Beginner', 
            description: 'DUPR 1.0 - 2.5',
            details: 'New to pickleball or still learning basics'
          },
          { 
            value: 'intermediate', 
            label: 'Intermediate', 
            description: 'DUPR 2.5 - 4.0',
            details: 'Comfortable with rules and basic strategy'
          },
          { 
            value: 'advanced', 
            label: 'Advanced', 
            description: 'DUPR 4.0+',
            details: 'Strong player with advanced techniques'
          }
        ];

        return (
          <div className="step-content">
            {/* DUPR Rating Input */}
            <div className="dupr-input-section">
              <label className="dupr-label">DUPR Rating (Optional)</label>
              <input
                type="number"
                placeholder="Enter your DUPR rating (e.g., 3.5)"
                value={userData.duprRating}
                onChange={(e) => {
                  const value = e.target.value;
                  updateUserData('duprRating', value);
                  
                  // Auto-select skill level based on DUPR
                  if (value) {
                    const rating = parseFloat(value);
                    if (rating >= 1.0 && rating < 2.5) {
                      updateUserData('skillLevel', 'beginner');
                    } else if (rating >= 2.5 && rating < 4.0) {
                      updateUserData('skillLevel', 'intermediate');
                    } else if (rating >= 4.0) {
                      updateUserData('skillLevel', 'advanced');
                    }
                  }
                }}
                className="onboarding-input dupr-input"
                min="1.0"
                max="7.0"
                step="0.1"
              />
              <p className="dupr-helper">If you don't have a DUPR rating, select your skill level below:</p>
            </div>

            <div className="skill-options">
              {skillOptions.map((option) => (
                <button
                  key={option.value}
                  className={`skill-option ${userData.skillLevel === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    updateUserData('skillLevel', option.value);
                    // Don't auto-populate DUPR rating - let user enter it manually if they have one
                  }}
                >
                  <div className="skill-header">
                    <span className="skill-label">{option.label}</span>
                    <span className="skill-description">{option.description}</span>
                  </div>
                  <div className="skill-details">{option.details}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'multi-select':
        return (
          <div className="step-content">
            <div className="option-grid multi">
              {step.options.map((option) => (
                <button
                  key={option.value}
                  className={`option-btn multi ${userData.availability?.includes(option.value) ? 'selected' : ''}`}
                  onClick={() => {
                    const current = userData.availability || [];
                    const newAvailability = current.includes(option.value)
                      ? current.filter(item => item !== option.value)
                      : [...current, option.value];
                    updateUserData('availability', newAvailability);
                  }}
                >
                  <span className="option-icon">{option.icon}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 'photo':
      case 'photo-and-bio':
        return (
          <div className="step-content photo-step">
            <div className="photo-upload-area">
              {userData.profilePictureUrl ? (
                <div className="photo-preview">
                  <img 
                    src={userData.profilePictureUrl} 
                    alt="Profile preview" 
                    className="preview-image"
                  />
                  <button 
                    className="change-photo-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <>
                  <div 
                    className="photo-upload-placeholder"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      <div>Add a photo</div>
                    </div>
                  </div>
                  <div className="upload-subtext-below">Tap to select from your device</div>
                </>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="file-input-hidden"
              />
            </div>
            
            <div className="photo-skip-note">
              You can always add a photo later in your profile
            </div>

            {/* Bio input field */}
            {step.type === 'photo-and-bio' && (
              <div className="bio-input-section">
                <label className="bio-label">Tell others about yourself (Optional)</label>
                <textarea
                  placeholder="Feel free to share more detail about who you are as a player, where you like to play, or what you are trying to accomplish on The Social Pickle..."
                  value={userData.bio}
                  onChange={(e) => updateUserData('bio', e.target.value)}
                  className="bio-textarea"
                  rows="4"
                  maxLength="200"
                />
                <div className="bio-counter">
                  {userData.bio.length}/200 characters
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        {/* Progress Header */}
        <div className="onboarding-header">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / activeSteps.length) * 100}%` }}
            />
          </div>
          <div className="step-counter">
            {currentStep + 1} of {activeSteps.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="step-container">
          <div className="step-header">
            <h1 className="step-title">{currentStepData.title}</h1>
            <p className="step-subtitle">{currentStepData.subtitle}</p>
          </div>

          {renderStepContent()}

          {/* Navigation */}
          <div className="step-navigation">
            {currentStep > 0 && (
              <button 
                className="nav-btn back-btn"
                onClick={handleBack}
                disabled={isLoading}
              >
                ← Back
              </button>
            )}
            
            <button 
              className="nav-btn next-btn"
              onClick={handleNext}
              disabled={isLoading}
            >
              {isLoading ? (
                'Creating Account...'
              ) : currentStep === activeSteps.length - 1 ? (
                'Complete Setup'
              ) : (
                'Continue →'
              )}
            </button>
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

export default Onboarding;
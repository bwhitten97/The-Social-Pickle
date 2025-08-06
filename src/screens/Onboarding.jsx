import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import PhotoCropModal from '../components/PhotoCropModal';
import { config, validateZipCode } from '../config/app';
import './Onboarding.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, signUp, updateUserProfile, isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState({
    name: '',
    age: '',
    gender: '',
    skillLevel: '',
    duprRating: '',
    availability: [],
    city: config.AVAILABLE_CITIES[0] || 'Chicago', // Default city
    profilePicture: null,
    profilePictureUrl: '',
    bio: '',
    email: '', // For email signups
    password: '', // For email signups
    location: config.DEFAULT_LOCATION // Default location
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
      id: 'city',
      title: "What city do you play in?",
      subtitle: "Connect with players in your area",
      field: 'city',
      type: 'select',
      options: config.AVAILABLE_CITIES.map(city => ({
        value: city,
        label: city
      }))
    },
    ...(config.MULTI_CITY_ENABLED ? [{
      id: 'location',
      title: "Where do you play?",
      subtitle: "This helps us find games and players near you",
      field: 'location',
      type: 'location',
      placeholder: 'Enter your ZIP code'
    }] : []),
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
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          setNotification({
            message: "Please enter a valid email address",
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
      case 'number':
        if (!value || value === '') {
          setNotification({
            message: "This field is required",
            name: "",
            emoji: "⚠️"
          });
          return false;
        }
        // Age validation for age field
        if (step.field === 'age') {
          const age = parseInt(value);
          if (age < 13 || age > 100) {
            setNotification({
              message: "Please enter an age between 13 and 100",
              name: "",
              emoji: "⚠️"
            });
            return false;
          }
        }
        return true;
      case 'location':
        if (!userData.location?.zip) {
          setNotification({
            message: "Please enter your ZIP code",
            name: "",
            emoji: "⚠️"
          });
          return false;
        }
        if (!validateZipCode(userData.location.zip)) {
          setNotification({
            message: "Please enter a valid 5-digit ZIP code",
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
      console.log('Onboarding: Submitting with userData:', {
        name: userData.name,
        hasProfilePicture: !!userData.profilePicture,
        profilePictureType: userData.profilePicture?.type,
        profilePictureSize: userData.profilePicture?.size
      });
      
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

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // More aggressive sizing for large files
        const originalSize = file.size;
        let maxSize = 800; // Start larger for better quality
        let quality = 0.9; // Start with high quality
        
        // Adjust compression based on original file size
        if (originalSize > 10 * 1024 * 1024) { // > 10MB
          maxSize = 600;
          quality = 0.7;
        } else if (originalSize > 5 * 1024 * 1024) { // > 5MB
          maxSize = 700;
          quality = 0.8;
        }
        
        let { width, height } = img;
        
        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw with high quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try compression with adaptive quality
        const tryCompress = (currentQuality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              const file = new File([blob], `profile-${Date.now()}.jpg`, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              
              // If still too large and quality can be reduced, try again
              const maxCompressedSize = 1 * 1024 * 1024; // 1MB
              if (file.size > maxCompressedSize && currentQuality > 0.3) {
                tryCompress(currentQuality - 0.1);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            currentQuality
          );
        };
        
        tryCompress(quality);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Onboarding: File selected for cropping:', {
        name: file.name,
        size: file.size,
        type: file.type
      });
      
      // Basic validation
      if (!file.type.startsWith('image/')) {
        setNotification({
          message: "Please select an image file",
          name: "",
          emoji: "⚠️"
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        setNotification({
          message: "File is too large to process (max 50MB)",
          name: "",
          emoji: "⚠️"
        });
        return;
      }
      
      // Store the file and open crop modal
      setSelectedFile(file);
      setShowCropModal(true);
    }
  };

  const handleCropComplete = async (cropResult) => {
    try {
      console.log('Onboarding: Crop completed:', cropResult);
      
      // Store the cropped image blob as the profile picture
      updateUserData('profilePicture', cropResult.blob);
      updateUserData('profilePictureUrl', cropResult.previewUrl);
      
      console.log('Onboarding: Cropped image stored in userData');
      
      // Close modal and reset file input
      setShowCropModal(false);
      setSelectedFile(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Onboarding: Failed to save cropped image:', error);
      setNotification({
        message: "Failed to save cropped image. Please try again.",
        name: "",
        emoji: "⚠️"
      });
    }
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setSelectedFile(null);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      case 'location':
        return (
          <div className="step-content">
            <input
              type="text"
              placeholder={step.placeholder}
              value={userData.location?.zip || ''}
              onChange={(e) => {
                const zip = e.target.value.replace(/\D/g, '').slice(0, 5);
                updateUserData('location', { 
                  ...userData.location,
                  zip: zip
                });
              }}
              className="onboarding-input large"
              maxLength="5"
              autoFocus
            />
            {userData.location?.zip && !validateZipCode(userData.location.zip) && (
              <p className="input-helper error">Please enter a valid 5-digit ZIP code</p>
            )}
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
            description: 'New to pickleball or still learning basics'
          },
          { 
            value: 'intermediate', 
            label: 'Intermediate', 
            description: 'Comfortable with rules and basic strategy'
          },
          { 
            value: 'advanced', 
            label: 'Advanced', 
            description: 'Strong player with advanced techniques'
          }
        ];

        return (
          <div className="step-content">
            {/* DUPR Rating Input */}
            <div className="dupr-input-section">
              <label className="dupr-label">DUPR Rating (Optional)</label>
              <input
                type="number"
                placeholder="e.g. 3.5"
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
                  </div>
                  <div className="skill-details">{option.description}</div>
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

      {/* Photo Crop Modal */}
      {showCropModal && selectedFile && (
        <PhotoCropModal
          isOpen={showCropModal}
          file={selectedFile}
          onCropComplete={handleCropComplete}
          onClose={handleCropCancel}
        />
      )}
    </div>
  );
};

export default Onboarding;
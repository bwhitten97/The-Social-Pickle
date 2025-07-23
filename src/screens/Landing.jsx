import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notification from '../components/Notification';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const handleSocialAuth = async (provider) => {
    setIsLoading(true);
    try {
      let result;
      if (provider === 'Google') {
        result = await signInWithGoogle();
      } else if (provider === 'Apple') {
        result = await signInWithApple();
      }
      
      if (result.success) {
        // Navigation is handled by ProtectedRoute based on profile completion
        if (result.isNewUser) {
          navigate('/onboarding?social=true');
        } else {
          navigate('/discover');
        }
      } else {
        setNotification({
          message: `${provider} sign-in failed`,
          name: result.error || "Please try again",
          emoji: "❌"
        });
      }
    } catch (error) {
      setNotification({
        message: `${provider} sign-in failed`,
        name: "Please try again",
        emoji: "❌"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn(loginData.email, loginData.password);
      
      if (result.success) {
        // Navigate to discover - ProtectedRoute will handle redirection if needed
        navigate('/discover');
      } else {
        setNotification({
          message: "Login failed",
          name: result.error || "Please check your credentials",
          emoji: "❌"
        });
      }
    } catch (error) {
      setNotification({
        message: "Login failed",
        name: "Please try again",
        emoji: "❌"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignup = async () => {
    try {
      // For email signup, go to onboarding flow (no URL params = email signup)
      navigate('/onboarding');
    } catch (error) {
      setNotification({
        message: "Navigation failed",
        name: "Please try again",
        emoji: "❌"
      });
    }
  };

  return (
    <div className="landing-container">
      {/* Logo Section */}
      <div className="landing-logo">
        <img src="/logo-new.png?t=1753292428" alt="Social Pickle" className="logo-image" />
      </div>

      <div className="landing-content">
        {/* Hero Section */}
        <div className="landing-hero">
          <div className="landing-tagline">
            <h2>Pickleball your way.</h2>
            <p className="tagline-subtitle">Find a partner, host or find a game - and become part of The Social Pickle community.</p>
          </div>

          <div className="landing-features">
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <span className="feature-text">Match with players at your skill level</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span className="feature-text">Host or find games nearby</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💬</span>
              <span className="feature-text">Chat & coordinate with your matches</span>
            </div>
          </div>
        </div>

        {/* Auth Section */}
        <div className="landing-auth">
          {!showLogin ? (
            // Sign up options
            <div className="auth-signup">
              <h3>Get Started</h3>
              
              {/* Social Auth Buttons */}
              <div className="social-auth-buttons">
                <button 
                  className="auth-btn social-btn google-btn"
                  onClick={() => handleSocialAuth('Google')}
                  disabled={isLoading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isLoading ? 'Signing up...' : 'Continue with Google'}
                </button>

                <button 
                  className="auth-btn social-btn apple-btn"
                  onClick={() => handleSocialAuth('Apple')}
                  disabled={isLoading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  {isLoading ? 'Signing up...' : 'Continue with Apple'}
                </button>

                <button 
                  className="auth-btn email-btn"
                  onClick={handleEmailSignup}
                  disabled={isLoading}
                >
                  <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Sign up with Email
                </button>
              </div>

              <div className="auth-divider">
                <span>Already have an account?</span>
                <button 
                  className="link-btn"
                  onClick={() => setShowLogin(true)}
                >
                  Sign In
                </button>
              </div>
            </div>
          ) : (
            // Login form
            <div className="auth-login">
              <h3>Welcome Back</h3>
              
              <form onSubmit={handleEmailLogin} className="login-form">
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    className="auth-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                    className="auth-input"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="auth-btn primary-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="auth-divider">
                <span>Or continue with</span>
              </div>

              <div className="social-auth-buttons compact">
                <button 
                  className="auth-btn social-btn google-btn compact"
                  onClick={() => handleSocialAuth('Google')}
                  disabled={isLoading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button 
                  className="auth-btn social-btn apple-btn compact"
                  onClick={() => handleSocialAuth('Apple')}
                  disabled={isLoading}
                >
                  <svg className="social-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>

              <div className="auth-divider">
                <span>Don't have an account?</span>
                <button 
                  className="link-btn"
                  onClick={() => setShowLogin(false)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
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

export default Landing;
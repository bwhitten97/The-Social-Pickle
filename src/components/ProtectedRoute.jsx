import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading while checking auth state
  if (loading) {
    return (
      <div className="auth-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to landing
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Authenticated but profile incomplete - redirect to onboarding
  // Unless they just completed onboarding (indicated by navigation state or sessionStorage)
  const justCompletedProfile = location.state?.profileJustCompleted || sessionStorage.getItem('profileJustCompleted') === 'true';
  
  
  if (user && !user.profileComplete && location.pathname !== '/onboarding' && !justCompletedProfile) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // If user profile is complete, clear the temporary flag
  if (user && user.profileComplete) {
    sessionStorage.removeItem('profileJustCompleted');
  }

  // Profile complete but trying to access onboarding - redirect appropriately
  if (user && user.profileComplete && location.pathname === '/onboarding') {
    // If user hasn't seen welcome page, show it; otherwise go to discover
    if (!user.hasSeenWelcome) {
      return <Navigate to="/welcome" replace />;
    } else {
      return <Navigate to="/discover" replace />;
    }
  }

  // If user has completed profile but hasn't seen welcome, redirect to welcome immediately
  // This check happens before rendering any content to prevent flash
  if (user && user.profileComplete && !user.hasSeenWelcome && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />;
  }

  // All good, render the protected content
  return children;
};

export default ProtectedRoute;
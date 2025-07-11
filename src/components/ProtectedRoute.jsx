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
  if (user && !user.profileComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Profile complete but trying to access onboarding - redirect to discover
  if (user && user.profileComplete && location.pathname === '/onboarding') {
    return <Navigate to="/discover" replace />;
  }

  // All good, render the protected content
  return children;
};

export default ProtectedRoute;
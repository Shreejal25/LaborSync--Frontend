// src/components/PrivateRoute.js

import React from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Check if we're trying to access a manager route
      if (location.pathname.includes('manager')) {
        navigate('/login-manager');
      } else {
        navigate('/login');
      }
    }
  }, [isAuthenticated, loading, navigate, location]);

  if (loading) {
    return <h1>Loading</h1>;
  }
  
  if (isAuthenticated) {
    return children;
  }
  
  return null; // This will prevent briefly showing the protected route before redirecting
};

export default PrivateRoute;
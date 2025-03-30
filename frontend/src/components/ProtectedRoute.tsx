// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { user, token, isLoading } = useAuth(); // Get auth state and initial loading status
  const location = useLocation(); // Get the current location

  // 1. Show a loading indicator while the auth state is being checked initially
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Verifying authentication...</div>
      </div>
    );
  }

  // 2. If not loading and there's no user/token, redirect to login
  if (!user || !token) {
    console.log("ProtectedRoute: No user/token found, redirecting to login.");
    // Redirect them to the /login page, but save the current location they were
    // trying to go to in the state. This allows us to send them back after login.
    return <Navigate to="/login" state={{ from: location }} replace />;
    // 'replace' prevents the protected route from being added to history when redirected
  }

  // 3. If loading is finished and user/token exist, render the child route component
  // <Outlet /> renders the actual component defined for the route being protected
  console.log("ProtectedRoute: User authenticated, rendering route.");
  return <Outlet />;
};

export default ProtectedRoute;
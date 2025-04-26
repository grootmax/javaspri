import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);
  const location = useLocation(); // Optional: To redirect back after login

  // Optional: Handle loading state
  // If you have a loading state in AuthContext while checking localStorage,
  // you might want to display a loading indicator instead of immediately redirecting.
  if (loading) {
    // You can return a loading spinner or null here
    return <div>Loading...</div>; 
  }

  // Check if the user is authenticated (token exists)
  if (!token) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them back after login.
    // The `replace` prop prevents adding the login route to the history stack.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child components (the actual protected page)
  return children;
};

export default ProtectedRoute;

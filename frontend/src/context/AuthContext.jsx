import React, { createContext, useState, useEffect } from 'react';

// 1. Create Context
const AuthContext = createContext();

// 2. Create AuthProvider Component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  // User object might contain id, name, email etc. Adapt based on backend response
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); // Optional: for initial load indication

  // 3. Check localStorage on initial load
  useEffect(() => {
    try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            // Parse stored user string back into an object
            setUser(JSON.parse(storedUser)); 
        }
    } catch (error) {
        // If JSON parsing fails or localStorage is unavailable
        console.error("Error loading auth state from localStorage", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    } finally {
        setLoading(false); // Finished loading state
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  // 4. Login function
  const login = (userData, receivedToken) => {
    setToken(receivedToken);
    setUser(userData);
    // Store token and user object (as string) in localStorage
    localStorage.setItem('token', receivedToken);
    localStorage.setItem('user', JSON.stringify(userData)); 
  };

  // 5. Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 6. Provide values through context
  // Include loading state if you want consumers to be aware of the initial check
  const value = {
    token,
    user,
    loading, // Optional: consumers can use this to show loading spinners etc.
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Optional: Export the context itself if needed directly elsewhere, 
// but usually consuming via useContext(AuthContext) is preferred.
export default AuthContext;

import axios from 'axios';

// Replace with your backend server URL (consider using environment variables)
const API_BASE_URL = 'http://localhost:5000/api/auth'; 

// Instance of Axios with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Registers a new user.
 * @param {object} userData - User data (name, email, password).
 * @returns {Promise<object>} - The response data from the server (likely including token).
 */
const registerUser = async (userData) => {
  try {
    const response = await api.post('/register', userData);
    // Axios automatically throws for non-2xx responses, 
    // so we can assume success if we reach here.
    return response.data; // Contains the token { "token": "..." }
  } catch (error) {
    // Log the error for debugging
    console.error('Registration error:', error.response ? error.response.data : error.message);
    // Re-throw the error or return a specific error structure
    throw error.response ? error.response.data : new Error('Registration failed'); 
  }
};

/**
 * Logs in a user.
 * @param {object} userData - User credentials (email, password).
 * @returns {Promise<object>} - The response data from the server (likely including token).
 */
const loginUser = async (userData) => {
  try {
    const response = await api.post('/login', userData);
    return response.data; // Contains the token { "token": "..." }
  } catch (error) {
    console.error('Login error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

// Optional: Function to set authorization header (useful for protected API calls later)
// export const setAuthToken = (token) => {
//   if (token) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete api.defaults.headers.common['Authorization'];
//   }
// };

export default {
  registerUser,
  loginUser,
  // setAuthToken // Export if you add the token setter function
};

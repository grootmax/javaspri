import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import authService from '../services/authService'; // Correct path

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To display registration errors
  const { login } = useContext(AuthContext); // Get login function from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!name || !email || !password) {
        setError('Please fill in all fields.');
        return;
    }

    try {
      // Call the API service
      const data = await authService.registerUser({ name, email, password });
      
      // Assuming the backend registration returns { token: '...' } 
      // and potentially user details. The AuthContext currently stores token 
      // and a user object separately. We need user details ideally.
      // For now, let's assume the backend returns the user object 
      // along with the token, or we derive it somehow.
      // If backend only returns token, we might need another API call 
      // to fetch user details or adjust context.
      
      // TEMPORARY: Assuming we only get the token back and need to fetch user details later
      // or the backend provides basic user info. Let's pass a minimal user object for now.
      // A better approach is for the backend /register to return user details { id, name, email }
      const minimalUserData = { email }; // Placeholder until backend confirms response
      
      if (data.token) {
          login(minimalUserData, data.token); // Update AuthContext
          navigate('/'); // Redirect to dashboard
      } else {
          // Handle case where token is missing in response
           setError(data.msg || 'Registration successful, but no token received.');
      }

    } catch (err) {
      // Handle errors from the API call (e.g., user already exists)
      // err might be the error object from axios or a custom error from authService
      setError(err.msg || err.message || 'Registration failed. Please try again.');
      console.error("Registration error:", err);
    }
  };

import { Link } from 'react-router-dom'; // Import Link

// ... (rest of the imports and component logic)

function RegisterPage() {
  // ... (state and handlers)

  return (
    <div className="auth-page"> {/* Page container */}
      <h2>Register</h2>
      <form onSubmit={handleSubmit} className="auth-form"> {/* Form container */}
        {error && <p className="error-message">{error}</p>} {/* Error message */}
        <div className="form-group"> {/* Group label and input */}
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="form-input" {/* Input field */}
          />
        </div>
        <div className="form-group"> {/* Group label and input */}
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input" {/* Input field */}
          />
        </div>
        <div className="form-group"> {/* Group label and input */}
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6" // Example: Match backend validation
            className="form-input" {/* Input field */}
          />
        </div>
        <button type="submit" className="button button-primary">Register</button> {/* Button */}
      </form>
      <p className="auth-switch-link"> {/* Link to switch form */}
        Already have an account? <Link to="/login">Login here</Link>
      </p>
    </div>
  );
}

export default RegisterPage;

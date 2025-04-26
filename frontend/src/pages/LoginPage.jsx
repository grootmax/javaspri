import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link
import AuthContext from '../context/AuthContext';
import authService from '../services/authService'; // Correct path

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To display login errors
  const { login } = useContext(AuthContext); // Get login function from context
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!email || !password) {
        setError('Please enter both email and password.');
        return;
    }

    try {
      // Call the API service
      const data = await authService.loginUser({ email, password });

      // Similar to RegisterPage, assume backend returns { token: '...' }
      // and potentially user details. Adjust based on actual backend response.
      // If backend only returns token, might need another call to get user details.
      const minimalUserData = { email }; // Placeholder

      if (data.token) {
          login(minimalUserData, data.token); // Update AuthContext
          navigate('/'); // Redirect to dashboard
      } else {
          // Handle case where token is missing in response
          setError(data.msg || 'Login successful, but no token received.');
      }

    } catch (err) {
      // Handle errors from the API call (e.g., invalid credentials)
      setError(err.msg || err.message || 'Login failed. Please check your credentials.');
      console.error("Login error:", err);
    }
  };

  return (
    <div className="auth-page"> {/* Page container */}
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form"> {/* Form container */}
        {error && <p className="error-message">{error}</p>} {/* Error message */}
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
            className="form-input" {/* Input field */}
          />
        </div>
        <button type="submit" className="button button-primary">Login</button> {/* Button */}
      </form>
      <p className="auth-switch-link"> {/* Link to switch form */}
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
    </div>
  );
}

export default LoginPage;

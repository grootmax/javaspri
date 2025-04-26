import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Optionally redirect to login page after logout
    navigate('/login'); 
  };

  // Removed inline styles

  return (
    <nav className="navbar"> {/* Added className */}
      <div className="navbar-brand"> {/* Added className */}
        <Link to="/" className="navbar-link">NotesApp</Link> {/* Added className */}
      </div>
      <div className="navbar-links"> {/* Added className */}
        {user ? (
          <>
            {/* Display user's name if available, otherwise just welcome */}
            <span className="navbar-welcome"> {/* Added className */}
                Welcome, {user.name || user.email}
            </span> 
            <button onClick={handleLogout} className="navbar-button logout-button">Logout</button> {/* Added classNames */}
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link> {/* Added className */}
            <Link to="/register" className="navbar-link">Register</Link> {/* Added className */}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

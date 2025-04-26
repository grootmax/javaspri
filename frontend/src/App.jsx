import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import Navbar from './components/Navbar'; // Import Navbar
import './App.css'; 

function App() {
  return (
    <div className="App"> 
      <Navbar /> {/* Render Navbar */}
      <div className="container"> {/* Optional: Add a container for page content */}
        <Routes>
          {/* Protected Dashboard Route */}
          <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
          
          {/* Optional: Add a 404 Not Found route */}
          {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
        </Routes>
      </div>
      {/* Optional: Add a Footer component here later */}
    </div>
  );
}

export default App;

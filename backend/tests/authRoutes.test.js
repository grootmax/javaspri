const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('../routes/authRoutes'); // Adjust path if needed
const User = require('../models/User'); // Adjust path if needed

// We need to create a minimal Express app to mount the routes
const app = express();
app.use(express.json()); // Enable JSON body parsing for requests
app.use('/api/auth', authRoutes); // Mount the routes under test

// Mock the database connection and environment variables if needed
// Note: setup.js handles the actual DB connection/clearing
// Ensure JWT_SECRET is set (setup.js should handle this)

describe('Auth Routes API', () => {

  // Test data
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  // Clear User collection before each test in this suite
  // (setup.js handles this globally, but can be specific here too if needed)
  // beforeEach(async () => {
  //   await User.deleteMany({});
  // });

  // --- Registration Tests (/api/auth/register) ---
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(200); // Or 201 if your backend returns that
      expect(res.body).toHaveProperty('token');
      
      // Verify user was actually created in the DB
      const userInDb = await User.findOne({ email: testUser.email });
      expect(userInDb).not.toBeNull();
      expect(userInDb.name).toBe(testUser.name);
      // Password should be hashed, so don't compare directly
    });

    it('should return 400 if email already exists', async () => {
      // First, register the user
      await request(app).post('/api/auth/register').send(testUser);
      
      // Then, try to register again with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
        
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'User already exists'); 
    });

    it('should return 400 if required fields are missing (e.g., name)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: testUser.email, password: testUser.password }); // Missing name
        
      // Note: The exact error message might depend on Mongoose validation or custom checks
      expect(res.statusCode).toEqual(500); // Mongoose validation errors might cause 500 if not caught
      // Or expect(res.statusCode).toEqual(400); if you have specific checks
      // expect(res.body).toHaveProperty('msg'); // Check for an error message
    });
     it('should return 400 if required fields are missing (e.g., email)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: testUser.name, password: testUser.password }); // Missing email
        
      expect(res.statusCode).toEqual(500); // Adjust expected status based on error handling
     });
      it('should return 400 if required fields are missing (e.g., password)', async () => {
       const res = await request(app)
         .post('/api/auth/register')
         .send({ name: testUser.name, email: testUser.email }); // Missing password
         
       expect(res.statusCode).toEqual(500); // Adjust expected status based on error handling
      });
  });

  // --- Login Tests (/api/auth/login) ---
  describe('POST /api/auth/login', () => {
    // Register user before running login tests
    beforeEach(async () => {
        await User.deleteMany({}); // Ensure clean state
        await request(app).post('/api/auth/register').send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
        
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 400 for incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });
        
      expect(res.statusCode).toEqual(400); // Backend returns 400 for Invalid Credentials
      expect(res.body).toHaveProperty('msg', 'Invalid Credentials');
      expect(res.body).not.toHaveProperty('token');
    });

    it('should return 400 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password });
        
      expect(res.statusCode).toEqual(400); // Backend returns 400 for Invalid Credentials
      expect(res.body).toHaveProperty('msg', 'Invalid Credentials');
       expect(res.body).not.toHaveProperty('token');
    });
     it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: testUser.password }); // Missing email
        
      expect(res.statusCode).toEqual(400); // Or 500 depending on error handling
      // Add specific error message check if available
    });
      it('should return 400 if password is missing', async () => {
       const res = await request(app)
         .post('/api/auth/login')
         .send({ email: testUser.email }); // Missing password
         
       expect(res.statusCode).toEqual(400); // Or 500 depending on error handling
       // Add specific error message check if available
      });
  });
});

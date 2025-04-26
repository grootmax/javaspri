const express = require('express');
const bcrypt = require('bcryptjs'); // Corrected import name
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Assuming models/User.js is in the parent directory

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Create new user instance
    user = new User({
      name,
      email,
      password, // Password will be hashed before saving
    });

    // 3. Hash password
    const salt = await bcrypt.genSalt(10); // Generate salt
    user.password = await bcrypt.hash(password, salt); // Hash password

    // 4. Save user to database
    await user.save();

    // 5. Generate JWT
    const payload = {
      user: {
        id: user.id, // Use user.id (Mongoose adds this virtual getter)
      },
    };

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        return res.status(500).send('Server Error (JWT Secret missing)');
    }


    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 }, // Optional: token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // 6. Return token
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    // Explicitly select password since it's excluded by default in the model
    let user = await User.findOne({ email }).select('+password'); 
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Generate JWT
    const payload = {
      user: {
        id: user.id,
      },
    };

     // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
        console.error('FATAL ERROR: JWT_SECRET is not defined.');
        return res.status(500).send('Server Error (JWT Secret missing)');
    }


    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // 4. Return token
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;

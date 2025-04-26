const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust path as necessary

const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with 'Bearer'
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (remove 'Bearer ')
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      // Check if JWT_SECRET is set
      if (!process.env.JWT_SECRET) {
          console.error('FATAL ERROR: JWT_SECRET is not defined.');
          // Don't expose this internal error detail to the client
          return res.status(500).json({ msg: 'Server Configuration Error' }); 
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (ID)
      // Exclude password field from the user object attached to req
      req.user = await User.findById(decoded.user.id).select('-password'); 

      if (!req.user) {
          // Handle case where user associated with token no longer exists
           return res.status(401).json({ msg: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
       if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ msg: 'Not authorized, token failed (invalid)' });
      } else if (error.name === 'TokenExpiredError') {
        res.status(401).json({ msg: 'Not authorized, token failed (expired)' });
      } else {
          res.status(401).json({ msg: 'Not authorized, token failed' });
      }
    }
  }

  // If no token is found in the header
  if (!token) {
    res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

module.exports = { protect };

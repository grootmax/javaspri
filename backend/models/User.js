const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6, // Example: enforce minimum password length
    select: false, // Hide password by default when querying users
  },
  // Optional: Add timestamps for createdAt and updatedAt
  timestamps: true, 
});

module.exports = mongoose.model('User', UserSchema);

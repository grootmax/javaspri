const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    // Link to the user who owns the note
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to the User model
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true, // Remove whitespace
    },
    content: {
      type: String,
      required: [true, 'Please add content'],
    },
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true, 
  }
);

module.exports = mongoose.model('Note', NoteSchema);

const express = require('express');
const Note = require('../models/Note');
const { protect } = require('../middleware/authMiddleware'); // Correct path assuming middleware is in ../middleware

const router = express.Router();

// Apply protect middleware to all routes in this file
router.use(protect);

// @route   GET /api/notes
// @desc    Get all notes for the logged-in user
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Find notes where the user field matches the logged-in user's ID
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 }); // Sort by newest first
    res.json(notes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', async (req, res) => {
  const { title, content } = req.body;

  // Basic validation
  if (!title || !content) {
      return res.status(400).json({ msg: 'Please provide title and content' });
  }

  try {
    const newNote = new Note({
      title,
      content,
      user: req.user.id, // Associate note with the logged-in user
    });

    const note = await newNote.save();
    res.status(201).json(note); // Return 201 Created status
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    // Check if note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if the logged-in user owns the note
    // Convert user ID (ObjectId) to string for comparison
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' }); // 401 Unauthorized
    }

    res.json(note);
  } catch (err) {
    console.error(err.message);
     // Handle potential CastError if ID format is invalid
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Note not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', async (req, res) => {
  const { title, content } = req.body;

   // Basic validation
  if (!title || !content) {
      return res.status(400).json({ msg: 'Please provide title and content for update' });
  }


  try {
    let note = await Note.findById(req.params.id);

    // Check if note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Update the note
    // findByIdAndUpdate returns the document *before* update by default, use { new: true } to return the modified document.
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: { title, content } }, // Use $set to update specified fields
      { new: true } // Return the updated document
    );

    res.json(note);
  } catch (err) {
    console.error(err.message);
     // Handle potential CastError if ID format is invalid
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Note not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    // Check if note exists
    if (!note) {
      return res.status(404).json({ msg: 'Note not found' });
    }

    // Check if user owns the note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Mongoose 5+ findByIdAndDelete() is preferred over remove()
    await Note.findByIdAndDelete(req.params.id); 
    // or await note.remove(); // if using older mongoose or prefer this syntax

    res.json({ msg: 'Note removed', id: req.params.id }); // Indicate success
  } catch (err) {
    console.error(err.message);
     // Handle potential CastError if ID format is invalid
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Note not found (invalid ID format)' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;

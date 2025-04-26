import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import noteService from '../services/noteService'; // Adjust path if needed

function NoteForm({ onNoteCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submits
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (!title.trim() || !content.trim()) {
      setError('Title and content cannot be empty.');
      return;
    }

    if (!token) {
        setError('You must be logged in to create a note.');
        return;
    }

    setIsSubmitting(true); // Disable button

    try {
      const newNoteData = { title, content };
      const createdNote = await noteService.createNote(newNoteData, token);

      // Call the callback function passed from the parent (DashboardPage)
      if (onNoteCreated) {
        onNoteCreated(createdNote); 
      }

      // Clear the form
      setTitle('');
      setContent('');

    } catch (err) {
      setError(err.message || 'Failed to create note. Please try again.');
      console.error("Create Note Error:", err);
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  // Removed inline styles

  return (
    // Use the same form class as auth forms for consistency, or a specific one like 'note-form'
    <form onSubmit={handleSubmit} className="form note-form"> 
      <h3>Create New Note</h3>
      {error && <p className="error-message">{error}</p>} 
      <div className="form-group"> {/* Group label and input */}
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="form-input" {/* Input field */}
        />
      </div>
      <div className="form-group"> {/* Group label and input */}
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={4} // Make textarea a bit larger
          className="form-input" {/* Input field */}
        />
      </div>
      {/* Use general button class and a specific one */}
      <button type="submit" disabled={isSubmitting} className="button button-success"> 
        {isSubmitting ? 'Creating...' : 'Create Note'}
      </button>
    </form>
  );
}

export default NoteForm;

import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import noteService from '../services/noteService'; 
import NoteList from '../components/NoteList'; // Import NoteList
import NoteForm from '../components/NoteForm';   // Import NoteForm
// import NoteEditForm from '../components/NoteEditForm'; // Optional: For inline editing

function DashboardPage() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const [editingNote, setEditingNote] = useState(null); // Optional: State to track which note is being edited
  const { token } = useContext(AuthContext); 

  // Fetch notes on mount and when token changes
  useEffect(() => {
    const fetchNotes = async () => {
      if (!token) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(''); // Clear previous errors
        const fetchedNotes = await noteService.getNotes(token);
        setNotes(fetchedNotes);
      } catch (err) {
        setError(err.message || 'Failed to fetch notes.');
        console.error("Fetch Notes Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [token]);

  // Handler for when a new note is created by NoteForm
  const handleNoteCreated = (newNote) => {
      // Add the new note to the beginning of the list for immediate feedback
      setNotes(prevNotes => [newNote, ...prevNotes]);
      setError(''); // Clear any previous errors
  };

  // Handler for deleting a note (passed down to NoteList -> NoteItem)
  const handleNoteDeleted = async (noteId) => {
    if (!token) {
        setError("Cannot delete note: Not authenticated.");
        return;
    }
    try {
        await noteService.deleteNote(noteId, token);
        // Filter out the deleted note from the state
        setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
        setError(''); // Clear any previous errors
    } catch (err) {
        setError(err.message || 'Failed to delete note.');
        console.error("Delete Note Error:", err);
    }
  };

   // --- Placeholder for Edit Functionality ---
   // Handler to initiate editing (passed down to NoteList -> NoteItem)
   const handleEditInitiated = (note) => {
        // This is where you would typically set state to show an edit form
        // For simplicity, we'll just log it for now.
        console.log("Initiate editing for note:", note);
        // Example: setEditingNote(note); 
        alert("Edit functionality not fully implemented in this step.");
   };
   
   // Handler for when a note is updated by an Edit Form
   // const handleNoteUpdated = (updatedNote) => {
   //     setNotes(prevNotes => 
   //         prevNotes.map(note => note._id === updatedNote._id ? updatedNote : note)
   //     );
   //     setEditingNote(null); // Close the edit form
   //     setError(''); 
   // };
   // --- End Placeholder ---


  return (
    <div className="dashboard-page"> {/* Add className for the page container */}
      <h2>Dashboard</h2>
      
      {/* Render NoteForm and pass the creation handler */}
      <NoteForm onNoteCreated={handleNoteCreated} />

      {/* Display Loading / Error States */}
      {loading && <p>Loading notes...</p>}
      {/* Display Loading / Error States - Keep these outside the main content area */}
      {loading && <p className="loading-message">Loading notes...</p>}
      {error && <p className="error-message">Error: {error}</p>} 
      
      {/* Container for the main content (form + list) */}
      <div className="dashboard-content"> 
          {/* Render NoteForm */}
          <NoteForm onNoteCreated={handleNoteCreated} />

          {/* Container for the notes list */}
          <div className="notes-section"> 
              <h3>Your Notes</h3>
              {/* Render NoteList only when not loading */}
              {!loading && ( 
                <NoteList 
                  notes={notes} 
            onDelete={handleNoteDeleted} 
                  onEdit={handleEditInitiated} 
                />
              )}
          </div>
      </div>

      {/* Optional: Render Edit Form conditionally - keep outside main content flow for now */}
      {/* {editingNote && (
          <NoteEditForm 
              noteToEdit={editingNote} 
              onNoteUpdated={handleNoteUpdated}
              onCancel={() => setEditingNote(null)} 
          />
      )} */}
    </div>
  );
}

export default DashboardPage;

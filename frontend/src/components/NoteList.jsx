import React from 'react';
import NoteItem from './NoteItem'; // Assuming NoteItem is in the same directory

function NoteList({ notes, onDelete, onEdit }) { // Add onDelete and onEdit props later
  if (!notes || notes.length === 0) {
    // User-friendly message when no notes exist
    return <p className="notes-empty-message">No notes found. Why not create one?</p>;
  }

  // Removed inline styles

  return (
    <ul className="notes-list"> {/* Added className */}
      {notes.map(note => (
        <NoteItem 
          key={note._id} 
          note={note} 
          onDelete={onDelete} // Pass down the delete handler
          onEdit={onEdit}   // Pass down the edit handler (placeholder for now)
        />
      ))}
    </ul>
  );
}

export default NoteList;

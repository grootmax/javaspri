import React from 'react';

function NoteItem({ note, onDelete, onEdit }) { // Added onDelete and onEdit props
  if (!note) {
    return null; // Don't render if note is somehow null/undefined
  }

  const handleEdit = () => {
    // Placeholder for edit functionality
    // Will likely call onEdit(note) to signal the parent component
    console.log("Edit note:", note._id); 
    if (onEdit) {
        onEdit(note); // Pass the note to be edited up to the parent
    }
  };

  const handleDelete = () => {
    // Ask for confirmation before deleting
    if (window.confirm(`Are you sure you want to delete the note "${note.title}"?`)) {
      console.log("Delete note:", note._id);
      if (onDelete) {
          onDelete(note._id); // Pass the ID to be deleted up to the parent
      }
    }
  };

  // Removed inline styles

  return (
    <li className="note-item"> {/* Main container */}
      <div className="note-item-content"> {/* Content container */}
        <h3>{note.title}</h3>
        <p>{note.content}</p>
        <div className="note-item-meta"> {/* Metadata container */}
          <small>Created: {new Date(note.createdAt).toLocaleString()}</small>
          <small>Updated: {new Date(note.updatedAt).toLocaleString()}</small>
        </div>
      </div>
      <div className="note-item-actions"> {/* Actions container */}
        <button onClick={handleEdit} className="button button-warning button-small">Edit</button> {/* Edit button */}
        <button onClick={handleDelete} className="button button-danger button-small">Delete</button> {/* Delete button */}
      </div>
    </li>
  );
}

export default NoteItem;

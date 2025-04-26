import axios from 'axios';

// Base URL for the notes API endpoint
const API_BASE_URL = 'http://localhost:5000/api/notes'; 

// Create an Axios instance (optional, but good practice)
// This allows setting base URL and potentially interceptors later
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Helper function to get the Authorization header
const getAuthHeader = (token) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json', // Ensure content type is set for POST/PUT
    }
  };
};

/**
 * Fetches all notes for the authenticated user.
 * @param {string} token - The JWT token.
 * @returns {Promise<Array>} - A promise resolving to an array of notes.
 */
const getNotes = async (token) => {
  if (!token) throw new Error('Authentication token is required.');
  try {
    const response = await api.get('/', getAuthHeader(token));
    return response.data; // Array of notes
  } catch (error) {
    console.error('Get Notes error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch notes');
  }
};

/**
 * Creates a new note.
 * @param {object} noteData - The note data { title, content }.
 * @param {string} token - The JWT token.
 * @returns {Promise<object>} - A promise resolving to the newly created note object.
 */
const createNote = async (noteData, token) => {
   if (!token) throw new Error('Authentication token is required.');
   if (!noteData || !noteData.title || !noteData.content) {
       throw new Error('Title and content are required to create a note.');
   }
  try {
    const response = await api.post('/', noteData, getAuthHeader(token));
    return response.data; // The newly created note
  } catch (error) {
    console.error('Create Note error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to create note');
  }
};

/**
 * Updates an existing note.
 * @param {string} id - The ID of the note to update.
 * @param {object} noteData - The updated note data { title, content }.
 * @param {string} token - The JWT token.
 * @returns {Promise<object>} - A promise resolving to the updated note object.
 */
const updateNote = async (id, noteData, token) => {
  if (!token) throw new Error('Authentication token is required.');
   if (!noteData || !noteData.title || !noteData.content) {
       throw new Error('Title and content are required to update a note.');
   }
   if (!id) throw new Error('Note ID is required for update.');
  try {
    const response = await api.put(`/${id}`, noteData, getAuthHeader(token));
    return response.data; // The updated note
  } catch (error) {
    console.error('Update Note error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to update note');
  }
};

/**
 * Deletes a note.
 * @param {string} id - The ID of the note to delete.
 * @param {string} token - The JWT token.
 * @returns {Promise<object>} - A promise resolving to the success message (or data) from the backend.
 */
const deleteNote = async (id, token) => {
  if (!token) throw new Error('Authentication token is required.');
  if (!id) throw new Error('Note ID is required for deletion.');
  try {
    // DELETE requests typically don't have a request body, but do need headers
    const response = await api.delete(`/${id}`, getAuthHeader(token));
    return response.data; // Usually { msg: 'Note removed', id: '...' }
  } catch (error) {
    console.error('Delete Note error:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to delete note');
  }
};

export default {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
};

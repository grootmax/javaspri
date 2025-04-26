const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const noteRoutes = require('../routes/noteRoutes'); // Adjust path
const authRoutes = require('../routes/authRoutes'); // Need this for user registration/login
const User = require('../models/User');       // Adjust path
const Note = require('../models/Note');       // Adjust path
const { protect } = require('../middleware/authMiddleware'); // Adjust path

// Create a minimal Express app
const app = express();
app.use(express.json());

// Mount routes (need auth for token generation)
app.use('/api/auth', authRoutes); 
// Mount note routes - they internally use the 'protect' middleware
app.use('/api/notes', noteRoutes); 

// Ensure JWT_SECRET is set (setup.js should handle this)

describe('Notes Routes API', () => {
  let token; // To store the auth token for tests
  let userId; // To store the user ID

  // Test user data
  const testUser = {
    name: 'Note Tester',
    email: 'notes@example.com',
    password: 'password123',
  };

  // Register and login user before running tests in this suite
  beforeAll(async () => {
    // Register user
    await request(app).post('/api/auth/register').send(testUser);
    
    // Login user to get token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
      
    token = loginRes.body.token;

    // Find the user ID (needed for associating notes)
    const user = await User.findOne({ email: testUser.email });
    userId = user._id; // Assuming MongoDB default _id
  });

  // Clear Notes collection before each test
  beforeEach(async () => {
    await Note.deleteMany({});
  });

  // --- Create Note Tests (POST /api/notes) ---
  describe('POST /api/notes', () => {
    it('should create a note successfully with a valid token', async () => {
      const noteData = { title: 'Test Note', content: 'This is test content.' };
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${token}`) // Set auth header
        .send(noteData);
        
      expect(res.statusCode).toEqual(201); // Expect 201 Created
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(noteData.title);
      expect(res.body.content).toBe(noteData.content);
      expect(res.body.user.toString()).toBe(userId.toString()); // Check association

      // Verify in DB
      const noteInDb = await Note.findById(res.body._id);
      expect(noteInDb).not.toBeNull();
      expect(noteInDb.title).toBe(noteData.title);
    });

    it('should return 401 if no token is provided', async () => {
      const noteData = { title: 'Unauthorized Note', content: 'Should not be created.' };
      const res = await request(app)
        .post('/api/notes')
        .send(noteData); // No Authorization header
        
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('msg', 'Not authorized, no token');
    });
     it('should return 401 if token is invalid', async () => {
      const noteData = { title: 'Invalid Token Note', content: 'Should fail.' };
      const res = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer invalidtoken123`) 
        .send(noteData);
        
      expect(res.statusCode).toEqual(401);
      // The exact message might vary based on JWT error (e.g., 'token failed (invalid)')
      expect(res.body).toHaveProperty('msg'); 
      expect(res.body.msg).toContain('token failed'); 
    });
     it('should return 400 if title is missing', async () => {
       const noteData = { content: 'Missing title content.' };
       const res = await request(app)
         .post('/api/notes')
         .set('Authorization', `Bearer ${token}`)
         .send(noteData);
         
       expect(res.statusCode).toEqual(400);
       expect(res.body).toHaveProperty('msg', 'Please provide title and content');
     });
      it('should return 400 if content is missing', async () => {
       const noteData = { title: 'Missing Content Note' };
       const res = await request(app)
         .post('/api/notes')
         .set('Authorization', `Bearer ${token}`)
         .send(noteData);
         
       expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('msg', 'Please provide title and content');
      });
  });

  // --- Get Notes Tests (GET /api/notes) ---
  describe('GET /api/notes', () => {
     // Create some notes for the test user before these tests run
     let note1, note2;
     beforeEach(async () => {
         await Note.deleteMany({}); // Clear first
         note1 = await Note.create({ user: userId, title: 'Note 1', content: 'Content 1' });
         note2 = await Note.create({ user: userId, title: 'Note 2', content: 'Content 2' });
         // Optional: Create a note for another user to test authorization
         // const otherUser = await User.create(...)
         // await Note.create({ user: otherUser._id, title: 'Other User Note', ... })
     });
      
    it('should fetch all notes for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(2); // Should fetch the two notes created
      // Check if the fetched notes belong to the user
      expect(res.body[0].user.toString()).toBe(userId.toString());
      expect(res.body[1].user.toString()).toBe(userId.toString());
       // Check titles to ensure correct notes are fetched (order might depend on sorting)
      const titles = res.body.map(n => n.title);
      expect(titles).toContain('Note 1');
      expect(titles).toContain('Note 2');
    });

    it('should return 401 if no token is provided', async () => {
      const res = await request(app).get('/api/notes');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('msg', 'Not authorized, no token');
    });
     it('should return 401 if token is invalid', async () => {
      const res = await request(app)
          .get('/api/notes')
          .set('Authorization', 'Bearer invalidtoken');
      expect(res.statusCode).toEqual(401);
      expect(res.body.msg).toContain('token failed');
     });
  });

  // --- Delete Note Tests (DELETE /api/notes/:id) ---
  describe('DELETE /api/notes/:id', () => {
      let noteToDelete;
      beforeEach(async () => {
          await Note.deleteMany({});
          noteToDelete = await Note.create({ user: userId, title: 'Delete Me', content: 'Content to delete' });
      });

    it('should delete a note successfully with a valid token and owned note ID', async () => {
      const res = await request(app)
        .delete(`/api/notes/${noteToDelete._id}`)
        .set('Authorization', `Bearer ${token}`);
        
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Note removed');
      expect(res.body).toHaveProperty('id', noteToDelete._id.toString());

      // Verify in DB
      const noteInDb = await Note.findById(noteToDelete._id);
      expect(noteInDb).toBeNull();
    });

    it('should return 401 if trying to delete without a token', async () => {
       const res = await request(app)
        .delete(`/api/notes/${noteToDelete._id}`); // No token
        
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('msg', 'Not authorized, no token');
    });

    it('should return 401 if trying to delete with an invalid token', async () => {
       const res = await request(app)
        .delete(`/api/notes/${noteToDelete._id}`)
        .set('Authorization', `Bearer invalidtoken`); 
        
      expect(res.statusCode).toEqual(401);
       expect(res.body.msg).toContain('token failed');
    });
    
    it('should return 404 if note ID does not exist', async () => {
        const nonExistentId = new mongoose.Types.ObjectId(); // Generate a valid format ID that doesn't exist
        const res = await request(app)
         .delete(`/api/notes/${nonExistentId}`)
         .set('Authorization', `Bearer ${token}`);
         
       expect(res.statusCode).toEqual(404); // Backend checks if note exists first
       expect(res.body).toHaveProperty('msg', 'Note not found');
    });

    // Optional: Test deleting another user's note (requires creating another user/note)
    // it('should return 401 if trying to delete another user\'s note', async () => { ... });
  });
  
   // --- (Optional) Get Single Note Tests (GET /api/notes/:id) ---
   describe('GET /api/notes/:id', () => {
        let noteToGet;
        beforeEach(async () => {
            await Note.deleteMany({});
            noteToGet = await Note.create({ user: userId, title: 'Get Me', content: 'Content to get' });
        });

        it('should get a single note successfully with valid token and owned ID', async () => {
            const res = await request(app)
                .get(`/api/notes/${noteToGet._id}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body._id.toString()).toBe(noteToGet._id.toString());
            expect(res.body.title).toBe(noteToGet.title);
        });

        it('should return 401 if no token provided', async () => {
             const res = await request(app).get(`/api/notes/${noteToGet._id}`);
             expect(res.statusCode).toEqual(401);
        });

         it('should return 404 if note ID not found', async () => {
             const nonExistentId = new mongoose.Types.ObjectId();
             const res = await request(app)
                .get(`/api/notes/${nonExistentId}`)
                .set('Authorization', `Bearer ${token}`);
             expect(res.statusCode).toEqual(404);
         });

         // Optional: Test getting another user's note
   });

   // --- (Optional) Update Note Tests (PUT /api/notes/:id) ---
    describe('PUT /api/notes/:id', () => {
        let noteToUpdate;
        const updateData = { title: 'Updated Title', content: 'Updated Content' };

        beforeEach(async () => {
            await Note.deleteMany({});
            noteToUpdate = await Note.create({ user: userId, title: 'Update Me', content: 'Initial Content' });
        });

        it('should update a note successfully with valid token and owned ID', async () => {
             const res = await request(app)
                .put(`/api/notes/${noteToUpdate._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.title).toBe(updateData.title);
            expect(res.body.content).toBe(updateData.content);
            expect(res.body._id.toString()).toBe(noteToUpdate._id.toString());

            // Verify in DB
             const noteInDb = await Note.findById(noteToUpdate._id);
             expect(noteInDb.title).toBe(updateData.title);
        });
         it('should return 401 if no token provided', async () => {
             const res = await request(app)
                .put(`/api/notes/${noteToUpdate._id}`)
                .send(updateData);
             expect(res.statusCode).toEqual(401);
         });
         it('should return 404 if note ID not found', async () => {
              const nonExistentId = new mongoose.Types.ObjectId();
              const res = await request(app)
                 .put(`/api/notes/${nonExistentId}`)
                 .set('Authorization', `Bearer ${token}`)
                 .send(updateData);
              expect(res.statusCode).toEqual(404);
         });
          it('should return 400 if title is missing', async () => {
             const res = await request(app)
                .put(`/api/notes/${noteToUpdate._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ content: 'Only content' }); // Missing title
             expect(res.statusCode).toEqual(400);
             expect(res.body).toHaveProperty('msg', 'Please provide title and content for update');
          });
           it('should return 400 if content is missing', async () => {
             const res = await request(app)
                .put(`/api/notes/${noteToUpdate._id}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ title: 'Only title' }); // Missing content
             expect(res.statusCode).toEqual(400);
             expect(res.body).toHaveProperty('msg', 'Please provide title and content for update');
           });
         // Optional: Test updating another user's note
    });

});

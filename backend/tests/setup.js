const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Before all tests, start the in-memory MongoDB server and connect Mongoose
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Set environment variable for database connection (if your app uses it)
  // process.env.MONGO_URI = mongoUri; // Uncomment if db.js relies on this env var

  await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // serverSelectionTimeoutMS: 10000, // Optional: Increase timeout
  });
}, 30000); // Increase timeout for beforeAll if needed (e.g., 30 seconds)

// After all tests, disconnect Mongoose and stop the server
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Before each test, clear all collections in the database
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({}); // Clear all documents
  }
  // Optional: Clear specific environment variables if tests modify them
  // process.env.JWT_SECRET = 'testsecret'; // Example: Reset JWT secret
});

// Optional: After each test cleanup (usually covered by beforeEach)
// afterEach(async () => {
//    // Add any specific cleanup needed after each test run
// });

// Ensure JWT_SECRET is set for tests (important!)
// Load from a .env.test file or set directly here
// Make sure this is consistent with how your app loads secrets.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecretfallback'; 
if (process.env.JWT_SECRET === 'testsecretfallback') {
    console.warn("Using fallback JWT_SECRET for tests. Consider using a .env.test file.");
}

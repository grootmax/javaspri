const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const noteRoutes = require('./routes/noteRoutes'); // Import note routes

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS
app.use(cors());

// Body parser middleware (Express >= 4.16 doesn't need separate body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Mount Routers
app.use('/api/auth', authRoutes); // Mount auth routes
app.use('/api/notes', noteRoutes); // Mount note routes

// Simple Root route (optional, can be removed if API is purely for auth/other resources)
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Define PORT
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

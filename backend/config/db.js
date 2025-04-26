const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // It's good practice to use the new parser and topology options,
    // although they are default in Mongoose 6+
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Mongoose 6 always behaves as if useCreateIndex is true and useFindAndModify is false,
      // so they are no longer options. Remove if using Mongoose 6+.
      // useCreateIndex: true, // Not needed for Mongoose 6+
      // useFindAndModify: false, // Not needed for Mongoose 6+
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Exit process with failure
    process.exit(1); 
  }
};

module.exports = connectDB;

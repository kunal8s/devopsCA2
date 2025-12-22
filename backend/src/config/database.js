const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Cleanup legacy indexes to avoid duplicate key errors from removed fields
    try {
      const studentCollection = conn.connection.collection('students');
      const indexes = await studentCollection.indexes();
      const legacyIndex = indexes.find((idx) => idx.name === 'universityId_1');
      if (legacyIndex) {
        await studentCollection.dropIndex('universityId_1');
        console.log('Dropped legacy index universityId_1');
      }
    } catch (cleanupErr) {
      console.warn('Index cleanup skipped:', cleanupErr.message);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
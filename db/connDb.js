const { mongoose } = require("mongoose");

const mongo_url = "mongodb://localhost:27017/weddBookie";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongo_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 11000,
    });
    console.log(`MongoDB connected at ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;


require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");

// Connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
};

// Function to create admin user
const createAdminUser = async () => {
  try {
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: "admin@pizza.com" });
    if (!adminExists) {
      // Create an admin user
      const password = await bcrypt.hash("admin123", 10);
      const admin = new User({
        name: "Admin",
        email: "admin@pizza.com",
        password: password,
        role: "admin",
      });
      await admin.save();
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};

// Initialize database
const init = async () => {
  try {
    await connectDB();
    await createAdminUser();
    console.log("Database initialization completed");
  } catch (error) {
    console.error("Initialization error:", error);
    throw error;
  }
};

module.exports = init;

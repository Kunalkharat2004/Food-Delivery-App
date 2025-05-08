const mongoose = require("mongoose");
const Menu = require("./models/menu");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

// Load menu data from menus.json
const loadMenuData = async () => {
  try {
    // Check if collection has data
    const menuCount = await Menu.countDocuments();
    if (menuCount > 0) {
      console.log("Menu data already exists in database");
    } else {
      // Read menus.json file
      const menuData = JSON.parse(
        fs.readFileSync(path.join(__dirname, "../menus.json"), "utf-8")
      );

      // Insert menu data
      const insertResult = await Menu.insertMany(menuData);
      console.log(`${insertResult.length} menu items imported successfully`);
    }

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
    }
  } catch (error) {
    console.error("Error seeding data:", error);
  }
};

module.exports = loadMenuData;

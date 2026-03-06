import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/campusbridge");
    console.log("MongoDB Connected");

    const adminEmail = "superadmin@admin.edu.in";
    const plainPassword = process.env.ADMIN_PASSWORD || "admin123";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit();
    }

    const adminEmailRegex = /^[a-zA-Z0-9._%+-]+@admin\.edu\.in$/;

    if (!adminEmailRegex.test(adminEmail)) {
      console.log("Invalid admin email format");
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    await User.create({
      fullName: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${plainPassword}`);
    process.exit();
  } catch (error) {
    console.log("Error creating admin:", error);
    process.exit();
  }
};

createAdmin();
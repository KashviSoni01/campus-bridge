import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, department, year } = req.body;

    if (!fullName || !email || !password || !department || !year) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.edu\.in$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Only valid college email (@student.edu.in) allowed",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      department,
      year,
      role: "student",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Allow both admin and student emails
    const adminEmailRegex = /^[a-zA-Z0-9._%+-]+@admin\.edu\.in$/;
    const studentEmailRegex = /^[a-zA-Z0-9._%+-]+@student\.edu\.in$/;
    
    if (!adminEmailRegex.test(email) && !studentEmailRegex.test(email)) {
      return res.status(400).json({ message: "Only valid college email allowed" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    if (error.message === "JWT_SECRET is not configured") {
      return res.status(500).json({ message: "Server configuration error" });
    }
    res.status(500).json({ message: "Server error" });
  }
};
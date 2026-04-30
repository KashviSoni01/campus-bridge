import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return process.env.JWT_SECRET;
};

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, department, year } = req.body;
    let profilePicture = "";

    if (req.file) {
      profilePicture = `/uploads/${req.file.filename}`;
    }

    if (!fullName || !email || !password || !department || !year) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Only valid college email  allowed",
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
      profilePicture,
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
        profilePicture: user.profilePicture,
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
    const studentEmailRegex = /^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/;
    
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
        profilePicture: user.profilePicture,
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

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

 
    const adminEmailRegex = /^[a-zA-Z0-9._%+-]+@admin\.edu\.in$/;
    const studentEmailRegex = /^[a-zA-Z0-9._%+-]+@chitkara\.edu\.in$/;
    
    if (!adminEmailRegex.test(email) && !studentEmailRegex.test(email)) {
      return res.status(400).json({ message: "Only valid college email allowed" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      
      const randomPassword = Math.random().toString(36).slice(-10) + Date.now();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      user = await User.create({
        fullName: name,
        email: email,
        password: hashedPassword,
        profilePicture: picture,
        role: adminEmailRegex.test(email) ? "admin" : "student",
        department: "Computer Science", 
        year: 1, 
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: "7d" }
    );

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google authentication failed" });
  }
};
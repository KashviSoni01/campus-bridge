import express from "express";
import User from "../models/User.js";
import upload from "../middleware/upload.js";
import jwt from "jsonwebtoken";

const router = express.Router();

/* Middleware to verify JWT token */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

/* GET current user profile */
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Error fetching profile" });
  }
});

/* UPDATE user profile */
router.put("/me", verifyToken, upload.single("profilePicture"), async (req, res) => {
  try {
    const { fullName, phone, college, location, github, linkedin, bio, department, year } = req.body;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (college) updateData.college = college;
    if (location) updateData.location = location;
    if (github) updateData.github = github;
    if (linkedin) updateData.linkedin = linkedin;
    if (bio) updateData.bio = bio;
    if (department) updateData.department = department;
    if (year) updateData.year = parseInt(year);

    // Handle profile picture upload
    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

export default router;

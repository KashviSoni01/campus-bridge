import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token." });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token." });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const isAdminOrCoordinator = async (req, res, next) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "coordinator") {
      return res.status(403).json({ message: "Access denied. Admin or coordinator only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const isStudent = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied. Student only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const canAccessDomain = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      return next();
    }

    if (req.user.role === "coordinator") {
      const { domain } = req.params;
      if (req.user.assignedDomain !== domain) {
        return res.status(403).json({ message: "Access denied. Cannot access this domain." });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (token) {
      const decoded = jwt.verify(token, getJwtSecret());
      const user = await User.findById(decoded.id).select("-password");
      req.user = user;
    }
    
    next();
  } catch (error) {
    next();
  }
};

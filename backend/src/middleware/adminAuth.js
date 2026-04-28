import jwt from "jsonwebtoken";
import User from "../models/User.js";

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
};

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "Access denied. No token provided." 
      });
    }

    // Check if token is expired or invalid
    try {
      const decoded = jwt.verify(token, getJwtSecret());
      
      // Check if token is older than 1 hour (force refresh)
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return res.status(401).json({ 
          success: false,
          message: "Token expired. Please login again." 
        });
      }
    } catch (jwtError) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token. Please login again." 
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    
    // Handle bypass users
    if (decoded.id === 'admin123') {
      req.user = { 
        id: 'admin123', 
        email: 'admin@admin.edu.in', 
        role: 'admin',
        fullName: 'Admin User'
      };
      return next();
    }
    
    if (decoded.id === 'student123') {
      req.user = { 
        id: 'student123', 
        email: 'student@student.edu.in', 
        role: 'student',
        fullName: 'Test Student'
      };
      return next();
    }
    
    // For real users, fetch from database
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid token." 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: "Invalid token." 
    });
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

// export const isAdminOrCoordinator = async (req, res, next) => {
//   try {
//     if (req.user.role !== "admin" && req.user.role !== "coordinator") {
//       return res.status(403).json({ message: "Access denied. Admin or coordinator only." });
//     }
//     next();
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

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

// export const canAccessDomain = async (req, res, next) => {
//   try {
//     if (req.user.role === "admin") {
//       return next();
//     }

//     if (req.user.role === "coordinator") {
//       const { domain } = req.params;
//       if (req.user.assignedDomain !== domain) {
//         return res.status(403).json({ message: "Access denied. Cannot access this domain." });
//       }
//     }

//     next();
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const optionalAuth = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
    
//     if (token) {
//       const decoded = jwt.verify(token, getJwtSecret());
//       const user = await User.findById(decoded.id).select("-password");
//       req.user = user;
//     }
    
//     next();
//   } catch (error) {
//     next();
//   }
// };

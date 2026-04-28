import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    department: {
      type: String,
      enum: ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Chemical"],
      required: function () {
        return this.role === "student";
      },
    },

    year: {
      type: Number,
      enum: [1, 2, 3, 4],
      required: function () {
        return this.role === "student";
      },
    },

    // Additional fields for admin dashboard
    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },

    profilePicture: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },

    skills: [{
      type: String,
      trim: true,
    }],

    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },

    // Admin specific fields
    permissions: [{
      type: String,
      enum: ["user_management", "opportunity_management", "application_management", "system_settings"],
    }],

    // Activity tracking
    totalApplications: {
      type: Number,
      default: 0,
    },

    totalOpportunitiesCreated: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
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

    profilePicture: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    college: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    github: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);

export default User;
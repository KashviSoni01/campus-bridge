import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    college: {
      type: String,
    },
    branch: {
      type: String,
    },
    year: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Selected", "Rejected", "Shortlisted"],
      default: "Pending",
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    resume: {
      type: String, // URL to resume file
    },
    coverLetter: {
      type: String,
    },
    additionalInfo: {
      type: String,
    },
    adminNotes: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedDate: {
      type: Date,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    skills: [{
      type: String,
    }],
    experience: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    github: {
      type: String,
    },
  },
  { timestamps: true }
);

applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ opportunity: 1, status: 1 });

const Application = mongoose.model("Application", applicationSchema);
export default Application;

import mongoose from "mongoose";

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    organization: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Internship", "Full-time", "Part-time", "Freelance", "Competition", "Hackathon", "Workshop", "Training", "Event"],
      required: true,
    },
    domain: {
      type: String,
      enum: ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical", "Chemical", "Business", "Design", "Other"],
      required: true,
    },
    mode: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },
    location: {
      type: String,
    },
    duration: {
      type: String,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    eligibility: {
      minYear: {
        type: Number,
        min: 1,
        max: 4,
        default: 1,
      },
      maxYear: {
        type: Number,
        min: 1,
        max: 4,
        default: 4,
      },
      branches: [{
        type: String,
      }],
      minCGPA: {
        type: Number,
        min: 0,
        max: 10,
        default: 0,
      },
    },
    maxParticipants: {
      type: Number,
      default: 100,
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    requirements: {
      type: String,
    },
    prizes: {
      type: String,
    },
    contactInfo: {
      email: {
        type: String,
      },
      phone: {
        type: String,
      },
      website: {
        type: String,
      }
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Closed", "Draft", "Scheduled", "Expired"],
      default: "Active",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
    applications: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    scheduledPublishDate: {
      type: Date,
    },

    isExpired: {
      type: Boolean,
      default: false,
    },
    expiryNotified: {
      type: Boolean,
      default: false,
    },
    trending: {
      type: Boolean,
      default: false,
    },
    heatScore: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

opportunitySchema.index({ title: "text", description: "text", organization: "text" });
opportunitySchema.index({ domain: 1, category: 1 });
opportunitySchema.index({ deadline: 1 });
opportunitySchema.index({ featured: 1, status: 1 });
opportunitySchema.index({ isExpired: 1 });

opportunitySchema.pre('save', function(next) {
  if (this.deadline && new Date() > new Date(this.deadline)) {
    this.isExpired = true;
    this.status = 'Expired';
  }
  next();
});

const Opportunity = mongoose.model("Opportunity", opportunitySchema);
export default Opportunity;

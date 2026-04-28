import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ["create", "update", "delete", "apply", "login", "register", "USER_REGISTERED"],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Opportunity",
    required: false
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Auto clean old activities (keep only 50)
activityLogSchema.pre('save', async function() {
  try {
    const count = await this.constructor.countDocuments();
    if (count > 50) {
      const oldest = await this.constructor.find()
        .sort({ createdAt: 1 })
        .limit(count - 50);
      
      const oldestIds = oldest.map(doc => doc._id);
      await this.constructor.deleteMany({ _id: { $in: oldestIds } });
    }
  } catch (error) {
    console.error("Error cleaning old activities:", error);
  }
});

export default mongoose.model("ActivityLog", activityLogSchema);

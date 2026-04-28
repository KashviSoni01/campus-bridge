import ActivityLog from "../models/ActivityLog.js";
import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";

export const logActivity = async (action, userId, opportunityId, message, details = {}, priority = "medium") => {
  try {
    const activity = new ActivityLog({
      action,
      userId,
      opportunityId,
      message,
      details,
      priority
    });
    
    await activity.save();
    return activity;
  } catch (error) {
    console.error("Error logging activity:", error);
  }
};

export const getActivities = async (req, res) => {
  try {
    const { limit = 5, filter, action } = req.query;
    
    let query = {};
    
    if (filter === "opportunities") {
      query.action = { $in: ["create", "update", "delete"] };
    } else if (filter === "applications") {
      query.action = "apply";
    } else if (filter === "users") {
      query.action = { $in: ["register", "login"] };
    }
    
    if (action) {
      query.action = action;
    }
    
    const activities = await ActivityLog.find(query)
      .populate("userId", "fullName email")
      .populate("opportunityId", "title organization")
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));
    
    const formattedActivities = activities.map(activity => ({
      id: activity._id,
      action: activity.action,
      message: activity.message,
      details: activity.details,
      priority: activity.priority,
      timestamp: activity.timestamp,
      user: activity.userId ? {
        id: activity.userId._id,
        name: activity.userId.fullName,
        email: activity.userId.email
      } : null,
      opportunity: activity.opportunityId ? {
        id: activity.opportunityId._id,
        title: activity.opportunityId.title,
        organization: activity.opportunityId.organization
      } : null,
      icon: getActivityIcon(activity.action),
      color: getActivityColor(activity.action)
    }));
    
    res.json(formattedActivities);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const getActivityStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    
    const stats = {
      today: {
        opportunities: await ActivityLog.countDocuments({
          action: { $in: ["create", "update", "delete"] },
          timestamp: { $gte: startOfDay }
        }),
        applications: await ActivityLog.countDocuments({
          action: "apply",
          timestamp: { $gte: startOfDay }
        }),
        users: await ActivityLog.countDocuments({
          action: { $in: ["register", "login"] },
          timestamp: { $gte: startOfDay }
        })
      },
      total: await ActivityLog.countDocuments()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

function getActivityIcon(action) {
  const icons = {
    create: "🎪",
    update: "✏️",
    delete: "🗑️",
    apply: "📝",
    login: "🔑",
    register: "👤",
    USER_REGISTERED: "👤"
  };
  return icons[action] || "📋";
}

function getActivityColor(action) {
  const colors = {
    create: "green",
    update: "blue",
    delete: "red",
    apply: "purple",
    login: "orange",
    register: "green",
    USER_REGISTERED: "green"
  };
  return colors[action] || "gray";
}

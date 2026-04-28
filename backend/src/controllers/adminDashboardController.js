import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Core counts - ensure they are accurate
    const totalUsers = await User.countDocuments({ role: "student" });
    const totalOpportunities = await Opportunity.countDocuments();
    const totalApplications = await Application.countDocuments();
    
    // Opportunity status counts - fix the logic
    const activeOpportunities = await Opportunity.countDocuments({ 
      deadline: { $gt: now },
      status: "Active"
    });
    
    const expiredOpportunities = await Opportunity.countDocuments({ 
      $or: [
        { deadline: { $lte: now } },
        { status: "Expired" },
        { status: "Closed" }
      ]
    });
    
    const draftOpportunities = await Opportunity.countDocuments({ 
      status: "Draft" 
    });

    // Closing soon opportunities (deadline < 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const closingSoonOpportunities = await Opportunity.countDocuments({ 
      deadline: { 
        $gte: now, 
        $lte: threeDaysFromNow 
      },
      status: "Active"
    });

    // Featured opportunities
    const featuredOpportunities = await Opportunity.countDocuments({ 
      featured: true 
    });

    // Recent activity counts
    const recentApplications = await Application.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: lastWeek },
      role: "student"
    });

    // Get recent opportunities for activity feed
    const recentOpportunities = await Opportunity.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title organization category createdAt deadline status");

    // Get recent applications for activity feed
    const recentApplicationsList = await Application.find()
      .populate("student", "fullName email")
      .populate("opportunity", "title organization")
      .sort({ createdAt: -1 })
      .limit(5);

    // Category statistics
    const categoryStats = await Opportunity.aggregate([
      { $match: { status: { $ne: "Draft" } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Department statistics
    const departmentStats = await User.aggregate([
      { $match: { role: "student" } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Weekly trend for applications
    const weeklyTrend = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: lastWeek }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Smart data features
    // Top active users (most applications)
    const topActiveUsers = await User.aggregate([
      { $match: { role: "student" } },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "student",
          as: "applications"
        }
      },
      {
        $addFields: {
          applicationCount: { $size: "$applications" }
        }
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          fullName: 1,
          email: 1,
          department: 1,
          applicationCount: 1
        }
      }
    ]);

    // Inactive opportunities (0 applications)
    const inactiveOpportunities = await Opportunity.find({
      applications: 0,
      status: { $ne: "Draft" },
      isDeleted: { $ne: true }
    })
    .select("title organization category deadline applications")
    .sort({ deadline: 1 })
    .limit(10);

    // Deadline reminders (opportunities expiring in next 7 days)
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const deadlineReminders = await Opportunity.find({
      deadline: { 
        $gte: now, 
        $lte: sevenDaysFromNow 
      },
      status: "Active",
      isDeleted: { $ne: true }
    })
    .select("title organization deadline")
    .sort({ deadline: 1 })
    .limit(5);

    // Remove fake recent activity - now handled by ActivityLog collection
    const recentActivity = [];

    const stats = {
      totalUsers,
      totalOpportunities,
      totalApplications,
      activeOpportunities,
      expiredOpportunities,
      draftOpportunities,
      closingSoonOpportunities,
      featuredOpportunities,
      recentApplications,
      recentUsers,
      categoryStats,
      departmentStats,
      weeklyTrend,
      topActiveUsers,
      inactiveOpportunities,
      deadlineReminders
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    res.json([]);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get recent activities that need attention
    const recentApplications = await Application.find({
      createdAt: { $gte: oneDayAgo }
    })
    .populate("opportunity", "title organization")
    .populate("student", "fullName email")
    .sort({ createdAt: -1 })
    .limit(5);

    // Get urgent opportunities (deadline < 3 days)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const urgentOpportunities = await Opportunity.find({
      deadline: { 
        $gte: now, 
        $lte: threeDaysFromNow 
      },
      status: "Active",
      isDeleted: { $ne: true }
    })
    .select("title organization deadline")
    .sort({ deadline: 1 })
    .limit(3);

    const notifications = [
      ...recentApplications.map(app => ({
        id: app._id,
        type: "new_application",
        title: "New Application Received",
        message: `${app.student.fullName} applied for ${app.opportunity.title}`,
        timestamp: app.createdAt,
        priority: "medium",
        action: "view_application",
        actionId: app._id
      })),
      ...urgentOpportunities.map(opp => ({
        id: opp._id,
        type: "deadline_warning",
        title: "Deadline Approaching",
        message: `${opp.title} deadline is near`,
        timestamp: opp.deadline,
        priority: "high",
        action: "view_opportunity",
        actionId: opp._id
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

const generateDailyAnalytics = async () => {
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status, domain, year } = req.query;
    const skip = (page - 1) * limit;

    let query = { role: "student" }; // Only show students, not admin
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (domain) query.department = domain;
    if (year) query.year = parseInt(year);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const updateData = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get applications with filters
export const getApplications = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      opportunity, 
      department, 
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;
    
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { "student.fullName": { $regex: search, $options: "i" } },
        { "student.email": { $regex: search, $options: "i" } },
        { "opportunity.title": { $regex: search, $options: "i" } }
      ];
    }

    if (status) query.status = status;
    if (opportunity) query.opportunity = opportunity;
    if (department) query["student.department"] = department;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const applications = await Application.find(query)
      .populate("student", "fullName email department year")
      .populate("opportunity", "title organization category deadline")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application = await Application.findByIdAndUpdate(
      applicationId,
      { status },
      { new: true }
    ).populate("student", "fullName email")
     .populate("opportunity", "title organization");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    console.error("Update application status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get calendar data
export const getCalendarData = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    const opportunities = await Opportunity.find({
      deadline: {
        $gte: startDate,
        $lte: endDate
      },
      status: { $ne: "Draft" }
    }).select("title organization category deadline status");

    const calendarData = opportunities.map(opp => ({
      id: opp._id,
      title: opp.title,
      organization: opp.organization,
      category: opp.category,
      date: opp.deadline,
      status: opp.status,
      type: 'deadline'
    }));

    res.json(calendarData);
  } catch (error) {
    console.error("Get calendar data error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

// Get opportunity details with applications
export const getOpportunityWithApplications = async (req, res) => {
  try {
    const { opportunityId } = req.params;

    const opportunity = await Opportunity.findById(opportunityId)
      .populate("postedBy", "fullName email");

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const applications = await Application.find({ opportunity: opportunityId })
      .populate("student", "fullName email department year phone")
      .sort({ createdAt: -1 });

    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(app => app.status === "Pending").length,
      reviewedApplications: applications.filter(app => app.status === "Reviewed").length,
      selectedApplications: applications.filter(app => app.status === "Selected").length,
      rejectedApplications: applications.filter(app => app.status === "Rejected").length
    };

    res.json({
      opportunity,
      applications,
      stats
    });
  } catch (error) {
    console.error("Get opportunity details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Bulk operations on opportunities
export const bulkUpdateOpportunities = async (req, res) => {
  try {
    const { opportunityIds, updateData } = req.body;

    const result = await Opportunity.updateMany(
      { _id: { $in: opportunityIds } },
      updateData
    );

    res.json({
      message: "Bulk update successful",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export data
export const exportData = async (req, res) => {
  try {
    const { type, format = "json" } = req.query;

    let data;
    
    switch(type) {
      case "users":
        data = await User.find({ role: "student" })
          .select("fullName email department year createdAt isActive")
          .sort({ createdAt: -1 });
        break;
      case "opportunities":
        data = await Opportunity.find()
          .select("title organization category deadline status createdAt")
          .sort({ createdAt: -1 });
        break;
      case "applications":
        data = await Application.find()
          .populate("student", "fullName email department")
          .populate("opportunity", "title organization")
          .sort({ createdAt: -1 });
        break;
      default:
        return res.status(400).json({ message: "Invalid export type" });
    }

    if (format === "csv") {
      // Convert to CSV format (simplified)
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}.csv`);
      res.send(csv);
    } else {
      res.json(data);
    }
  } catch (error) {
    console.error("Export data error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return `"${value}"`;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
};

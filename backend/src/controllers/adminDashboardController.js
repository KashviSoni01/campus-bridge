import User from "../models/User.js";
import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import mongoose from "mongoose";

export const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalUsers = await User.countDocuments({ role: "student" });
    const totalOpportunities = await Opportunity.countDocuments();
    const totalApplications = await Application.countDocuments();
    const activeOpportunities = await Opportunity.countDocuments({ 
      status: "Active", 
      deadline: { $gt: now } 
    });

    const recentApplications = await Application.countDocuments({
      createdAt: { $gte: lastWeek }
    });

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: lastWeek },
      role: "student"
    });

    const domainStats = await Opportunity.aggregate([
      { $match: { status: "Active" } },
      { $group: { _id: "$domain", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const monthlyGrowth = await User.aggregate([
      {
        $match: {
          role: "student",
          createdAt: { $gte: lastMonth }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    const mostApplied = await Opportunity.findOne()
      .sort({ applications: -1 })
      .select("title organization applications");

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

    // const recentActivity = await ActivityLog.find()
    //   .populate("user", "fullName email")
    //   .sort({ timestamp: -1 })
    //   .limit(10);
    const recentActivity = [];

    const stats = {
      totalUsers,
      totalOpportunities,
      totalApplications,
      activeOpportunities,
      recentApplications,
      recentUsers,
      monthlyGrowth: monthlyGrowth[0]?.count || 0,
      mostPopularDomain: domainStats[0]?._id || "N/A",
      mostAppliedOpportunity: mostApplied?.title || "N/A",
      weeklyTrend,
      recentActivity
    };

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const { period = "30" } = req.query;
    // const days = parseInt(period);
    // const startDate = new Date();
    // startDate.setDate(startDate.getDate() - days);

    // const analytics = await Analytics.find({
    //   date: { $gte: startDate }
    // }).sort({ date: 1 });

    // if (analytics.length === 0) {
    //   await generateDailyAnalytics();
    //   return getAnalytics(req, res);
    // }

    res.json([]);
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const generateDailyAnalytics = async () => {
  // const today = new Date();
  // today.setHours(0, 0, 0, 0);

  // const totalUsers = await User.countDocuments({ role: "student" });
  // const activeUsers = await User.countDocuments({
  //   role: "student",
  //   lastActive: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) }
  // });
  // const totalOpportunities = await Opportunity.countDocuments();
  // const activeOpportunities = await Opportunity.countDocuments({ 
  //   status: "Active", 
  //   deadline: { $gt: today } 
  // });
  // const totalApplications = await Application.countDocuments();
  // const newApplications = await Application.countDocuments({
  //   createdAt: { $gte: today }
  // });

  // const totalViews = await Opportunity.aggregate([
  //   { $group: { _id: null, total: { $sum: "$views" } } }
  // ]);

  // const conversionRate = totalOpportunities > 0 ? (totalApplications / totalViews[0]?.total || 1) * 100 : 0;

  // await Analytics.findOneAndUpdate(
  //   { date: today },
  //   {
  //     totalUsers,
  //     activeUsers,
  //     totalOpportunities,
  //     activeOpportunities,
  //     totalApplications,
  //     newApplications,
  //     totalViews: totalViews[0]?.total || 0,
  //     conversionRate
  //   },
  //   { upsert: true, new: true }
  // );
};

export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, status, domain, year } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role) query.role = role;
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
    const { status, role } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await ActivityLog.create({
      user: req.user.id,
      action: "User Status Change",
      resource: "User",
      resourceId: userId,
      details: { status, role }
    });

    res.json(user);
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

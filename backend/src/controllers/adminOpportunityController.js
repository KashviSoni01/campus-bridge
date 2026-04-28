import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import ActivityLog from "../models/ActivityLog.js";

const logActivity = async (action, userId, opportunityId, message, details = {}, priority = "medium") => {
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

export const getOpportunities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      status, 
      sortBy = "deadline",
      sortOrder = "asc",
      mode
    } = req.query;
    
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (status && status !== "all") {
      query.status = status;
    }

    // Exclude deleted opportunities
    query.isDeleted = { $ne: true };

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const opportunities = await Opportunity.find(query)
      .populate("postedBy", "fullName email")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Opportunity.countDocuments(query);

    res.json({
      opportunities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

export const createOpportunity = async (req, res) => {
  try {
    const opportunityData = {
      ...req.body
    };

    // Validation
    if (!opportunityData.title || !opportunityData.description || !opportunityData.organization || !opportunityData.deadline) {
      return res.status(400).json({
        success: false,
        message: "Required fields: title, description, organization, deadline"
      });
    }

    // Check for past deadline
    if (new Date(opportunityData.deadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Deadline cannot be in the past"
      });
    }

    // Duplicate detection
    const existingOpportunity = await Opportunity.findOne({
      title: opportunityData.title,
      organization: opportunityData.organization,
      isDeleted: { $ne: true }
    });

    if (existingOpportunity) {
      return res.status(400).json({
        success: false,
        message: "Opportunity with same title and organization already exists"
      });
    }

    // Only set postedBy for real users (not admin bypass)
    if (req.user?.id && req.user.id !== 'admin123' && req.user.id !== 'student123') {
      opportunityData.postedBy = req.user.id;
    } else {
      // For admin bypass, don't set postedBy
      delete opportunityData.postedBy;
    }

    Object.keys(opportunityData).forEach(key => {
      if (opportunityData[key] === "" || opportunityData[key] === null || opportunityData[key] === undefined) {
        delete opportunityData[key];
      }
    });

    const opportunity = new Opportunity(opportunityData);
    await opportunity.save();

    const populatedOpportunity = await Opportunity.findById(opportunity._id)
      .populate("postedBy", "fullName email");

    // Log activity
    await logActivity(
      "create",
      req.user?.id,
      opportunity._id,
      `New opportunity created: ${opportunity.title}`,
      {
        title: opportunity.title,
        organization: opportunity.organization,
        category: opportunity.category,
        deadline: opportunity.deadline
      },
      "high"
    );

    res.status(201).json(populatedOpportunity);
  } catch (error) {
    let errorMessage = "Server error";
    if (error.name === 'ValidationError') {
      errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
    }
    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};

export const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("postedBy", "fullName email");

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    res.json(opportunity);
  } catch (error) {
    console.error("Update opportunity error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findByIdAndDelete(id);
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    await Application.deleteMany({ opportunity: id });

    res.json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const toggleFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      { featured },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    res.json(opportunity);
  } catch (error) {
    console.error("Toggle feature error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const incrementViews = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ 
        success: false,
        message: "Opportunity not found" 
      });
    }

    res.json({
      success: true,
      data: { views: opportunity.views }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const softDeleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      { 
        isDeleted: true, 
        deletedAt: new Date(),
        status: "Closed"
      },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ 
        success: false,
        message: "Opportunity not found" 
      });
    }

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const restoreOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      { 
        isDeleted: false, 
        deletedAt: null,
        status: "Active"
      },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ 
        success: false,
        message: "Opportunity not found" 
      });
    }

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const extendDeadline = async (req, res) => {
  try {
    const { id } = req.params;
    const { deadline } = req.body;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      { 
        deadline: new Date(deadline),
        status: "Active"
      },
      { new: true }
    );

    if (!opportunity) {
      return res.status(404).json({ 
        success: false,
        message: "Opportunity not found" 
      });
    }

    res.json({
      success: true,
      data: opportunity
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
};

export const duplicateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const originalOpportunity = await Opportunity.findById(id);
    if (!originalOpportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const duplicateData = {
      ...originalOpportunity.toObject(),
      _id: undefined,
      title: `${originalOpportunity.title} (Copy)`,
      postedBy: req.user?.id,
      status: "Draft",
      views: 0,
      applications: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const newOpportunity = new Opportunity(duplicateData);
    await newOpportunity.save();

    const populatedOpportunity = await Opportunity.findById(newOpportunity._id)
      .populate("postedBy", "fullName email");

    res.status(201).json(populatedOpportunity);
  } catch (error) {
    console.error("Duplicate opportunity error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOpportunityDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const opportunity = await Opportunity.findById(id)
      .populate("postedBy", "fullName email");

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    const applications = await Application.find({ opportunity: id })
      .populate("student", "fullName email department year")
      .sort({ createdAt: -1 });

    res.json({
      opportunity,
      applications
    });
  } catch (error) {
    console.error("Get opportunity details error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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

export const bulkDeleteOpportunities = async (req, res) => {
  try {
    const { opportunityIds } = req.body;

    const result = await Opportunity.deleteMany({
      _id: { $in: opportunityIds }
    });

    await Application.deleteMany({
      opportunity: { $in: opportunityIds }
    });

    res.json({
      message: "Bulk delete successful",
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Bulk delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

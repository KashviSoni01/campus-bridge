// import Opportunity from "../models/Opportunity.js";
// import Application from "../models/Application.js";
// import User from "../models/User.js";

// export const getOpportunities = async (req, res) => {
//   try {
//     const { 
//       page = 1, 
//       limit = 10, 
//       search, 
//       category, 
//       domain, 
//       status, 
//       featured,
//       sortBy = "createdAt",
//       sortOrder = "desc"
//     } = req.query;
    
//     const skip = (page - 1) * limit;

//     let query = {};
    
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { organization: { $regex: search, $options: "i" } },
//         { description: { $regex: search, $options: "i" } }
//       ];
//     }

//     if (category) query.category = category;
//     if (domain) query.domain = domain;
//     if (status) query.status = status;
//     if (featured !== undefined) query.featured = featured === "true";

//     const sortOptions = {};
//     sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

//     const opportunities = await Opportunity.find(query)
//       .populate("postedBy", "fullName email")
//       .populate("approvedBy", "fullName email")
//       .sort(sortOptions)
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Opportunity.countDocuments(query);

//     res.json({
//       opportunities,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total,
//         pages: Math.ceil(total / limit)
//       }
//     });
//   } catch (error) {
//     console.error("Get opportunities error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const createOpportunity = async (req, res) => {
//   try {
//     console.log("Create opportunity request body:", req.body);
//     console.log("Create opportunity user:", req.user);
    
//     const opportunityData = {
//       ...req.body,
//       postedBy: req.user?.id || null
//     };

//     console.log("Processed opportunity data:", opportunityData);

//     if (!opportunityData.postedBy) {
//       delete opportunityData.postedBy;
//     }

//     Object.keys(opportunityData).forEach(key => {
//       if (opportunityData[key] === "" || opportunityData[key] === null || opportunityData[key] === undefined) {
//         delete opportunityData[key];
//       }
//     });

//     console.log("Cleaned opportunity data:", opportunityData);

//     const opportunity = new Opportunity(opportunityData);
//     await opportunity.save();

//     console.log("Opportunity saved successfully:", opportunity._id);

//     const populatedOpportunity = await Opportunity.findById(opportunity._id)
//       .populate("postedBy", "fullName email");

//     console.log("Returning populated opportunity:", populatedOpportunity);

//     res.status(201).json(populatedOpportunity);
//   } catch (error) {
//     console.error("Create opportunity error details:", {
//       name: error.name,
//       message: error.message,
//       stack: error.stack,
//       errors: error.errors
//     });
    
//     let errorMessage = "Server error";
//     if (error.name === 'ValidationError') {
//       errorMessage = `Validation error: ${Object.values(error.errors).map(e => e.message).join(', ')}`;
//     } else if (error.name === 'CastError') {
//       errorMessage = `Invalid data format: ${error.message}`;
//     } else if (error.code === 11000) {
//       errorMessage = "Duplicate entry detected";
//     }
    
//     res.status(500).json({ 
//       message: errorMessage, 
//       details: error.message,
//       error: error.name 
//     });
//   }
// };

// export const updateOpportunity = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     const opportunity = await Opportunity.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate("postedBy", "fullName email");

//     if (!opportunity) {
//       return res.status(404).json({ message: "Opportunity not found" });
//     }

//     await ActivityLog.create({
//       user: req.user.id,
//       action: "Opportunity Update",
//       resource: "Opportunity",
//       resourceId: id,
//       details: { title: opportunity.title }
//     });

//     res.json(opportunity);
//   } catch (error) {
//     console.error("Update opportunity error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const deleteOpportunity = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const opportunity = await Opportunity.findByIdAndDelete(id);
//     if (!opportunity) {
//       return res.status(404).json({ message: "Opportunity not found" });
//     }

//     await Application.deleteMany({ opportunity: id });

//     await ActivityLog.create({
//       user: req.user.id,
//       action: "Opportunity Delete",
//       resource: "Opportunity",
//       resourceId: id,
//       details: { title: opportunity.title }
//     });

//     res.json({ message: "Opportunity deleted successfully" });
//   } catch (error) {
//     console.error("Delete opportunity error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const toggleFeature = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { featured } = req.body;

//     const opportunity = await Opportunity.findByIdAndUpdate(
//       id,
//       { featured },
//       { new: true }
//     );

//     if (!opportunity) {
//       return res.status(404).json({ message: "Opportunity not found" });
//     }

//     res.json(opportunity);
//   } catch (error) {
//     console.error("Toggle feature error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const duplicateOpportunity = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const originalOpportunity = await Opportunity.findById(id);
//     if (!originalOpportunity) {
//       return res.status(404).json({ message: "Opportunity not found" });
//     }

//     const duplicateData = {
//       ...originalOpportunity.toObject(),
//       _id: undefined,
//       title: `${originalOpportunity.title} (Copy)`,
//       postedBy: req.user.id,
//       status: "Draft",
//       views: 0,
//       applications: 0,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     const newOpportunity = new Opportunity(duplicateData);
//     await newOpportunity.save();

//     const populatedOpportunity = await Opportunity.findById(newOpportunity._id)
//       .populate("postedBy", "fullName email");

//     res.status(201).json(populatedOpportunity);
//   } catch (error) {
//     console.error("Duplicate opportunity error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getOpportunityDetails = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const opportunity = await Opportunity.findById(id)
//       .populate("postedBy", "fullName email")
//       .populate("approvedBy", "fullName email");

//     if (!opportunity) {
//       return res.status(404).json({ message: "Opportunity not found" });
//     }

//     const applications = await Application.find({ opportunity: id })
//       .populate("student", "fullName email department year")
//       .sort({ appliedDate: -1 });

//     const stats = {
//       totalApplications: applications.length,
//       pendingApplications: applications.filter(app => app.status === "Pending").length,
//       reviewedApplications: applications.filter(app => app.status === "Reviewed").length,
//       selectedApplications: applications.filter(app => app.status === "Selected").length,
//       rejectedApplications: applications.filter(app => app.status === "Rejected").length
//     };

//     res.json({
//       opportunity,
//       applications,
//       stats
//     });
//   } catch (error) {
//     console.error("Get opportunity details error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const bulkUpdateOpportunities = async (req, res) => {
//   try {
//     const { opportunityIds, updateData } = req.body;

//     const result = await Opportunity.updateMany(
//       { _id: { $in: opportunityIds } },
//       updateData
//     );

//     await ActivityLog.create({
//       user: req.user.id,
//       action: "Bulk Opportunity Update",
//       resource: "Opportunity",
//       details: { count: result.modifiedCount, updateData }
//     });

//     res.json({
//       message: "Bulk update successful",
//       modifiedCount: result.modifiedCount
//     });
//   } catch (error) {
//     console.error("Bulk update error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const bulkDeleteOpportunities = async (req, res) => {
//   try {
//     const { opportunityIds } = req.body;

//     const result = await Opportunity.deleteMany({ _id: { $in: opportunityIds } });

//     await Application.deleteMany({ opportunity: { $in: opportunityIds } });
//     await ActivityLog.create({
//       user: req.user.id,
//       action: "Bulk Opportunity Delete",
//       resource: "Opportunity",
//       details: { count: result.deletedCount }
//     });

//     res.json({
//       message: "Bulk delete successful",
//       deletedCount: result.deletedCount
//     });
//   } catch (error) {
//     console.error("Bulk delete error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

import Opportunity from "../models/Opportunity.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import { opportunities as storeOpportunities } from "../data/store.js";


/* =========================================
   GET ALL OPPORTUNITIES (STUDENT DASHBOARD)
========================================= */

export const getOpportunities = async (req, res) => {
  try {

    const opportunities = await Opportunity.find()
      .populate("postedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.json(opportunities);

  } catch (error) {
    console.error("Get opportunities error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



/* =========================================
   CREATE OPPORTUNITY
========================================= */

export const createOpportunity = async (req, res) => {
  try {

    const opportunityData = {
      ...req.body,
      postedBy: req.user?.id || null
    };

    Object.keys(opportunityData).forEach(key => {
      if (
        opportunityData[key] === "" ||
        opportunityData[key] === null ||
        opportunityData[key] === undefined
      ) {
        delete opportunityData[key];
      }
    });

    const opportunity = new Opportunity(opportunityData);

    await opportunity.save();

    // store also in express memory
    storeOpportunities.push(opportunity);

    const populatedOpportunity = await Opportunity.findById(opportunity._id)
      .populate("postedBy", "fullName email");

    res.status(201).json(populatedOpportunity);

  } catch (error) {

    console.error("Create opportunity error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message
    });

  }
};



/* =========================================
   UPDATE OPPORTUNITY
========================================= */

export const updateOpportunity = async (req, res) => {
  try {

    const { id } = req.params;

    const opportunity = await Opportunity.findByIdAndUpdate(
      id,
      req.body,
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



/* =========================================
   DELETE OPPORTUNITY
========================================= */

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

    console.error("Delete opportunity error:", error);
    res.status(500).json({ message: "Server error" });

  }
};



/* =========================================
   TOGGLE FEATURED OPPORTUNITY
========================================= */

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



/* =========================================
   DUPLICATE OPPORTUNITY
========================================= */

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
      applications: 0
    };

    const newOpportunity = new Opportunity(duplicateData);

    await newOpportunity.save();

    storeOpportunities.push(newOpportunity);

    res.status(201).json(newOpportunity);

  } catch (error) {

    console.error("Duplicate opportunity error:", error);
    res.status(500).json({ message: "Server error" });

  }
};



/* =========================================
   GET SINGLE OPPORTUNITY DETAILS
========================================= */

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
      .sort({ appliedDate: -1 });

    res.json({
      opportunity,
      applications
    });

  } catch (error) {

    console.error("Get opportunity details error:", error);
    res.status(500).json({ message: "Server error" });

  }
};



/* =========================================
   BULK UPDATE OPPORTUNITIES
========================================= */

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



/* =========================================
   BULK DELETE OPPORTUNITIES
========================================= */

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
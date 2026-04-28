import express from "express";
import Application from "../models/Application.js";
import Opportunity from "../models/Opportunity.js";
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
    // Error logging activity
  }
};

const router = express.Router();

/* Apply to opportunity */
router.post("/", async (req, res) => {
  try {
    const { opportunityId, student, name, email, phone, college, branch, year, portfolio, resume, coverLetter } = req.body;

    // Check if already applied
    const existingApplication = await Application.findOne({ 
      opportunity: opportunityId, 
      student: student 
    });
    
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied to this opportunity" });
    }

    const newApplication = new Application({
      opportunity: opportunityId,
      student: student || null,
      name,
      email,
      phone,
      college,
      branch,
      year,
      portfolio,
      resume,
      coverLetter,
      status: "Pending",
    });

    await newApplication.save();
    
    // Update opportunity application count
    await Opportunity.findByIdAndUpdate(opportunityId, { 
      $inc: { applications: 1 } 
    });
    
    // Get opportunity details for activity log
    const opportunity = await Opportunity.findById(opportunityId);
    
    // Log activity
    await logActivity(
      "apply",
      student,
      opportunityId,
      `New application submitted: ${name} applied for ${opportunity?.title}`,
      {
        studentName: name,
        studentEmail: email,
        opportunityTitle: opportunity?.title,
        organization: opportunity?.organization
      },
      "medium"
    );
    
    res.status(201).json(newApplication);
  } catch (error) {
        res.status(500).json({ 
      success: false, 
      message: "Error creating application" 
    });
  }
});

/* Get all student applications */
router.get("/", async (req, res) => {
  try {
    const { student } = req.query;
    
    let filter = {};
    if (student) {
      filter.student = student;
    }
    
    const dbApplications = await Application.find(filter)
      .populate("opportunity")
      .populate("student", "fullName email");
    
    res.json(dbApplications);
  } catch (error) {
        res.status(500).json({ message: "Error fetching applications" });
  }
});

/* Get single application */
router.get("/:id", async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate("opportunity");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Error fetching application" });
  }
});

export default router;
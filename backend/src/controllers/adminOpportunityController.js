

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
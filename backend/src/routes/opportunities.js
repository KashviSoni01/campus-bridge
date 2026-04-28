import express from "express";
import Opportunity from "../models/Opportunity.js";
import { opportunities as storeOpportunities } from "../data/store.js";

const router = express.Router();

/* GET all opportunities - for students */
router.get("/", async (req, res) => {
  try {
    const { category, search, domain, mode } = req.query;
    
    // Build filter
    let filter = { 
      status: "Active",
      deadline: { $gt: new Date() }
    };
    
    if (category) filter.category = category;
    if (domain) filter.domain = domain;
    if (mode) filter.mode = mode;
    
    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }
    
    const dbOpportunities = await Opportunity.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .populate("postedBy", "fullName");
    
    // Combine with store opportunities (filtered)
    const storeFiltered = storeOpportunities.filter(opp => 
      (!category || opp.category === category) &&
      (!domain || opp.domain === domain) &&
      (!mode || opp.mode === mode) &&
      (!search || opp.title.toLowerCase().includes(search.toLowerCase()) || 
                opp.description.toLowerCase().includes(search.toLowerCase()))
    );
    
    const allOpportunities = [...storeFiltered, ...dbOpportunities];
    res.json(allOpportunities);
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({ message: "Error fetching opportunities" });
  }
});

/* GET single opportunity */
router.get("/:id", async (req, res) => {
  try {
    // First check store
    let opportunity = storeOpportunities.find(o => o._id === req.params.id);
    if (!opportunity) {
      // Then check MongoDB
      opportunity = await Opportunity.findById(req.params.id)
        .populate("postedBy", "fullName email");
    }
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    
    // Increment view count for MongoDB opportunities
    if (opportunity._id && typeof opportunity._id === 'object') {
      await Opportunity.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    }
    
    res.json(opportunity);
  } catch (error) {
    console.error("Error fetching opportunity:", error);
    res.status(500).json({ message: "Error fetching opportunity" });
  }
});

/* CREATE opportunity (admin side if needed) */
router.post("/", async (req, res) => {
  try {
    const newOpp = new Opportunity(req.body);
    await newOpp.save();
    res.status(201).json(newOpp);
  } catch (error) {
    console.error("Error creating opportunity:", error);
    res.status(500).json({ message: "Error creating opportunity" });
  }
});

export default router;
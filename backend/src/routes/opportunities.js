import express from "express";
import Opportunity from "../models/Opportunity.js";

const router = express.Router();


/* GET all opportunities (with search & expired filter) */
router.get("/", async (req, res) => {
  try {
    const { search, includeExpired } = req.query;

    // Base filter: exclude expired by default
    const filter = {};
    if (!includeExpired || includeExpired !== "true") {
      filter.deadline = { $gte: new Date() };
    }

    // Search filter
    if (search && search.length > 0) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { organization: searchRegex },
        { category: searchRegex },
        { skills: searchRegex },
      ];
    }

    const dbOpportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    res.json(dbOpportunities);
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    res.status(500).json({ message: "Error fetching opportunities" });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);
    
    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }
    res.json(opportunity);
  } catch (error) {
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
    res.status(500).json({ message: "Error creating opportunity" });
  }
});

export default router;
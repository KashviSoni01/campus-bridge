import express from "express";
import Opportunity from "../models/Opportunity.js";
import { opportunities as storeOpportunities } from "../data/store.js";

const router = express.Router();

/* GET all opportunities */
router.get("/", async (req, res) => {
  try {
    const dbOpportunities = await Opportunity.find();
    const allOpportunities = [...storeOpportunities, ...dbOpportunities];
    res.json(allOpportunities);
  } catch (error) {
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
      opportunity = await Opportunity.findById(req.params.id);
    }
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
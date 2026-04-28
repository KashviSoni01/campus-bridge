import express from "express";
import SavedOpportunity from "../models/SavedOpportunity.js";

const router = express.Router();


/* Save opportunity */

router.post("/", async (req, res) => {
  try {
    const { opportunityId, studentId, ...rest } = req.body;
    
    // Check if already saved
    const existing = await SavedOpportunity.findOne({ opportunity: opportunityId, student: studentId || null });
    if (existing) {
      return res.status(400).json({ message: "Already saved" });
    }

    const newSave = new SavedOpportunity({
      opportunity: opportunityId,
      student: studentId || null,
      ...rest
    });

    await newSave.save();
    
    // We populate the opportunity so frontend gets the full object structure it expects
    const populatedSave = await SavedOpportunity.findById(newSave._id).populate("opportunity");
    
    // The frontend expects the full opportunity object but with an _id for the save
    res.status(201).json({
      _id: populatedSave._id,
      ...populatedSave.opportunity.toObject()
    });
  } catch (error) {
    res.status(500).json({ message: "Error saving opportunity" });
  }
});


/* Get saved opportunities */

router.get("/", async (req, res) => {
  try {
    const { student } = req.query;
    
    let filter = {};
    if (student) {
      filter.student = student;
    }
    
    const savedItems = await SavedOpportunity.find(filter).populate("opportunity");
    
    // Frontend expects array of opportunities with a save _id
    const formattedSaved = savedItems
      .filter(item => item.opportunity) // in case opportunity was deleted
      .map(item => ({
        ...item.opportunity.toObject(),
        _id: item._id // The ID of the save itself so they can delete it
      }));
      
    res.json(formattedSaved);
  } catch (error) {
    res.status(500).json({ message: "Error fetching saved opportunities" });
  }
});


/* Remove saved */

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await SavedOpportunity.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Saved item not found" });
    }

    res.json({ message: "Removed from saved" });
  } catch (error) {
    res.status(500).json({ message: "Error removing saved item" });
  }
});

export default router;
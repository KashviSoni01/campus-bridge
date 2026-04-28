import mongoose from "mongoose";

const savedOpportunitySchema = new mongoose.Schema({
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Opportunity",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Make false for now to support non-logged in users if the frontend uses it like that
  },
  // We can store duplicate info here if the frontend relies on full object, 
  // but it's better to populate it. Looking at how it was saved before: `saved.push({ id: ..., ...req.body })`
  // We'll store the object and populate the opportunity reference.
}, { timestamps: true });

const SavedOpportunity = mongoose.model("SavedOpportunity", savedOpportunitySchema);

export default SavedOpportunity;

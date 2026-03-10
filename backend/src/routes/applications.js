import express from "express";
import multer from "multer";
import Application from "../models/Application.js";
import { applications as storeApplications } from "../data/store.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" }); // Temporary storage for files

/* Apply to opportunity */
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const { opportunityId, name, email, phone, college, branch, year, portfolio } = req.body;
    const resume = req.file ? req.file.path : null;

    const newApplication = new Application({
      opportunity: opportunityId,
      name,
      email,
      phone,
      college,
      branch,
      year,
      portfolio,
      resume,
      status: "Pending",
    });

    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating application" });
  }
});

/* Get all student applications */
router.get("/", async (req, res) => {
  try {
    const dbApplications = await Application.find().populate("opportunity");
    const allApplications = [...storeApplications, ...dbApplications];
    res.json(allApplications);
  } catch (error) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});

/* Get single application */
router.get("/:id", async (req, res) => {
  try {
    let application = storeApplications.find(a => a.id === req.params.id);
    if (!application) {
      application = await Application.findById(req.params.id).populate("opportunity");
    }
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: "Error fetching application" });
  }
});

export default router;
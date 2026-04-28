import express from "express";
import { authenticate, isAdmin } from "../middleware/adminAuth.js";
import { getActivities, getActivityStats } from "../controllers/activityController.js";

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

router.get("/", getActivities);
router.get("/stats", getActivityStats);

export default router;

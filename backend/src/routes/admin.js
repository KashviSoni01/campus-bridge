import express from "express";
import { authenticate, isAdmin } from "../middleware/adminAuth.js";
import {
  getDashboardStats,
  getAnalytics,
  getUsers
} from "../controllers/adminDashboardController.js";
import {
  getOpportunities,
  getOpportunityDetails,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  toggleFeature,
  duplicateOpportunity,
  bulkUpdateOpportunities,
  bulkDeleteOpportunities
} from "../controllers/adminOpportunityController.js";

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/analytics", getAnalytics);
router.get("/users", getUsers);



router.get("/opportunities", getOpportunities);
router.post("/opportunities", createOpportunity);
router.get("/opportunities/:id", getOpportunityDetails);
router.put("/opportunities/:id", updateOpportunity);
router.delete("/opportunities/:id", deleteOpportunity);
router.put("/opportunities/:id/feature", toggleFeature);
router.post("/opportunities/:id/duplicate", duplicateOpportunity);
router.put("/opportunities/bulk-update", bulkUpdateOpportunities);
router.delete("/opportunities/bulk-delete", bulkDeleteOpportunities);

export default router;

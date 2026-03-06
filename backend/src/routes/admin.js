import express from "express";
import { authenticate, isAdmin } from "../middleware/adminAuth.js";
import {
  getDashboardStats,
  getAnalytics,
  getUsers,
  updateUserStatus
} from "../controllers/adminDashboardController.js";
import {
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  toggleFeature,
  duplicateOpportunity,
  getOpportunityDetails,
  bulkUpdateOpportunities,
  bulkDeleteOpportunities
} from "../controllers/adminOpportunityController.js";

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/analytics", getAnalytics);

router.get("/users", getUsers);
router.put("/users/:userId/status", updateUserStatus);

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

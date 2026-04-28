import express from "express";
import { authenticate, isAdmin } from "../middleware/adminAuth.js";
import {
  getDashboardStats,
  getAnalytics,
  getNotifications,
  getUsers,
  getApplications,
  getCalendarData
} from "../controllers/adminDashboardController.js";
import {
  getOpportunities,
  getOpportunityDetails,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  toggleFeature,
  duplicateOpportunity,
  incrementViews,
  softDeleteOpportunity,
  restoreOpportunity,
  extendDeadline,
  bulkUpdateOpportunities,
  bulkDeleteOpportunities
} from "../controllers/adminOpportunityController.js";

const router = express.Router();

router.use(authenticate);
router.use(isAdmin);

router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/analytics", getAnalytics);
router.get("/notifications", getNotifications);

router.get("/users", getUsers);

router.get("/applications", getApplications);

router.get("/calendar", getCalendarData);


router.get("/opportunities", getOpportunities);
router.post("/opportunities", createOpportunity);
router.get("/opportunities/:id", getOpportunityDetails);
router.put("/opportunities/:id", updateOpportunity);
router.delete("/opportunities/:id", deleteOpportunity);
router.put("/opportunities/:id/feature", toggleFeature);
router.post("/opportunities/:id/duplicate", duplicateOpportunity);
router.post("/opportunities/:id/views", incrementViews);
router.post("/opportunities/:id/soft-delete", softDeleteOpportunity);
router.post("/opportunities/:id/restore", restoreOpportunity);
router.put("/opportunities/:id/extend-deadline", extendDeadline);
router.put("/opportunities/bulk-update", bulkUpdateOpportunities);
router.delete("/opportunities/bulk-delete", bulkDeleteOpportunities);

export default router;

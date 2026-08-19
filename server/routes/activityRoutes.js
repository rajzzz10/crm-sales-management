import express from "express";

import {
  createActivity,
  getActivities,
  completeActivity,
} from "../controllers/activityController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getActivities);
router.post("/", createActivity);
router.patch("/:id/complete", completeActivity);

export default router;

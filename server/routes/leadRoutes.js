import express from "express";

import {
  createLead,
  getLeads,
  getLead,
  updateLead,
  assignLead,
  updateLeadStatus,
  addLeadNote,
  convertLead,
} from "../controllers/leadController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").get(getLeads).post(authorize("admin", "manager"), createLead);

router.get("/:id", getLead);

router.put("/:id", updateLead);

router.patch("/:id/assign", authorize("admin", "manager"), assignLead);

router.patch("/:id/status", updateLeadStatus);

router.post("/:id/notes", addLeadNote);

router.post("/:id/convert", convertLead);

export default router;

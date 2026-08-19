import express from "express";

import {
  getDeals,
  getDeal,
  updateDeal,
  updateDealStage,
} from "../controllers/dealController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getDeals);
router.get("/:id", getDeal);
router.put("/:id", updateDeal);
router.patch("/:id/stage", updateDealStage);

export default router;

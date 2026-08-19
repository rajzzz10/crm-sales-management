import express from "express";

import {
  getCustomers,
  getCustomer,
  updateCustomer,
} from "../controllers/customerController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.put("/:id", updateCustomer);

export default router;

import express from "express";

import { createUser, getUsers } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getUsers);
router.post("/", authorize("admin"), createUser);

export default router;

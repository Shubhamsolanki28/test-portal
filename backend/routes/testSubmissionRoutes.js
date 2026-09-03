import express from "express";
import authMiddleware, { requireStudent } from "../middleware/auth.js";

import {
  submitTest,
  getSubmissionById,
} from "../controllers/testSubmissionController.js";

const router = express.Router();

router.post("/", authMiddleware, requireStudent, submitTest);

router.get("/:id", authMiddleware, getSubmissionById);

export default router;
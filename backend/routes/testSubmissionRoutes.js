import express from "express";

import {
  submitTest,
  getSubmissionById,
} from "../controllers/testSubmissionController.js";

const router = express.Router();

router.post("/", submitTest);

router.get("/:id", getSubmissionById);

export default router;
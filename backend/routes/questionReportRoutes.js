import express from "express";

import {
    createQuestionReport,
    getQuestionReports,
    getQuestionReportById,
    updateQuestionReportStatus,
} from "../controllers/questionReportController.js";

const router = express.Router();


// Submit report
router.post("/", createQuestionReport);


// Get all reports
router.get("/", getQuestionReports);


// Get single report
router.get("/:id", getQuestionReportById);


// Update report status
router.patch("/:id/status", updateQuestionReportStatus);


export default router;
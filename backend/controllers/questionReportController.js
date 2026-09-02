import QuestionReport from "../models/QuestionReport.js";

// ==========================================
// CREATE QUESTION REPORT
// ==========================================

export const createQuestionReport = async (req, res) => {
  try {
    const { examId, questionId, examTitle, questionText, reason, description } =
      req.body;

    // Required fields
    if (!examId) {
      return res.status(400).json({
        success: false,
        message: "Exam ID is required",
      });
    }

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Report reason is required",
      });
    }

    const report = await QuestionReport.create({
      examId: String(examId),
      questionId: String(questionId),
      examTitle: examTitle || "",
      questionText: questionText || "",
      reason,
      description: description || "",
    });

    return res.status(201).json({
      success: true,
      message: "Question report submitted successfully",
      report,
    });
  } catch (error) {
    console.error("CREATE QUESTION REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit question report",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL REPORTS
// ==========================================

export const getQuestionReports = async (req, res) => {
  try {
    const reports = await QuestionReport.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error("GET QUESTION REPORTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch question reports",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE REPORT
// ==========================================

export const getQuestionReportById = async (req, res) => {
  try {
    const report = await QuestionReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error("GET QUESTION REPORT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch report",
      error: error.message,
    });
  }
};

// ==========================================
// UPDATE REPORT STATUS
// ==========================================

export const updateQuestionReportStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Convert status to lowercase
    const normalizedStatus = String(status || "")
      .trim()
      .toLowerCase();

    const allowedStatuses = ["pending", "reviewed", "resolved"];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    const report = await QuestionReport.findByIdAndUpdate(
      req.params.id,
      {
        status: normalizedStatus,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      report,
    });
  } catch (error) {
    console.error("UPDATE QUESTION REPORT STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update report status",
      error: error.message,
    });
  }
};

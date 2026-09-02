import Exam from "../models/Exam.js";
import Question from "../models/Question.js";

// Create Exam
export const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      marksPerQuestion,
      negativeMarks,
      subject,
    } = req.body;

    if (!title || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title and duration are required.",
      });
    }

    const exam = await Exam.create({
      title,
      description,
      duration,
      marksPerQuestion,
      negativeMarks,
      subject,
      totalQuestions: 0,
      questions: [],
      isPublished: false,
    });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create exam",
      error: error.message,
    });
  }
};


// Get All Exams
export const getExams = async (req, res) => {
  try {
    const exams = await Exam.find()
      .populate("questions")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
      error: error.message,
    });
  }
};


// Get Single Exam
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate("questions");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.status(200).json({
      success: true,
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch exam",
      error: error.message,
    });
  }
};


// Update Exam
export const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update exam",
      error: error.message,
    });
  }
};


// Delete Exam
export const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete exam",
      error: error.message,
    });
  }
};


// Add Question To Exam
export const addQuestionToExam = async (req, res) => {
  try {
    const { questionId } = req.body;

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Duplicate question prevent karo
    if (exam.questions.some((id) => id.toString() === questionId)) {
      return res.status(400).json({
        success: false,
        message: "Question already added to this exam.",
      });
    }

    exam.questions.push(questionId);

    exam.totalQuestions = exam.questions.length;

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Question added to exam successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add question to exam",
      error: error.message,
    });
  }
};


// Remove Question From Exam
export const removeQuestionFromExam = async (req, res) => {
  try {
    const { questionId } = req.body;

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    exam.questions = exam.questions.filter(
      (id) => id.toString() !== questionId
    );

    exam.totalQuestions = exam.questions.length;

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Question removed from exam successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove question from exam",
      error: error.message,
    });
  }
};


// Publish / Unpublish Exam
export const toggleExamPublish = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    exam.isPublished = !exam.isPublished;

    await exam.save();

    res.status(200).json({
      success: true,
      message: exam.isPublished
        ? "Exam published successfully"
        : "Exam unpublished successfully",
      exam,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update exam status",
      error: error.message,
    });
  }
};
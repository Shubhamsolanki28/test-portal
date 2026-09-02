import Question from "../models/Question.js";
import Exam from "../models/Exam.js";

// Create Question
// Create Question
export const createQuestion = async (req, res) => {
  try {
    let {
      questionText,
      questionImage,
      options,
      correctAnswer,
      marks,
      negativeMarks,
      subject,
      difficulty,
    } = req.body;

    // FormData se options string aa sakta hai
    if (typeof options === "string") {
      try {
        options = JSON.parse(options);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid options format.",
        });
      }
    }

    // FormData values strings hoti hain
    correctAnswer = Number(correctAnswer);
    marks = Number(marks);
    negativeMarks = Number(negativeMarks);

    // Options validation
    if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Question must have between 2 and 5 options.",
      });
    }

    // Empty option validation
    if (options.some((option) => !String(option).trim())) {
      return res.status(400).json({
        success: false,
        message: "All options are required.",
      });
    }

    // Correct answer validation
    if (
      !Number.isInteger(correctAnswer) ||
      correctAnswer < 0 ||
      correctAnswer >= options.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid correct answer.",
      });
    }

    const question = await Question.create({
      questionText,
      questionImage: questionImage || "",
      options,
      correctAnswer,
      marks,
      negativeMarks,
      subject,
      difficulty: difficulty || "Medium",
    });

    res.status(201).json({
      success: true,
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create question",
      error: error.message,
    });
  }
};

// Get All Questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions",
      error: error.message,
    });
  }
};

// Get Single Question
export const getQuestionById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch question",
      error: error.message,
    });
  }
};

// Update Question
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      question,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update question",
      error: error.message,
    });
  }
};

// Delete Question
export const deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.id;

    // Check if question exists
    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // Check if question is being used in any exam
    const examUsingQuestion = await Exam.findOne({
      questions: questionId,
    });

    if (examUsingQuestion) {
      return res.status(409).json({
        success: false,
        message:
          "This question is currently used in an exam. Remove it from the exam first.",
        exam: {
          id: examUsingQuestion._id,
          title: examUsingQuestion.title,
        },
      });
    }

    // Delete question
    await Question.findByIdAndDelete(questionId);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete question",
      error: error.message,
    });
  }
};

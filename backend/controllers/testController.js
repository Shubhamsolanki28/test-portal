import Test from "../models/Test.js";
import Question from "../models/Question.js";

// =====================================================
// CREATE TEST
// =====================================================

export const createTest = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      duration,
      marksPerQuestion,
      negativeMarks,
    } = req.body;

    if (!title || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title and duration are required.",
      });
    }

    const test = await Test.create({
      title: title.trim(),
      description: description || "",
      subject: subject || "",
      duration: Number(duration),
      marksPerQuestion:
        marksPerQuestion !== undefined ? Number(marksPerQuestion) : 1,
      negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0,
      totalQuestions: 0,
      questions: [],
      isPublished: false,
    });

    return res.status(201).json({
      success: true,
      message: "Test created successfully",
      test,
    });
  } catch (error) {
    console.error("CREATE TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create test",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL TESTS
// =====================================================

export const getTests = async (req, res) => {
  try {
    const tests = await Test.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tests,
    });
  } catch (error) {
    console.error("GET TESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tests",
      error: error.message,
    });
  }
};

// Get Test By ID
export const getTestById = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate("questions");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      test,
    });
  } catch (error) {
    console.error("GET TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch test",
      error: error.message,
    });
  }
};

// Update Test
export const updateTest = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      duration,
      marksPerQuestion,
      negativeMarks,
    } = req.body;

    if (!title || !duration) {
      return res.status(400).json({
        success: false,
        message: "Title and duration are required.",
      });
    }

    const test = await Test.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        description: description || "",
        subject: subject || "",
        duration: Number(duration),
        marksPerQuestion:
          marksPerQuestion !== undefined ? Number(marksPerQuestion) : 1,
        negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test updated successfully",
      test,
    });
  } catch (error) {
    console.error("UPDATE TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update test",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE TEST
// =====================================================

export const deleteTest = async (req, res) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Test deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete test",
      error: error.message,
    });
  }
};

// =====================================================
// PUBLISH / UNPUBLISH TEST
// =====================================================

export const toggleTestPublish = async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    test.isPublished = !test.isPublished;

    await test.save();

    return res.status(200).json({
      success: true,
      message: test.isPublished
        ? "Test published successfully"
        : "Test unpublished successfully",
      test,
    });
  } catch (error) {
    console.error("TOGGLE TEST PUBLISH ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update test status",
      error: error.message,
    });
  }
};
// Add Question to Test
export const addQuestionToTest = async (req, res) => {
  try {
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required",
      });
    }

    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    // Prevent duplicate question
    if (test.questions.some((id) => id.toString() === questionId)) {
      return res.status(400).json({
        success: false,
        message: "Question already added to this test",
      });
    }

    test.questions.push(questionId);
    test.totalQuestions = test.questions.length;

    await test.save();

    const updatedTest = await Test.findById(test._id).populate("questions");

    return res.status(200).json({
      success: true,
      message: "Question added successfully",
      test: updatedTest,
    });
  } catch (error) {
    console.error("ADD QUESTION TO TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add question",
      error: error.message,
    });
  }
};
// Remove Question from Test
export const removeQuestionFromTest = async (req, res) => {
  try {
    const { questionId } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        message: "Question ID is required",
      });
    }

    const test = await Test.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    test.questions = test.questions.filter(
      (id) => id.toString() !== questionId.toString(),
    );

    test.totalQuestions = test.questions.length;

    await test.save();

    const updatedTest = await Test.findById(test._id).populate("questions");

    return res.status(200).json({
      success: true,
      message: "Question removed successfully",
      test: updatedTest,
    });
  } catch (error) {
    console.error("REMOVE QUESTION FROM TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to remove question",
      error: error.message,
    });
  }
};

// Get Published Tests
export const getPublishedTests = async (req, res) => {
  try {
    const tests = await Test.find({
      isPublished: true,
    })
      .populate("questions")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      tests,
    });
  } catch (error) {
    console.error("GET PUBLISHED TESTS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch published tests",
      error: error.message,
    });
  }
};

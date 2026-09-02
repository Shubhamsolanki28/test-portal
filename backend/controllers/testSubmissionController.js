import Test from "../models/Test.js";
import TestSubmission from "../models/TestSubmission.js";

export const submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;

    if (!testId) {
      return res.status(400).json({
        success: false,
        message: "Test ID is required",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    // Find test with its questions
    const test = await Test.findById(testId).populate("questions");

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found",
      });
    }

    let answered = 0;
    let correct = 0;
    let incorrect = 0;
    let notAnswered = 0;
    let obtainedMarks = 0;

    const processedAnswers = [];

    for (const question of test.questions) {
      const submittedAnswer = answers.find(
        (answer) => answer.questionId?.toString() === question._id.toString(),
      );

      const selectedAnswer =
        submittedAnswer &&
        submittedAnswer.selectedAnswer !== null &&
        submittedAnswer.selectedAnswer !== undefined
          ? Number(submittedAnswer.selectedAnswer)
          : null;

      // Not answered
      if (selectedAnswer === null || Number.isNaN(selectedAnswer)) {
        notAnswered++;

        processedAnswers.push({
          question: question._id,
          selectedAnswer: null,
          isCorrect: false,
          marksObtained: 0,
        });

        continue;
      }

      answered++;

      // Correct answer
      if (selectedAnswer === question.correctAnswer) {
        correct++;

        const marks = Number(question.marks ?? test.marksPerQuestion ?? 1);

        obtainedMarks += marks;

        processedAnswers.push({
          question: question._id,
          selectedAnswer,
          isCorrect: true,
          marksObtained: marks,
        });
      }

      // Wrong answer
      else {
        incorrect++;

        const negativeMarks = Number(
          question.negativeMarks ?? test.negativeMarks ?? 0,
        );

        obtainedMarks -= negativeMarks;

        processedAnswers.push({
          question: question._id,
          selectedAnswer,
          isCorrect: false,
          marksObtained: -negativeMarks,
        });
      }
    }

    const totalQuestions = test.questions.length;

    const totalMarks = totalQuestions * Number(test.marksPerQuestion ?? 1);

    const percentage =
      totalMarks > 0 ? Math.max(0, (obtainedMarks / totalMarks) * 100) : 0;

    // Save submission in MongoDB
    const submission = await TestSubmission.create({
      test: test._id,
      answers: processedAnswers,
      totalQuestions,
      answered,
      correct,
      incorrect,
      notAnswered,
      totalMarks,
      obtainedMarks: Number(obtainedMarks.toFixed(2)),
      percentage: Number(percentage.toFixed(2)),
    });

    const populatedSubmission = await TestSubmission.findById(
      submission._id,
    ).populate("answers.question");

    return res.status(201).json({
      success: true,
      message: "Test submitted successfully",

      result: {
        submissionId: populatedSubmission._id,
        testId: test._id,
        testTitle: test.title,
        totalQuestions,
        answered,
        correct,
        incorrect,
        notAnswered,
        totalMarks,
        obtainedMarks: Number(obtainedMarks.toFixed(2)),
        percentage: Number(percentage.toFixed(2)),
        answers: populatedSubmission.answers,
      },
    });
  } catch (error) {
    console.error("SUBMIT TEST ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit test",
      error: error.message,
    });
  }
};
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await TestSubmission.findById(id)
      .populate("test")
      .populate("answers.question");

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    return res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("GET SUBMISSION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch submission",
      error: error.message,
    });
  }
};

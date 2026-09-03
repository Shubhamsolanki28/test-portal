import { query } from "../config/db.js";

export const submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const studentId = req.user?.id || null;

    if (!testId) return res.status(400).json({ success: false, message: "Test ID is required" });
    if (!Array.isArray(answers)) return res.status(400).json({ success: false, message: "Answers must be an array" });

    // Fetch test
    const testResult = await query(`SELECT * FROM tests WHERE id = $1`, [testId]);
    if (testResult.rows.length === 0) return res.status(404).json({ success: false, message: "Test not found" });
    const test = testResult.rows[0];

    // Fetch questions
    const questionsResult = await query(
      `SELECT q.* FROM test_questions_db q JOIN test_questions tq ON q.id = tq.question_id WHERE tq.test_id = $1`,
      [testId]
    );
    const questions = questionsResult.rows;

    let answered = 0, correct = 0, incorrect = 0, notAnswered = 0, obtainedMarks = 0;
    const processedAnswers = [];

    for (const question of questions) {
      const submittedAnswer = answers.find((ans) => String(ans.questionId) === String(question.id));
      const selectedAnswer = submittedAnswer && submittedAnswer.selectedAnswer !== null && submittedAnswer.selectedAnswer !== undefined
          ? Number(submittedAnswer.selectedAnswer) : null;

      if (selectedAnswer === null || Number.isNaN(selectedAnswer)) {
        notAnswered++;
        processedAnswers.push({ question: question.id, selectedAnswer: null, isCorrect: false, marksObtained: 0 });
        continue;
      }

      answered++;

      if (selectedAnswer === question.correct_answer) {
        correct++;
        const marks = Number(question.marks ?? test.marks_per_question ?? 1);
        obtainedMarks += marks;
        processedAnswers.push({ question: question.id, selectedAnswer, isCorrect: true, marksObtained: marks });
      } else {
        incorrect++;
        const negativeMarks = Number(question.negative_marks ?? test.negative_marks ?? 0);
        obtainedMarks -= negativeMarks;
        processedAnswers.push({ question: question.id, selectedAnswer, isCorrect: false, marksObtained: -negativeMarks });
      }
    }

    const totalQuestions = questions.length;
    const totalMarks = totalQuestions * Number(test.marks_per_question ?? 1);
    const percentage = totalMarks > 0 ? Math.max(0, (obtainedMarks / totalMarks) * 100) : 0;

    const submissionResult = await query(
      `INSERT INTO test_submissions 
       (test_id, student_id, answers, total_questions, answered, correct, incorrect, not_answered, total_marks, obtained_marks, percentage)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        testId, studentId, JSON.stringify(processedAnswers), totalQuestions, answered, correct, incorrect, notAnswered,
        totalMarks, Number(obtainedMarks.toFixed(2)), Number(percentage.toFixed(2))
      ]
    );

    const submission = submissionResult.rows[0];

    return res.status(201).json({
      success: true,
      message: "Test submitted successfully",
      result: {
        submissionId: submission.id,
        testId: test.id,
        testTitle: test.title,
        totalQuestions,
        answered,
        correct,
        incorrect,
        notAnswered,
        totalMarks,
        obtainedMarks: submission.obtained_marks,
        percentage: submission.percentage,
        answers: processedAnswers,
      },
    });
  } catch (error) {
    console.error("SUBMIT TEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to submit test", error: error.message });
  }
};

export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const submissionResult = await query(`SELECT * FROM test_submissions WHERE id = $1`, [id]);
    
    if (submissionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }
    
    const submission = submissionResult.rows[0];
    
    // For simplicity, we just return the JSON answers as stored in the DB without deep population of questions.
    // If frontend requires populated question text, it would be another query.
    return res.status(200).json({ success: true, submission });
  } catch (error) {
    console.error("GET SUBMISSION ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch submission", error: error.message });
  }
};

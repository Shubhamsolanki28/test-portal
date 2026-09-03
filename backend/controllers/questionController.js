import { query } from "../config/db.js";

// Create Question
export const createQuestion = async (req, res) => {
  try {
    let { questionText, questionImage, options, correctAnswer, marks, negativeMarks, subject, difficulty } = req.body;

    if (typeof options === "string") {
      try { options = JSON.parse(options); } catch { return res.status(400).json({ success: false, message: "Invalid options format." }); }
    }

    correctAnswer = Number(correctAnswer);
    marks = Number(marks);
    negativeMarks = Number(negativeMarks);

    if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
      return res.status(400).json({ success: false, message: "Question must have between 2 and 5 options." });
    }
    if (options.some((option) => !String(option).trim())) {
      return res.status(400).json({ success: false, message: "All options are required." });
    }
    if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({ success: false, message: "Invalid correct answer." });
    }

    const result = await query(
      `INSERT INTO test_questions_db (question_text, question_image, options, correct_answer, marks, negative_marks, subject, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        questionText || "",
        questionImage || "",
        JSON.stringify(options),
        correctAnswer,
        marks || 1,
        negativeMarks || 0,
        subject || "General Awareness",
        difficulty || "Medium"
      ]
    );

    res.status(201).json({ success: true, message: "Question created successfully", question: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create question", error: error.message });
  }
};

// Get All Questions
export const getQuestions = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM test_questions_db ORDER BY created_at DESC`);
    res.status(200).json({ success: true, count: result.rows.length, questions: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch questions", error: error.message });
  }
};

// Get Single Question
export const getQuestionById = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM test_questions_db WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Question not found" });
    res.status(200).json({ success: true, question: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch question", error: error.message });
  }
};

// Update Question
export const updateQuestion = async (req, res) => {
  try {
    const existingResult = await query(`SELECT * FROM test_questions_db WHERE id = $1`, [req.params.id]);
    if (existingResult.rows.length === 0) return res.status(404).json({ success: false, message: "Question not found" });
    
    const existing = existingResult.rows[0];
    const { 
        questionText = existing.question_text, 
        questionImage = existing.question_image, 
        options = existing.options, 
        correctAnswer = existing.correct_answer, 
        marks = existing.marks, 
        negativeMarks = existing.negative_marks, 
        subject = existing.subject, 
        difficulty = existing.difficulty 
    } = req.body;

    const result = await query(
      `UPDATE test_questions_db SET 
       question_text = $1, question_image = $2, options = $3, correct_answer = $4, 
       marks = $5, negative_marks = $6, subject = $7, difficulty = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 RETURNING *`,
      [
        questionText,
        questionImage,
        JSON.stringify(options),
        Number(correctAnswer),
        Number(marks),
        Number(negativeMarks),
        subject,
        difficulty,
        req.params.id
      ]
    );

    res.status(200).json({ success: true, message: "Question updated successfully", question: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update question", error: error.message });
  }
};

// Delete Question
export const deleteQuestion = async (req, res) => {
  try {
    const checkResult = await query(`SELECT test_id FROM test_questions WHERE question_id = $1 LIMIT 1`, [req.params.id]);
    if (checkResult.rows.length > 0) {
      return res.status(409).json({ success: false, message: "This question is currently used in a test. Remove it from the test first." });
    }

    const result = await query(`DELETE FROM test_questions_db WHERE id = $1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Question not found" });

    res.status(200).json({ success: true, message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete question", error: error.message });
  }
};

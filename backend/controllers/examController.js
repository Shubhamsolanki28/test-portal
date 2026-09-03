import { query } from "../config/db.js";

// =====================================================
// CREATE EXAM
// =====================================================
export const createExam = async (req, res) => {
  try {
    const { title, description, subject, duration, marksPerQuestion, negativeMarks } = req.body;
    const createdBy = req.user?.id || null;

    if (!title || !duration) {
      return res.status(400).json({ success: false, message: "Title and duration are required." });
    }

    const result = await query(
      `INSERT INTO exams (title, description, subject, duration, marks_per_question, negative_marks, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        title.trim(),
        description || "",
        subject || "General Awareness",
        Number(duration),
        marksPerQuestion !== undefined ? Number(marksPerQuestion) : 1,
        negativeMarks !== undefined ? Number(negativeMarks) : 0,
        createdBy
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE EXAM ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to create exam", error: error.message });
  }
};

// =====================================================
// GET ALL EXAMS
// =====================================================
export const getExams = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM exams ORDER BY created_at DESC`);
    return res.status(200).json({ success: true, exams: result.rows, count: result.rows.length });
  } catch (error) {
    console.error("GET EXAMS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch exams", error: error.message });
  }
};

// =====================================================
// GET EXAM BY ID
// =====================================================
export const getExamById = async (req, res) => {
  try {
    const examResult = await query(`SELECT * FROM exams WHERE id = $1`, [req.params.id]);
    
    if (examResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Exam not found" });
    }
    
    const exam = examResult.rows[0];
    
    const questionsResult = await query(
      `SELECT q.* FROM test_questions_db q JOIN exam_questions eq ON q.id = eq.question_id WHERE eq.exam_id = $1`,
      [req.params.id]
    );
    exam.questions = questionsResult.rows;

    return res.status(200).json({ success: true, exam });
  } catch (error) {
    console.error("GET EXAM ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch exam", error: error.message });
  }
};

// =====================================================
// UPDATE EXAM
// =====================================================
export const updateExam = async (req, res) => {
  try {
    const { title, description, subject, duration, marksPerQuestion, negativeMarks } = req.body;
    const userId = req.user?.id;

    if (!title || !duration) return res.status(400).json({ success: false, message: "Title and duration are required." });

    const examCheck = await query(`SELECT * FROM exams WHERE id = $1`, [req.params.id]);
    if (examCheck.rows.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });
    if (String(examCheck.rows[0].created_by) !== String(userId) && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to update this exam" });
    }

    const result = await query(
      `UPDATE exams SET title = $1, description = $2, subject = $3, duration = $4, marks_per_question = $5, negative_marks = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *`,
      [
        title.trim(), description || "", subject || "", Number(duration),
        marksPerQuestion !== undefined ? Number(marksPerQuestion) : 1,
        negativeMarks !== undefined ? Number(negativeMarks) : 0,
        req.params.id
      ]
    );

    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });

    return res.status(200).json({ success: true, message: "Exam updated successfully", exam: result.rows[0] });
  } catch (error) {
    console.error("UPDATE EXAM ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update exam", error: error.message });
  }
};

// =====================================================
// DELETE EXAM
// =====================================================
export const deleteExam = async (req, res) => {
  try {
    const userId = req.user?.id;
    const examCheck = await query(`SELECT * FROM exams WHERE id = $1`, [req.params.id]);
    if (examCheck.rows.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });
    if (String(examCheck.rows[0].created_by) !== String(userId) && req.user?.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized to delete this exam" });
    }

    const result = await query(`DELETE FROM exams WHERE id = $1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });

    return res.status(200).json({ success: true, message: "Exam deleted successfully" });
  } catch (error) {
    console.error("DELETE EXAM ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to delete exam", error: error.message });
  }
};

// =====================================================
// PUBLISH / UNPUBLISH EXAM
// =====================================================
export const toggleExamPublish = async (req, res) => {
  try {
    const result = await query(`UPDATE exams SET is_published = NOT is_published, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });

    const exam = result.rows[0];
    return res.status(200).json({ success: true, message: exam.is_published ? "Exam published successfully" : "Exam unpublished successfully", exam });
  } catch (error) {
    console.error("TOGGLE EXAM PUBLISH ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update exam status", error: error.message });
  }
};

// =====================================================
// ADD QUESTION TO EXAM
// =====================================================
export const addQuestionToExam = async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ success: false, message: "Question ID is required" });

    await query(`INSERT INTO exam_questions (exam_id, question_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [req.params.id, questionId]);
    await query(`UPDATE exams SET total_questions = (SELECT count(*) FROM exam_questions WHERE exam_id = $1) WHERE id = $1`, [req.params.id]);

    const examResult = await query(`SELECT * FROM exams WHERE id = $1`, [req.params.id]);
    if (examResult.rows.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });

    const exam = examResult.rows[0];
    const questionsResult = await query(`SELECT q.* FROM test_questions_db q JOIN exam_questions eq ON q.id = eq.question_id WHERE eq.exam_id = $1`, [req.params.id]);
    exam.questions = questionsResult.rows;

    return res.status(200).json({ success: true, message: "Question added successfully", exam });
  } catch (error) {
    console.error("ADD QUESTION TO EXAM ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to add question to exam", error: error.message });
  }
};

// =====================================================
// REMOVE QUESTION FROM EXAM
// =====================================================
export const removeQuestionFromExam = async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ success: false, message: "Question ID is required" });

    await query(`DELETE FROM exam_questions WHERE exam_id = $1 AND question_id = $2`, [req.params.id, questionId]);
    await query(`UPDATE exams SET total_questions = (SELECT count(*) FROM exam_questions WHERE exam_id = $1) WHERE id = $1`, [req.params.id]);

    const examResult = await query(`SELECT * FROM exams WHERE id = $1`, [req.params.id]);
    if (examResult.rows.length === 0) return res.status(404).json({ success: false, message: "Exam not found" });

    const exam = examResult.rows[0];
    const questionsResult = await query(`SELECT q.* FROM test_questions_db q JOIN exam_questions eq ON q.id = eq.question_id WHERE eq.exam_id = $1`, [req.params.id]);
    exam.questions = questionsResult.rows;

    return res.status(200).json({ success: true, message: "Question removed successfully", exam });
  } catch (error) {
    console.error("REMOVE QUESTION FROM EXAM ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to remove question from exam", error: error.message });
  }
};
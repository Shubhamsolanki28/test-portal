import { query } from "../config/db.js";

// =====================================================
// CREATE TEST
// =====================================================
export const createTest = async (req, res) => {
  try {
    const { title, description, subject, duration, marksPerQuestion, negativeMarks } = req.body;
    const createdBy = req.user?.id || null;

    if (!title || !duration) {
      return res.status(400).json({ success: false, message: "Title and duration are required." });
    }

    const result = await query(
      `INSERT INTO tests (title, description, subject, duration, marks_per_question, negative_marks, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        title.trim(),
        description || "",
        subject || "",
        Number(duration),
        marksPerQuestion !== undefined ? Number(marksPerQuestion) : 1,
        negativeMarks !== undefined ? Number(negativeMarks) : 0,
        createdBy
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Test created successfully",
      test: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE TEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to create test", error: error.message });
  }
};

// =====================================================
// GET ALL TESTS
// =====================================================
export const getTests = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM tests ORDER BY created_at DESC`);
    return res.status(200).json({ success: true, tests: result.rows });
  } catch (error) {
    console.error("GET TESTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch tests", error: error.message });
  }
};

// =====================================================
// GET TEST BY ID
// =====================================================
export const getTestById = async (req, res) => {
  try {
    const testResult = await query(`SELECT * FROM tests WHERE id = $1`, [req.params.id]);
    
    if (testResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }
    
    const test = testResult.rows[0];
    
    // Fetch populated questions
    const questionsResult = await query(
      `SELECT q.* FROM test_questions_db q 
       JOIN test_questions tq ON q.id = tq.question_id 
       WHERE tq.test_id = $1`,
      [req.params.id]
    );
    
    test.questions = questionsResult.rows;

    return res.status(200).json({ success: true, test });
  } catch (error) {
    console.error("GET TEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch test", error: error.message });
  }
};

// =====================================================
// UPDATE TEST
// =====================================================
export const updateTest = async (req, res) => {
  try {
    const { title, description, subject, duration, marksPerQuestion, negativeMarks } = req.body;

    if (!title || !duration) {
      return res.status(400).json({ success: false, message: "Title and duration are required." });
    }

    const result = await query(
      `UPDATE tests SET 
        title = $1, description = $2, subject = $3, duration = $4, 
        marks_per_question = $5, negative_marks = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [
        title.trim(),
        description || "",
        subject || "",
        Number(duration),
        marksPerQuestion !== undefined ? Number(marksPerQuestion) : 1,
        negativeMarks !== undefined ? Number(negativeMarks) : 0,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    return res.status(200).json({ success: true, message: "Test updated successfully", test: result.rows[0] });
  } catch (error) {
    console.error("UPDATE TEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update test", error: error.message });
  }
};

// =====================================================
// DELETE TEST
// =====================================================
export const deleteTest = async (req, res) => {
  try {
    const result = await query(`DELETE FROM tests WHERE id = $1 RETURNING *`, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    return res.status(200).json({ success: true, message: "Test deleted successfully" });
  } catch (error) {
    console.error("DELETE TEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to delete test", error: error.message });
  }
};

// =====================================================
// PUBLISH / UNPUBLISH TEST
// =====================================================
export const toggleTestPublish = async (req, res) => {
  try {
    const result = await query(
      `UPDATE tests SET is_published = NOT is_published, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Test not found" });
    }

    const test = result.rows[0];
    return res.status(200).json({
      success: true,
      message: test.is_published ? "Test published successfully" : "Test unpublished successfully",
      test,
    });
  } catch (error) {
    console.error("TOGGLE TEST PUBLISH ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to update test status", error: error.message });
  }
};

// =====================================================
// ADD QUESTION TO TEST
// =====================================================
export const addQuestionToTest = async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ success: false, message: "Question ID is required" });

    // Insert into join table
    await query(`INSERT INTO test_questions (test_id, question_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [req.params.id, questionId]);
    
    // Update total_questions
    await query(
      `UPDATE tests SET total_questions = (SELECT count(*) FROM test_questions WHERE test_id = $1) WHERE id = $1`,
      [req.params.id]
    );

    // Fetch updated test with questions
    const testResult = await query(`SELECT * FROM tests WHERE id = $1`, [req.params.id]);
    if (testResult.rows.length === 0) return res.status(404).json({ success: false, message: "Test not found" });

    const test = testResult.rows[0];
    const questionsResult = await query(
      `SELECT q.* FROM test_questions_db q JOIN test_questions tq ON q.id = tq.question_id WHERE tq.test_id = $1`,
      [req.params.id]
    );
    test.questions = questionsResult.rows;

    return res.status(200).json({ success: true, message: "Question added successfully", test });
  } catch (error) {
    console.error("ADD QUESTION TO TEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to add question", error: error.message });
  }
};

// =====================================================
// REMOVE QUESTION FROM TEST
// =====================================================
export const removeQuestionFromTest = async (req, res) => {
  try {
    const { questionId } = req.body;
    if (!questionId) return res.status(400).json({ success: false, message: "Question ID is required" });

    // Delete from join table
    await query(`DELETE FROM test_questions WHERE test_id = $1 AND question_id = $2`, [req.params.id, questionId]);

    // Update total_questions
    await query(
      `UPDATE tests SET total_questions = (SELECT count(*) FROM test_questions WHERE test_id = $1) WHERE id = $1`,
      [req.params.id]
    );

    // Fetch updated test with questions
    const testResult = await query(`SELECT * FROM tests WHERE id = $1`, [req.params.id]);
    if (testResult.rows.length === 0) return res.status(404).json({ success: false, message: "Test not found" });

    const test = testResult.rows[0];
    const questionsResult = await query(
      `SELECT q.* FROM test_questions_db q JOIN test_questions tq ON q.id = tq.question_id WHERE tq.test_id = $1`,
      [req.params.id]
    );
    test.questions = questionsResult.rows;

    return res.status(200).json({ success: true, message: "Question removed successfully", test });
  } catch (error) {
    console.error("REMOVE QUESTION FROM TEST ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to remove question", error: error.message });
  }
};

// =====================================================
// GET PUBLISHED TESTS
// =====================================================
export const getPublishedTests = async (req, res) => {
  try {
    const testsResult = await query(`SELECT * FROM tests WHERE is_published = true ORDER BY created_at DESC`);
    
    // Postgres doesn't easily populate a join table for multiple rows at once without a subquery/json_agg
    // For simplicity, we can just return the tests or do a json_agg
    const tests = await Promise.all(testsResult.rows.map(async (test) => {
      const qRes = await query(`SELECT q.* FROM test_questions_db q JOIN test_questions tq ON q.id = tq.question_id WHERE tq.test_id = $1`, [test.id]);
      test.questions = qRes.rows;
      return test;
    }));

    return res.status(200).json({ success: true, tests });
  } catch (error) {
    console.error("GET PUBLISHED TESTS ERROR:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch published tests", error: error.message });
  }
};

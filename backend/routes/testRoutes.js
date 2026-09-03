import express from "express";
import authMiddleware, { requireTestCreator, requireStudent } from "../middleware/auth.js";

import {
  createTest,
  getTests,
  getTestById,
  updateTest,
  deleteTest,
  toggleTestPublish,
  addQuestionToTest,
  removeQuestionFromTest,
  getPublishedTests,
} from "../controllers/testController.js";

const router = express.Router();

/**
 * @swagger
 * /api/test-creation:
 *   post:
 *     summary: Create a new test
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               duration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Test created
 */
router.post("/", authMiddleware, requireTestCreator, createTest);

router.get("/", authMiddleware, requireTestCreator, getTests);

router.get("/published", authMiddleware, requireStudent, getPublishedTests);

router.get("/:id", authMiddleware, getTestById);

router.put("/:id", authMiddleware, requireTestCreator, updateTest);

router.delete("/:id", authMiddleware, requireTestCreator, deleteTest);

router.patch("/:id/publish", authMiddleware, requireTestCreator, toggleTestPublish);

router.post("/:id/questions", authMiddleware, requireTestCreator, addQuestionToTest);

router.delete("/:id/questions", authMiddleware, requireTestCreator, removeQuestionFromTest);



export default router;

import express from "express";

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

router.post("/", createTest);

router.get("/", getTests);

router.get("/published", getPublishedTests);

router.get("/:id", getTestById);

router.put("/:id", updateTest);

router.delete("/:id", deleteTest);

router.patch("/:id/publish", toggleTestPublish);

router.post("/:id/questions", addQuestionToTest);

router.delete("/:id/questions", removeQuestionFromTest);



export default router;
